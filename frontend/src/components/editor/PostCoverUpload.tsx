"use client";

import { Camera } from "@phosphor-icons/react";
import { Button } from "@heroui/react";
import { cn } from "../../lib/cn";

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
  const fileName = value instanceof File ? value.name : null;
  const displayUrl =
    previewUrl ?? (value instanceof File ? URL.createObjectURL(value) : null);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="inline-flex cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <Button variant="secondary">
          <span className="inline-flex items-center">
            <Camera className="mr-2 size-4" />
            Upload cover
          </span>
        </Button>
      </label>
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
