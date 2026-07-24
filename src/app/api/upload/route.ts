import { NextResponse } from "next/server";
import { callOpenArtTool, getOpenArtToken, isDemoFallbackEnabled } from "@/lib/openart-mcp";
import type { VisualReference } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const label = String(form.get("label") || "Upload");
    const purpose =
      String(form.get("purpose") || "create-image") === "create-video"
        ? "create-video"
        : "create-image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/png";
    const previewUrl = `data:${contentType};base64,${buffer.toString("base64")}`;

    if (!getOpenArtToken()) {
      if (!isDemoFallbackEnabled()) {
        return NextResponse.json(
          { error: "OPENART_ACCESS_TOKEN is required for uploads" },
          { status: 401 },
        );
      }

      const visualReference: VisualReference = {
        type: "image",
        id: `local-${Date.now()}`,
        url: previewUrl,
        label,
      };

      return NextResponse.json({
        previewUrl,
        remoteUrl: previewUrl,
        visualReference,
        demo: true,
      });
    }

    const signed = await callOpenArtTool<{
      signURL?: string;
      accessURL?: string;
      uploadId?: string;
      visualReference?: VisualReference;
    }>("openart_upload_sign", {
      mediaType: "image",
      size: buffer.byteLength,
      contentType,
      filename: file.name || `${label}.png`,
      label,
      purpose,
    });

    if (!signed.signURL || !signed.accessURL) {
      throw new Error("Failed to sign upload");
    }

    const put = await fetch(signed.signURL, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: buffer,
    });

    if (!put.ok) {
      throw new Error(`Upload failed with status ${put.status}`);
    }

    let visualReference =
      signed.visualReference ??
      ({
        type: "image",
        id: signed.uploadId || signed.accessURL,
        url: signed.accessURL,
        label,
      } satisfies VisualReference);

    try {
      const meta = await callOpenArtTool<{ visualReference?: VisualReference }>(
        "openart_upload_metadata_get",
        {
          mediaUrl: signed.accessURL,
          mediaType: "image",
          uploadId: signed.uploadId,
          label,
        },
      );
      if (meta.visualReference) visualReference = meta.visualReference;
    } catch {
      /* optional */
    }

    return NextResponse.json({
      previewUrl,
      remoteUrl: signed.accessURL,
      visualReference,
      demo: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
