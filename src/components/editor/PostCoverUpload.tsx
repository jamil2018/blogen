"use client";

import { useRef } from "react";
import { Camera } from "@phosphor-icons/react";
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
  const fileName = value instanceof File ? value.name : null;
  const displayUrl =
    previewUrl ?? (value instanceof File ? URL.createObjectURL(value) : null);

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={COVER_ACCEPT}
        aria-label="Cover image"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="secondary"
        onPress={() => inputRef.current?.click()}
      >
        <span className="inline-flex items-center">
          <Camera className="mr-2 size-4" />
          Upload cover
        </span>
      </Button>
      {fileName ? (
        <p className="text-xs text-muted">{fileName}</p>
      ) : null}
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Cover preview"
          className="max-h-48 rounded-lg object-cover"
        />
      ) : null}
    </div>
  );
}
