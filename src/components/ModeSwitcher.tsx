"use client";

import clsx from "clsx";
import { Clapperboard, ImageIcon, Wand2 } from "lucide-react";
import type { GenerationMode } from "@/lib/types";

const MODES: Array<{
  id: GenerationMode;
  label: string;
  description: string;
  icon: typeof ImageIcon;
}> = [
  {
    id: "text2image",
    label: "Text-to-Image",
    description: "Still frames from prompts",
    icon: ImageIcon,
  },
  {
    id: "text2video",
    label: "Text-to-Video",
    description: "Motion from text alone",
    icon: Clapperboard,
  },
  {
    id: "image2video",
    label: "Image-to-Video",
    description: "Animate a start frame",
    icon: Wand2,
  },
];

interface ModeSwitcherProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="fade-up fade-up-delay-1 panel accent-ring rounded-3xl p-2">
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={clsx(
                "mode-pill flex items-start gap-3 rounded-2xl px-4 py-3 text-left",
                !active && "text-[var(--muted)] hover:bg-white/5 hover:text-white",
              )}
              data-active={active}
              onClick={() => onChange(item.id)}
            >
              <span
                className={clsx(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  active ? "bg-teal-300/20 text-teal-200" : "bg-white/5 text-slate-300",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span
                  className="block text-sm font-semibold tracking-wide"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs opacity-80">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
