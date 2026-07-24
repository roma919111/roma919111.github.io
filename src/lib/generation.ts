import { callOpenArtTool, getOpenArtToken, isDemoFallbackEnabled } from "./openart-mcp";
import { createDemoMedia, creditCost, enhancePromptLocally } from "./demo";
import type {
  AccountSummary,
  GenerationMode,
  GenerationRequest,
  MediaItem,
  VisualReference,
} from "./types";

type GenerateToolResult = {
  historyId?: string;
  status?: string;
  [key: string]: unknown;
};

type WaitResult = {
  status?: string;
  pollAfterSeconds?: number;
  resources?: Array<{
    url?: string;
    type?: string;
    thumbnailUrl?: string;
    mediaType?: string;
  }>;
  url?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveMediaUrl(wait: WaitResult): { url?: string; thumbnailUrl?: string; type: "image" | "video" } {
  const resources = wait.resources ?? [];
  const first = resources[0];
  const url = first?.url || wait.url;
  const thumbnailUrl = first?.thumbnailUrl;
  const hint = (first?.type || first?.mediaType || "").toLowerCase();
  const type: "image" | "video" =
    hint.includes("video") || url?.match(/\.(mp4|webm|mov)(\?|$)/i) ? "video" : "image";
  return { url, thumbnailUrl, type };
}

async function waitForCreation(historyId: string, isVideo: boolean): Promise<WaitResult> {
  const maxAttempts = isVideo ? 8 : 4;
  let last: WaitResult = { status: "PENDING" };

  for (let i = 0; i < maxAttempts; i++) {
    last = await callOpenArtTool<WaitResult>("openart_creation_wait", {
      historyId,
      timeoutSeconds: isVideo ? 60 : 45,
    });

    const status = (last.status || "").toUpperCase();
    if (status === "COMPLETED" || status === "FAILED" || status === "CANCELLED") {
      return last;
    }

    const poll = typeof last.pollAfterSeconds === "number" ? last.pollAfterSeconds : 5;
    await sleep(Math.min(Math.max(poll, 2), 15) * 1000);
  }

  return last;
}

async function uploadDataUrlAsReference(
  dataUrl: string,
  label: string,
  purpose: "create-image" | "create-video",
): Promise<VisualReference> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const contentType = match[1]!;
  const buffer = Buffer.from(match[2]!, "base64");
  const ext = contentType.split("/")[1]?.split("+")[0] || "png";
  const filename = `${label.replace(/\s+/g, "-").toLowerCase()}.${ext}`;

  const signed = await callOpenArtTool<{
    signURL?: string;
    accessURL?: string;
    uploadId?: string;
    visualReference?: VisualReference;
  }>("openart_upload_sign", {
    mediaType: "image",
    size: buffer.byteLength,
    contentType,
    filename,
    label,
    purpose,
  });

  if (!signed.signURL || !signed.accessURL) {
    throw new Error("Failed to sign OpenArt upload");
  }

  const put = await fetch(signed.signURL, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buffer,
  });

  if (!put.ok) {
    throw new Error(`Upload PUT failed (${put.status})`);
  }

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
    if (meta.visualReference) return meta.visualReference;
  } catch {
    /* metadata may still be processing */
  }

  return (
    signed.visualReference ?? {
      type: "image",
      id: signed.uploadId || signed.accessURL,
      url: signed.accessURL,
      label,
    }
  );
}

function maybeDataUrl(ref?: VisualReference | null): string | null {
  if (!ref?.url) return null;
  return ref.url.startsWith("data:") ? ref.url : null;
}

export async function getAccountSummary(): Promise<AccountSummary> {
  if (!getOpenArtToken()) {
    return {
      credits: 10,
      plan: "Studio Free",
      source: "local",
      message: "Local free credits (set OPENART_ACCESS_TOKEN for live OpenArt balance).",
    };
  }

  try {
    const account = await callOpenArtTool<{
      user?: { email?: string };
      email?: string;
      plan?: string;
      credits?: number;
    }>("openart_account_get");

    return {
      email: account.user?.email || account.email,
      plan: account.plan || "Free",
      credits: typeof account.credits === "number" ? account.credits : 0,
      source: "openart",
    };
  } catch (error) {
    if (isDemoFallbackEnabled()) {
      return {
        credits: 10,
        plan: "Demo",
        source: "demo",
        message:
          error instanceof Error
            ? error.message
            : "Could not reach OpenArt; using demo credits.",
      };
    }
    throw error;
  }
}

export async function enhancePrompt(prompt: string, mode: GenerationMode): Promise<string> {
  return enhancePromptLocally(prompt, mode);
}

