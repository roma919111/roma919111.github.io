"use client";

import { X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onAddCredits: () => void;
}

export function UpgradeModal({ open, onClose, onAddCredits }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="panel accent-ring relative w-full max-w-md rounded-3xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[var(--muted)] hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h3
          className="pr-8 text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Upgrade Studio AI
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Buy more credits for live OpenArt generations, or top up your local free
          balance for demo sessions. Connect{" "}
          <code className="text-teal-200">OPENART_ACCESS_TOKEN</code> for real MCP
          billing.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onAddCredits}
            className="btn-primary rounded-2xl px-4 py-3 text-sm"
          >
            Add 10 Free Credits
          </button>
          <a
            href="https://openart.ai"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[var(--stroke)] px-4 py-3 text-center text-sm font-semibold text-slate-100 hover:bg-white/5"
          >
            Visit OpenArt Plans
          </a>
        </div>
      </div>
    </div>
  );
}
