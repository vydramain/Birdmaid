/**
 * FP3.1 M7: upload-file allowlist (ext + mime).
 * API_FP3_DELTA: png/jpg/webp/mp3/mp4/webm -> 415 if disallowed.
 */

const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".mp3",
  ".mp4",
  ".webm",
  ".html",
  ".htm",
  ".txt",
]);
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

export function checkUploadAllowlist(
  filename: string,
  mimetype: string
): { ok: true } | { ok: false; code: "UNSUPPORTED_MEDIA"; message: string } {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA",
      message: `Extension ${ext || "(none)"} not allowed`,
    };
  }
  const mime = (mimetype || "").toLowerCase().split(";")[0].trim();
  if (!mime || !ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA",
      message: `MIME ${mime || "(none)"} not allowed`,
    };
  }
  return { ok: true };
}
