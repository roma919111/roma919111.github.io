"use client";

import { Loader2, Zap } from "lucide-react";
import type { GenerationMode } from "@/lib/types";

interface GenerateButtonProps {
  mode: GenerationMode;
  loading: boolean;
  cost: number;
  disabled?: boolean;
  onClick: () => void;
}

export function GenerateButton({
  mode,
  loading,
  cost,
  disabled,
  onClick,
}: GenerateButtonProps) {
  const label =
    mode === "text2image" ? "Generate Image" : "Generate Video";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-primary flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base tracking-wide ${loading ? "generating" : ""}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Zap className="h-5 w-5" fill="currentColor" />
      )}
      <span>
        {loading ? "Generating…" : label}
        <span className="ml-2 text-sm font-semibold opacity-80">· {cost} credit{cost === 1 ? "" : "s"}</span>
      </span>
    </button>
  );
}
