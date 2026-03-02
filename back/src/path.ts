/**
 * Path validation and canonicalization per docs/dev/ARCHITECTURE.md (FS Path Scheme).
 * Order: decode → reject forbidden → normalize → length → root isolation.
 */

const MAX_LEN = 1024;
const ROOT_SCHEME = /^\/@root\/([^/]+)\/(.*)$/;

export type PathResult =
  | { ok: true; path: string; rootId: string; suffix: string }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string };

export function validatePath(
  raw: string | undefined,
  knownRoots: string[],
  requireDirTrailingSlash?: boolean
): PathResult {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, code: "BAD_PATH", message: "Path is required" };
  }

  let path: string;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return { ok: false, code: "BAD_PATH", message: "Invalid path encoding" };
  }

  if (path.includes("..") || path.includes("\\") || path.includes("//")) {
    return { ok: false, code: "BAD_PATH", message: "Invalid path" };
  }

  path = "/" + path.replace(/^\/+/, "").replace(/\/+/g, "/");
  if (path === "//") path = "/";

  if (requireDirTrailingSlash) {
    if (!path.endsWith("/")) path = path + "/";
  }

  if (path.length > MAX_LEN) {
    return { ok: false, code: "BAD_PATH", message: "Path too long" };
  }

  const m = path.match(ROOT_SCHEME);
  if (!m) {
    return { ok: false, code: "BAD_PATH", message: "Path must start with /@root/{ROOT_ID}/" };
  }

  const rootId = m[1];
  const suffix = m[2] ?? "";

  if (!knownRoots.includes(rootId)) {
    return { ok: false, code: "ROOT_NOT_FOUND", message: "Root not found" };
  }

  return { ok: true, path, rootId, suffix };
}

export function toS3Prefix(rootId: string, suffix: string): string {
  const clean = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  return `roots/${rootId}/${clean ? clean + "/" : ""}`;
}

export function toS3Key(rootId: string, suffix: string): string {
  const clean = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  return clean ? `roots/${rootId}/${clean}` : `roots/${rootId}`;
}
