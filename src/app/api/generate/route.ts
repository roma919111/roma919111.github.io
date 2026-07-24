import { NextResponse } from "next/server";
import { generateMedia } from "@/lib/generation";
import { creditCost } from "@/lib/demo";
import type { GenerationRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerationRequest;

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!body.mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    if (body.mode === "image2video" && !body.startFrame) {
      return NextResponse.json(
        { error: "Start Frame is required for Image-to-Video" },
        { status: 400 },
      );
    }

    const cost = creditCost({
      mode: body.mode,
      duration: body.duration,
      quality: body.quality,
    });

    const { item, demo } = await generateMedia({
      ...body,
      prompt: body.prompt.trim(),
    });

    return NextResponse.json({
      ok: true,
      item,
      demo,
      creditsUsed: cost,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}
