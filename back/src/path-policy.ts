/**
 * FP3 Path Policy — write allow/deny per API_FP3_DELTA.
 * Allow write: C:/My Documents/** only.
 * Deny: C:/WINDOWS/**, C:/Program Files/**, A:/**, D:/**, boot files, Recycled, Temporary Internet Files.
 */

const WRITABLE_PREFIX = "My Documents/";

export type WriteCheckResult =
  | { ok: true }
  | { ok: false; code: "POLICY_VIOLATION"; message: string };

/**
 * Check if a path (API format /@root/DISK_C/...) is writable for create/upload/delete/rename.
 * Allow: C:/My Documents/** only.
 */
export function checkWritable(rootId: string, suffix: string): WriteCheckResult {
  if (rootId === "DISK_A" || rootId === "DISK_D") {
    return { ok: false, code: "POLICY_VIOLATION", message: "Root is read-only" };
  }
  if (rootId !== "DISK_C") {
    return { ok: false, code: "POLICY_VIOLATION", message: "Root not writable" };
  }
  const norm = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!norm.startsWith(WRITABLE_PREFIX) && norm !== "My Documents") {
    return {
      ok: false,
      code: "POLICY_VIOLATION",
      message: "Write allowed only under C:/My Documents/",
    };
  }
  return { ok: true };
}

/**
 * Validate rename: same-parent only. dirname(fromPath) must equal dirname(toPath).
 */
export function validateRenameSameParent(
  fromPath: string,
  toPath: string
): { ok: true } | { ok: false; code: "CROSS_PARENT"; message: string } {
  const dirFrom = fromPath.replace(/\/[^/]+$/, "").replace(/\/$/, "") + "/";
  const dirTo = toPath.replace(/\/[^/]+$/, "").replace(/\/$/, "") + "/";
  if (dirFrom !== dirTo) {
    return {
      ok: false,
      code: "CROSS_PARENT",
      message: "Rename must stay in same parent (move not supported)",
    };
  }
  return { ok: true };
}
