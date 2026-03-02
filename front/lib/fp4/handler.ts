/**
 * FP4 handler registry — MIME → app (ImageViewer | MediaPlayer).
 */

import mime from "mime";

export type HandlerResult =
  | { appId: "image-viewer" }
  | { appId: "media-player"; mode: "audio" | "video" }
  | { appId: "internet-explorer" };

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "video/mp4",
  "video/webm",
  "text/html",
  "text/plain",
]);

export function getHandlerForMime(mimeType: string): HandlerResult | null {
  if (!isAllowedMime(mimeType)) return null;
  if (mimeType.startsWith("image/")) return { appId: "image-viewer" };
  if (mimeType === "audio/mpeg") return { appId: "media-player", mode: "audio" };
  if (mimeType.startsWith("video/")) return { appId: "media-player", mode: "video" };
  if (mimeType === "text/html" || mimeType === "text/plain") return { appId: "internet-explorer" };
  return null;
}

export function getMimeForPath(path: string): string | null {
  const name = path.split("/").pop() ?? path;
  const mimeType = mime.getType(name);
  return mimeType && isAllowedMime(mimeType) ? mimeType : null;
}

export function isAllowedMime(mimeType: string): boolean {
  return ALLOWED_MIME.has(mimeType.toLowerCase().split(";")[0]?.trim() ?? "");
}
