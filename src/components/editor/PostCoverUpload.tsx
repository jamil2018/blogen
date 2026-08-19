"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Image as ImageIcon, X } from "@phosphor-icons/react";
import { Button } from "@heroui/react";
import { cn } from "../../lib/cn";

const COVER_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

type PostCoverUploadProps = {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
};

export default function PostCoverUpload({
  value,
  onChange,
  previewUrl,
  className,
}: PostCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const fileName = value instanceof File ? value.name : null;
  const displayUrl =
    localPreview ??
    previewUrl ??
    (value instanceof File ? URL.createObjectURL(value) : null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (localPreview) URL.revokeObjectURL(localPreview);
      if (file) {
        setLocalPreview(URL.createObjectURL(file));
      } else {
        setLocalPreview(null);
      }
      onChange(file);
    },
    [localPreview, onChange]
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">Cover image</p>
      <input
        ref={inputRef}
        type="file"
        accept={COVER_ACCEPT}
        aria-label="Cover image"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img
            src={displayUrl}
            alt="Cover preview"
            className="max-h-56 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-ink/60 to-transparent p-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              onPress={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full bg-paper/90"
              onPress={() => handleFile(null)}
            >
              <X className="mr-1 size-4" />
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
          )}
        >
          <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
            <ImageIcon className="size-6 text-muted" />
          </div>
          <p className="mt-3 text-sm font-medium">
            Drag and drop a cover image
          </p>
          <p className="mt-1 text-xs text-muted">
            PNG, JPG, WebP, GIF, or AVIF
          </p>
          <span className="mt-4 inline-flex items-center text-sm text-accent">
            <Camera className="mr-1.5 size-4" />
            Browse files
          </span>
        </button>
      )}

      {fileName ? (
        <p className="text-xs text-muted">{fileName}</p>
      ) : null}
    </div>
  );
}
