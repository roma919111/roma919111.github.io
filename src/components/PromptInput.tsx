"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { GenerationMode } from "@/lib/types";

interface PromptInputProps {
  prompt: string;
  mode: GenerationMode;
  onChange: (value: string) => void;
  enhancing?: boolean;
  onEnhance: () => void;
}

export function PromptInput({
  prompt,
  mode,
  onChange,
  enhancing,
  onEnhance,
}: PromptInputProps) {
  const placeholder =
    mode === "text2image"
      ? "Describe the image you want to create…"
      : mode === "text2video"
        ? "Describe the video scene, camera move, and mood…"
        : "Describe how the start frame should come alive…";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label
          className="text-sm font-semibold tracking-wide text-slate-100"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Prompt
        </label>
        <button
          type="button"
          onClick={onEnhance}
          disabled={!prompt.trim() || enhancing}
          className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enhancing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Enhance Prompt with AI
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-2xl border border-[var(--stroke)] bg-black/25 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500"
      />
    </div>
  );
}
