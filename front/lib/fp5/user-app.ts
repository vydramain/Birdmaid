/**
 * FP5: User app path validation and routing.
 * User app = dir with index.html in writable root (not Program Files).
 */

const SYSTEM_APP_PREFIX = "/@root/DISK_C/Program Files/";
const WRITABLE_ROOTS = ["DISK_A", "DISK_C", "DISK_D"];

/**
 * Returns true if path is a user app package (writable root, not Program Files).
 */
export function isUserAppPath(path: string | undefined): boolean {
  if (!path || typeof path !== "string") return false;
  const normalized = path.replace(/\/$/, "") + "/";
  if (normalized.startsWith(SYSTEM_APP_PREFIX)) return false;
  if (!normalized.startsWith("/@root/")) return false;
  const parts = normalized.slice(7).split("/");
  const rootId = parts[0];
  if (!WRITABLE_ROOTS.includes(rootId)) return false;
  return true;
}

/**
 * Build hosted route URL for user app package.
 * Path in URL path (not query) so relative assets resolve correctly.
 */
export function buildUserAppSrc(canonicalPath: string): string {
  const path = canonicalPath.endsWith("/") ? canonicalPath : canonicalPath + "/";
  return `/apps/user/pkg/${encodeURIComponent(path)}/`;
}