export async function generateMedia(request: GenerationRequest): Promise<{
  item: MediaItem;
  demo: boolean;
}> {
  const cost = creditCost({
    mode: request.mode,
    duration: request.duration,
    quality: request.quality,
  });

  const runLive = async (): Promise<MediaItem> => {
    let startFrame = request.startFrame ?? null;
    let referenceImage = request.referenceImage ?? null;

    const startData = maybeDataUrl(startFrame);
    if (startData) {
      startFrame = await uploadDataUrlAsReference(startData, "Start Frame", "create-video");
    }

    const refData = maybeDataUrl(referenceImage);
    if (refData) {
      referenceImage = await uploadDataUrlAsReference(
        refData,
        "Reference Image",
        request.mode === "text2image" ? "create-image" : "create-video",
      );
    }

    let toolName: "openart_generate_image" | "openart_generate_video";
    let model: string;
    let mode: string;
    let params: Record<string, unknown>;

    if (request.mode === "text2image") {
      toolName = "openart_generate_image";
      model = "nano-banana-2-lite";
      if (referenceImage) {
        mode = "image2image";
        params = {
          prompt: request.prompt,
          imageCount: 1,
          aspectRatio: request.aspectRatio || "1:1",
          visualReferences: [referenceImage],
        };
      } else {
        mode = "text2image";
        params = {
          prompt: request.prompt,
          imageCount: 1,
          aspectRatio: request.aspectRatio || "1:1",
        };
      }
    } else if (request.mode === "text2video") {
      toolName = "openart_generate_video";
      model = "pixverseV6";
      mode = "text2video";
      params = {
        prompt: request.prompt,
        videoCount: 1,
        duration: request.duration ?? 5,
        resolution: request.quality ?? "720p",
        aspectRatio: request.aspectRatio || "16:9",
        generateAudio: false,
      };
    } else {
      if (!startFrame) {
        throw new Error("Image-to-Video requires a Start Frame image.");
      }
      toolName = "openart_generate_video";
      model = "pixverseV6";
      mode = "image2video";
      params = {
        prompt: request.prompt,
        videoCount: 1,
        startFrame,
        duration: request.duration ?? 5,
        resolution: request.quality ?? "720p",
        generateAudio: false,
      };
    }

    const generated = await callOpenArtTool<GenerateToolResult>(toolName, {
      model,
      mode,
      params,
    });

    const historyId = generated.historyId;
    if (!historyId) {
      throw new Error("OpenArt did not return a historyId");
    }

    const isVideo = request.mode !== "text2image";
    const waited = await waitForCreation(historyId, isVideo);
    const status = (waited.status || "").toUpperCase();

    if (status === "FAILED" || status === "CANCELLED") {
      throw new Error(waited.error || waited.message || `Generation ${status.toLowerCase()}`);
    }

    if (status !== "COMPLETED") {
      return {
        id: historyId,
        historyId,
        type: isVideo ? "video" : "image",
        url: "",
        prompt: request.prompt,
        mode: request.mode,
        createdAt: new Date().toISOString(),
        status: "running",
        creditsUsed: cost,
      };
    }

    const media = resolveMediaUrl(waited);
    if (!media.url) {
      throw new Error("Generation completed but no media URL was returned");
    }

    return {
      id: historyId,
      historyId,
      type: isVideo ? "video" : media.type,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      prompt: request.prompt,
      mode: request.mode,
      createdAt: new Date().toISOString(),
      status: "completed",
      creditsUsed: cost,
    };
  };

  if (!getOpenArtToken()) {
    if (!isDemoFallbackEnabled()) {
      throw new Error("OPENART_ACCESS_TOKEN is required");
    }
    await sleep(900);
    return {
      item: createDemoMedia({
        mode: request.mode,
        prompt: request.prompt,
        creditsUsed: cost,
      }),
      demo: true,
    };
  }

  try {
    const item = await runLive();
    return { item, demo: false };
  } catch (error) {
    if (!isDemoFallbackEnabled()) throw error;
    await sleep(600);
    const item = createDemoMedia({
      mode: request.mode,
      prompt: request.prompt,
      creditsUsed: cost,
    });
    item.error =
      error instanceof Error
        ? `Live OpenArt failed (${error.message}). Showing demo media.`
        : "Live OpenArt failed. Showing demo media.";
    return { item, demo: true };
  }
}

export async function listCreations(limit = 12): Promise<MediaItem[]> {
  if (!getOpenArtToken()) return [];

  try {
    const listed = await callOpenArtTool<{
      items?: Array<{
        historyId?: string;
        id?: string;
        prompt?: string;
        mediaType?: string;
        status?: string;
        url?: string;
        thumbnailUrl?: string;
        createdAt?: string;
      }>;
    }>("openart_creation_list", { limit, mediaType: "all" });

    return (listed.items ?? [])
      .filter((item) => item.historyId || item.id)
      .map((item) => {
        const id = (item.historyId || item.id)!;
        const mediaType = (item.mediaType || "").toLowerCase();
        const type: "image" | "video" = mediaType.includes("video") ? "video" : "image";
        const statusRaw = (item.status || "completed").toLowerCase();
        const status =
          statusRaw.includes("fail")
            ? "failed"
            : statusRaw.includes("run") || statusRaw.includes("pend")
              ? "running"
              : "completed";

        return {
          id,
          historyId: id,
          type,
          url: item.url || "",
          thumbnailUrl: item.thumbnailUrl,
          prompt: item.prompt || "OpenArt creation",
          mode: type === "video" ? "text2video" : "text2image",
          createdAt: item.createdAt || new Date().toISOString(),
          status,
        } satisfies MediaItem;
      });
  } catch {
    return [];
  }
}
