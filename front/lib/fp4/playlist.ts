/**
 * FP4 playlist builder and ring navigation.
 */

export type FsItem = { path: string; name: string; kind: "dir" | "file" };

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
const AUDIO_EXT = [".mp3"];
const VIDEO_EXT = [".mp4", ".webm"];

export function getExtensionsForMedia(media: "image" | "audio" | "video"): readonly string[] {
  if (media === "image") return IMAGE_EXT;
  if (media === "audio") return AUDIO_EXT;
  return VIDEO_EXT;
}

export function filterMediaItems(items: FsItem[], extensions: readonly string[]): FsItem[] {
  const extSet = new Set(extensions.map((e) => e.toLowerCase()));
  return items.filter((i) => {
    if (i.kind !== "file") return false;
    const ext = i.name.slice(i.name.lastIndexOf(".")).toLowerCase();
    return extSet.has(ext);
  });
}

export function sortByLocaleCompare(items: FsItem[]): FsItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function nextIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

export function prevIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current - 1 + length) % length;
}
