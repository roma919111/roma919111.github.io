import { NextResponse } from "next/server";
import { enhancePrompt } from "@/lib/generation";
import type { GenerationMode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      mode?: GenerationMode;
    };

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const mode = body.mode ?? "text2image";
    const enhanced = await enhancePrompt(prompt, mode);
    return NextResponse.json({ prompt: enhanced });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enhance failed" },
      { status: 500 },
    );
  }
}
