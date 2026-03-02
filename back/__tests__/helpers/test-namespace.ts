/**
 * Test namespace policy — M0/M1/M2.
 * All tests that create S3 artifacts MUST use this helper.
 * Base path: C:/My Documents/.test/<runId>/
 */

const TEST_NAMESPACE_ROOT = "/@root/DISK_C/My Documents/.test/";

/**
 * Generate runId and basePath for test artifacts.
 * Tests MUST use this to avoid polluting My Documents root.
 */
export function getTestNamespace(): { runId: string; basePath: string } {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const basePath = `${TEST_NAMESPACE_ROOT}${runId}/`;
  return { runId, basePath };
}

/**
 * Base path for the test namespace root (for cleanup/list).
 */
export const TEST_NAMESPACE_BASE = TEST_NAMESPACE_ROOT;

type FetchFn = (path: string, opts?: RequestInit) => Promise<Response>;

/**
 * Recursively delete all objects under basePath via API.
 * Best effort — swallows errors so cleanup does not fail tests.
 */
export async function cleanupTestNamespace(
  fetchApi: FetchFn,
  basePath: string,
  writeHeaders: Record<string, string>
): Promise<void> {
  const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath)).catch(
    () => null
  );
  if (!listRes || listRes.status !== 200) return;
  const body = await listRes.json().catch(() => ({ items: [] }));
  const items = body.items ?? [];
  for (const item of items) {
    const path = item.path ?? basePath + (item.name ?? "") + (item.kind === "dir" ? "/" : "");
    if (item.kind === "dir") {
      await cleanupTestNamespace(fetchApi, path, writeHeaders);
    }
    await fetchApi("/api/fs/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...writeHeaders },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }
  await fetchApi("/api/fs/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...writeHeaders },
    body: JSON.stringify({ path: basePath }),
  }).catch(() => {});
}

/**
 * Remove pollution (fp3-test-*, fp4-test-*, fp3-upload-*) under a path.
 * Used to clean legacy pollution before M1-CLEAN assertion.
 */
export async function cleanupPollutionUnderPath(
  fetchApi: FetchFn,
  path: string,
  writeHeaders: Record<string, string>,
  prefixes: string[] = ["fp3-test-", "fp4-test-", "fp3-upload-"]
): Promise<void> {
  const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(path)).catch(() => null);
  if (!listRes || listRes.status !== 200) return;
  const body = await listRes.json().catch(() => ({ items: [] }));
  const items = body.items ?? [];
  for (const item of items) {
    const name = item.name ?? "";
    if (!prefixes.some((p) => name.startsWith(p))) continue;
    const itemPath = item.path ?? path + name + (item.kind === "dir" ? "/" : "");
    if (item.kind === "dir") {
      await cleanupTestNamespace(fetchApi, itemPath, writeHeaders);
    }
    await fetchApi("/api/fs/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...writeHeaders },
      body: JSON.stringify({ path: itemPath }),
    }).catch(() => {});
  }
}
