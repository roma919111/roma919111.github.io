import type { GenerationMode, MediaItem, VideoDuration, VideoQuality } from "./types";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83fe6a57388?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
];

const DEMO_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function createDemoMedia(input: {
  mode: GenerationMode;
  prompt: string;
  creditsUsed?: number;
}): MediaItem {
  const isVideo = input.mode !== "text2image";
  const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    historyId: id,
    type: isVideo ? "video" : "image",
    url: isVideo ? pick(DEMO_VIDEOS) : pick(DEMO_IMAGES),
    thumbnailUrl: isVideo ? pick(DEMO_IMAGES) : undefined,
    prompt: input.prompt,
    mode: input.mode,
    createdAt: new Date().toISOString(),
    status: "demo",
    demo: true,
    creditsUsed: input.creditsUsed ?? (isVideo ? 2 : 1),
  };
}

export function creditCost(options: {
  mode: GenerationMode;
  duration?: VideoDuration;
  quality?: VideoQuality;
}): number {
  if (options.mode === "text2image") return 1;
  const duration = options.duration ?? 5;
  const quality = options.quality ?? "720p";
  if (duration === 5 && quality === "720p") return 2;
  if (duration === 5 && quality === "1080p") return 3;
  if (duration === 10 && quality === "720p") return 3;
  return 4;
}

export function enhancePromptLocally(prompt: string, mode: GenerationMode): string {
  const trimmed = prompt.trim();
  if (!trimmed) return trimmed;

  const cinematic =
    "cinematic lighting, rich detail, coherent composition, high production value";
  const motion =
    "smooth camera motion, natural physics, temporal consistency, atmospheric depth";

  if (mode === "text2image") {
    return `${trimmed}. ${cinematic}, sharp focus, refined color grading.`;
  }

  return `${trimmed}. ${cinematic}, ${motion}.`;
}
