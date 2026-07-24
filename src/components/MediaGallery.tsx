"use client";

import { Check, Copy, Download, Film, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import type { MediaItem } from "@/lib/types";

interface MediaGalleryProps {
  items: MediaItem[];
}

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 backdrop-blur hover:bg-black/60"
      onClick={async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal-300" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}

export function MediaGallery({ items }: MediaGalleryProps) {
  return (
    <section className="fade-up fade-up-delay-3 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Media Gallery
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Recently generated images and videos
          </p>
        </div>
        <span className="text-xs text-[var(--muted)]">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.length === 0 ? (
        <div className="panel rounded-3xl border border-dashed border-[var(--stroke)] px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-teal-300">
            <Film className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-200">No generations yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your latest OpenArt results will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="panel group overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-video overflow-hidden bg-black/40">
                {item.status === "running" || item.status === "pending" ? (
                  <div className="shimmer absolute inset-0" />
                ) : item.type === "video" && item.url ? (
                  <video
                    src={item.url}
                    controls
                    playsInline
                    poster={item.thumbnailUrl}
                    className="h-full w-full object-cover"
                  />
                ) : item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--muted)]">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}

                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-100 backdrop-blur">
                    {item.type}
                  </span>
                  {item.demo ? (
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-100 backdrop-blur">
                      demo
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-200">
                  {item.prompt}
                </p>
                {item.error ? (
                  <p className="text-xs text-amber-200/90">{item.error}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <CopyPromptButton prompt={item.prompt} />
                  {item.url ? (
                    <a
                      href={item.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-400/10 px-3 py-1.5 text-xs font-medium text-teal-100 hover:bg-teal-400/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
