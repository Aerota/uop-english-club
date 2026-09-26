/** Client-side image shrinking so stored photos stay tiny. */

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "posts";

export const HEADER_MAX_WIDTH = 1600;
export const PHOTO_MAX_WIDTH = 1200;

/** Resize and re-encode a picked image to WebP before upload. */
export async function compressImage(file: File, maxWidth: number): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((result) => resolve(result), "image/webp", 0.8),
  );
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall back to an <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Compress, upload, and return the stored path plus a display link. */
export async function uploadPostImage(
  file: File,
  groupId: string,
  maxWidth = PHOTO_MAX_WIDTH,
): Promise<{ path: string; url: string }> {
  const blob = await compressImage(file, maxWidth);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${groupId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || file.type,
    upsert: false,
  });
  if (error) throw error;

  const url = (await signPostPaths([path]))[path] ?? "";
  return { path, url };
}

/** Remove a stored post image so replaced files stop using storage. */
export async function deletePostImage(path?: string | null) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

/** Batch-sign stored post images for display. */
export async function signPostPaths(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return {};
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(unique, 60 * 60 * 24 * 7);
  const signed: Record<string, string> = {};
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) signed[entry.path] = entry.signedUrl;
  }
  return signed;
}

/** Stored values are bucket paths; plain links are used as-is. */
export function isStoredPostPath(value: string | null | undefined): value is string {
  return Boolean(value) && !/^https?:\/\//i.test(value as string) && !value!.startsWith("/");
}
