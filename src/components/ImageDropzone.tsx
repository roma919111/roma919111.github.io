"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { UploadedImage } from "@/lib/types";

interface ImageDropzoneProps {
  label: string;
  hint: string;
  value: UploadedImage | null;
  purpose?: "create-image" | "create-video";
  onChange: (value: UploadedImage | null) => void;
  required?: boolean;
}

export function ImageDropzone({
  label,
  hint,
  value,
  purpose = "create-image",
  onChange,
  required,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("label", label);
      form.append("purpose", purpose);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange({
        id: data.visualReference?.id || `upload-${Date.now()}`,
        fileName: file.name,
        previewUrl: data.previewUrl,
        remoteUrl: data.remoteUrl,
        visualReference: data.visualReference,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-100">
          {label}
          {required ? <span className="ml-1 text-rose-300">*</span> : null}
        </label>
        {value ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-rose-300"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      <div
        className="dropzone relative flex min-h-[148px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--stroke)] bg-black/20 px-4 py-6 text-center"
        data-active={dragging}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.previewUrl}
            alt={value.fileName}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-teal-300" />
          ) : (
            <ImagePlus className="h-6 w-6 text-teal-300" />
          )}
          <p className="text-sm font-medium text-white">
            {uploading ? "Uploading…" : value ? value.fileName : "Drop image or click to browse"}
          </p>
          <p className="max-w-[18rem] text-xs text-[var(--muted)]">{hint}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
