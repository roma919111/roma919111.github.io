export type GenerationMode = "text2image" | "text2video" | "image2video";

export type VideoDuration = 5 | 10;
export type VideoQuality = "720p" | "1080p";

export interface VisualReference {
  type: "image";
  id: string;
  url: string;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface UploadedImage {
  id: string;
  fileName: string;
  previewUrl: string;
  remoteUrl?: string;
  visualReference?: VisualReference;
}

export interface GenerationRequest {
  mode: GenerationMode;
  prompt: string;
  duration?: VideoDuration;
  quality?: VideoQuality;
  startFrame?: VisualReference | null;
  referenceImage?: VisualReference | null;
  aspectRatio?: string;
}

export interface MediaItem {
  id: string;
  historyId?: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  prompt: string;
  mode: GenerationMode;
  createdAt: string;
  status: "pending" | "running" | "completed" | "failed" | "demo";
  error?: string;
  demo?: boolean;
  creditsUsed?: number;
}

export interface AccountSummary {
  email?: string;
  plan?: string;
  credits: number;
  source: "openart" | "local" | "demo";
  message?: string;
}

export interface GenerateResponse {
  ok: boolean;
  item?: MediaItem;
  creditsRemaining?: number;
  error?: string;
  demo?: boolean;
}
