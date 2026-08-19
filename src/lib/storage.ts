import type { SupabaseClient } from "@supabase/supabase-js";

export type StorageBucket = "avatars" | "post-covers";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function isUploadedFile(value: unknown): value is File {
  if (!value || typeof value !== "object") return false;
  const file = value as File;
  return (
    typeof file.arrayBuffer === "function" &&
    typeof file.size === "number" &&
    file.size > 0 &&
    typeof file.name === "string"
  );
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 8) return fromName.toLowerCase();
  const fromType = file.type.split("/")[1];
  return fromType || "jpg";
}

export async function uploadPublicFile(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  userId: string,
  file: File
) {
  if (!isUploadedFile(file)) {
    throw new Error("A valid image file is required");
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, WebP, GIF, or AVIF image");
  }

  const path = `${userId}/${crypto.randomUUID()}.${fileExtension(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteStorageObject(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path?: string | null
) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
