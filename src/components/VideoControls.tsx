"use client";

import type { VideoDuration, VideoQuality } from "@/lib/types";

interface VideoControlsProps {
  duration: VideoDuration;
  quality: VideoQuality;
  onDurationChange: (value: VideoDuration) => void;
  onQualityChange: (value: VideoQuality) => void;
  visible: boolean;
}

export function VideoControls({
  duration,
  quality,
  onDurationChange,
  onQualityChange,
  visible,
}: VideoControlsProps) {
  if (!visible) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-100">Video Duration</label>
        <select
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value) as VideoDuration)}
          className="w-full rounded-xl border border-[var(--stroke)] bg-black/30 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-100">
          Video Quality / Resolution
        </label>
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value as VideoQuality)}
          className="w-full rounded-xl border border-[var(--stroke)] bg-black/30 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value="720p">Standard 720p</option>
          <option value="1080p">Pro 1080p</option>
        </select>
      </div>
    </div>
  );
}
