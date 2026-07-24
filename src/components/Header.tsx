"use client";

import { Sparkles } from "lucide-react";

interface HeaderProps {
  credits: number;
  planLabel: string;
  onUpgrade: () => void;
}

export function Header({ credits, planLabel, onUpgrade }: HeaderProps) {
  return (
    <header className="fade-up flex flex-wrap items-center justify-between gap-4 border-b border-[var(--stroke)] pb-5">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-500 shadow-[0_0_28px_rgba(45,212,191,0.35)]">
          <Sparkles className="h-5 w-5 text-[#041016]" strokeWidth={2.4} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_45%)]" />
        </div>
        <div>
          <p
            className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Studio AI
          </p>
          <p className="text-xs text-[var(--muted)] sm:text-sm">
            OpenArt-powered image & video studio
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="panel rounded-full px-4 py-2 text-sm">
          <span className="text-[var(--muted)]">{planLabel} · </span>
          <span className="font-semibold text-teal-200">
            {credits} Free Credit{credits === 1 ? "" : "s"}
          </span>
        </div>
        <button
          type="button"
          onClick={onUpgrade}
          className="rounded-full border border-teal-300/30 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:border-teal-200/50 hover:bg-teal-400/20"
        >
          Upgrade / Buy Credits
        </button>
      </div>
    </header>
  );
}
