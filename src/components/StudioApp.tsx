"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { PromptInput } from "@/components/PromptInput";
import { ImageDropzone } from "@/components/ImageDropzone";
import { VideoControls } from "@/components/VideoControls";
import { GenerateButton } from "@/components/GenerateButton";
import { MediaGallery } from "@/components/MediaGallery";
import { UpgradeModal } from "@/components/UpgradeModal";
import { creditCost } from "@/lib/demo";
import type {
  GenerationMode,
  MediaItem,
  UploadedImage,
  VideoDuration,
  VideoQuality,
} from "@/lib/types";

const CREDITS_KEY = "studio-ai-credits";
const GALLERY_KEY = "studio-ai-gallery";
const DEFAULT_CREDITS = 10;

function loadCredits(): number {
  if (typeof window === "undefined") return DEFAULT_CREDITS;
  const raw = window.localStorage.getItem(CREDITS_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_CREDITS;
  return Number.isFinite(parsed) ? parsed : DEFAULT_CREDITS;
}

function loadGallery(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StudioApp() {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<GenerationMode>("text2image");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [quality, setQuality] = useState<VideoQuality>("720p");
  const [startFrame, setStartFrame] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  const [credits, setCredits] = useState(DEFAULT_CREDITS);
  const [planLabel, setPlanLabel] = useState("10 Free Credits");
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const cost = useMemo(
    () => creditCost({ mode, duration, quality }),
    [mode, duration, quality],
  );

  useEffect(() => {
    setCredits(loadCredits());
    setGallery(loadGallery());
    setHydrated(true);

    void (async () => {
      try {
        const res = await fetch("/api/account");
        const data = await res.json();
        if (data?.plan) {
          setPlanLabel(
            data.source === "openart"
              ? `${data.plan} plan`
              : data.source === "demo"
                ? "Demo mode"
                : "Studio Free",
          );
        }
        if (typeof data?.message === "string" && data.message) {
          setStatus(data.message);
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch("/api/creations?limit=12");
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setGallery((prev) => {
            const remote = data.items as MediaItem[];
            const map = new Map<string, MediaItem>();
            [...remote, ...prev].forEach((item) => map.set(item.id, item));
            return Array.from(map.values()).slice(0, 24);
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CREDITS_KEY, String(credits));
  }, [credits, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery.slice(0, 24)));
  }, [gallery, hydrated]);

  async function handleEnhance() {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enhance failed");
      setPrompt(data.prompt);
      setStatus("Prompt enhanced for stronger composition and detail.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Enhance failed");
    } finally {
      setEnhancing(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      setStatus("Write a prompt before generating.");
      return;
    }
    if (mode === "image2video" && !startFrame?.visualReference) {
      setStatus("Upload a Start Frame for Image-to-Video.");
      return;
    }
    if (credits < cost) {
      setStatus("Not enough credits. Upgrade or buy more credits.");
      setUpgradeOpen(true);
      return;
    }

    setGenerating(true);
    setStatus("Contacting OpenArt MCP…");

    // Optimistic local deduction; refunded on hard failure
    setCredits((c) => c - cost);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt,
          duration,
          quality,
          startFrame: startFrame?.visualReference ?? null,
          referenceImage: referenceImage?.visualReference ?? null,
          aspectRatio: mode === "text2image" ? "1:1" : "16:9",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.item) {
        setCredits((c) => c + cost);
        throw new Error(data.error || "Generation failed");
      }

      setGallery((prev) => [data.item as MediaItem, ...prev].slice(0, 24));
      setStatus(
        data.demo
          ? "Demo media ready (live OpenArt unavailable or unauthenticated)."
          : "Generation complete.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="studio-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Header
          credits={credits}
          planLabel={planLabel}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        <section className="fade-up space-y-3">
          <h1
            className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Craft cinematic stills and motion from a single studio.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Switch modes, refine your prompt, drop reference frames, and generate
            through the OpenArt MCP endpoint.
          </p>
        </section>

        <ModeSwitcher mode={mode} onChange={setMode} />

        <section className="fade-up fade-up-delay-2 panel accent-ring space-y-6 rounded-[28px] p-5 sm:p-7">
          <PromptInput
            prompt={prompt}
            mode={mode}
            onChange={setPrompt}
            enhancing={enhancing}
            onEnhance={handleEnhance}
          />

          <div
            className={`grid gap-4 ${mode === "image2video" ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
          >
            {mode === "image2video" ? (
              <ImageDropzone
                label="Start Frame"
                hint="This image becomes the first frame of the video."
                value={startFrame}
                purpose="create-video"
                required
                onChange={setStartFrame}
              />
            ) : null}

            <ImageDropzone
              label="Reference Image / Style"
              hint="Optional style or subject reference for stronger consistency."
              value={referenceImage}
              purpose={mode === "text2image" ? "create-image" : "create-video"}
              onChange={setReferenceImage}
            />
          </div>

          <VideoControls
            visible={mode !== "text2image"}
            duration={duration}
            quality={quality}
            onDurationChange={setDuration}
            onQualityChange={setQuality}
          />

          <GenerateButton
            mode={mode}
            loading={generating}
            cost={cost}
            disabled={!prompt.trim()}
            onClick={handleGenerate}
          />

          {status ? (
            <p className="rounded-2xl border border-[var(--stroke)] bg-black/20 px-4 py-3 text-sm text-slate-300">
              {status}
            </p>
          ) : null}
        </section>

        <MediaGallery items={gallery} />
      </main>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onAddCredits={() => {
          setCredits((c) => c + 10);
          setUpgradeOpen(false);
          setStatus("Added 10 free credits to your local balance.");
        }}
      />
    </div>
  );
}
