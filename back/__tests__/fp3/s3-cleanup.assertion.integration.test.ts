/**
 * M0/M1: S3 cleanliness assertion.
 * Fails if fp3-test-* or fp4-test-* objects exist under C:/My Documents/ after tests.
 * Gate semantics: PASS only when system is clean.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 */

import { cleanupPollutionUnderPath, cleanupTestNamespace } from "../helpers/test-namespace";

const API_BASE = "http://api.shell.local";

const MY_DOCUMENTS_PATH = "/@root/DISK_C/My Documents/";

const WRITE_HEADERS = {
  "X-System-App": "explorer",
  "X-System-Token": "fp3-explorer-token",
};

const POLLUTION_PREFIXES = ["fp3-test-", "fp4-test-", "fp3-upload-"];

async function fetchApi(path: string, opts?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    return await fetch(`${API_BASE}${path}`, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function isPollution(name: string): boolean {
  return POLLUTION_PREFIXES.some((p) => name.startsWith(p));
}

describe("M0/M1: S3 cleanliness assertion", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
    await cleanupPollutionUnderPath(fetchApi, MY_DOCUMENTS_PATH, WRITE_HEADERS);
    // Clean .test/<runId>/ leftovers (guaranteed cleanup)
    const testNsPath = "/@root/DISK_C/My Documents/.test/";
    const nsRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(testNsPath));
    if (nsRes.status === 200) {
      const nsBody = await nsRes.json();
      for (const item of nsBody.items ?? []) {
        if (item.kind === "dir" && item.path)
          await cleanupTestNamespace(fetchApi, item.path, WRITE_HEADERS);
      }
    }
  });

  it("M1-CLEAN: no fp3-test-* or fp4-test-* objects under My Documents", async () => {
    const res = await fetchApi("/api/fs/list?path=" + encodeURIComponent(MY_DOCUMENTS_PATH));
    expect(res.status).toBe(200);
    const body = await res.json();
    const items = body.items ?? [];
    const pollution = items.filter((i: { name: string }) => isPollution(i.name));
    expect(pollution).toEqual(
      [],
      `S3 pollution: ${pollution.length} objects (fp3-test-*, fp4-test-*, fp3-upload-*) under My Documents. Run cleanup or use .test/<runId> namespace.`
    );
  });

  it("M3-NO-GITKEEP: no .gitkeep in roots/**", async () => {
    const roots = ["/@root/DISK_A/", "/@root/DISK_C/", "/@root/DISK_D/"];
    const gitkeepPaths: string[] = [];

    async function collectGitkeep(path: string): Promise<void> {
      const res = await fetchApi("/api/fs/list?path=" + encodeURIComponent(path));
      if (res.status !== 200) return;
      const body = await res.json();
      const items = body.items ?? [];
      for (const item of items) {
        if (item.name === ".gitkeep")
          gitkeepPaths.push(item.path ?? `${path.replace(/\/$/, "")}/${item.name}`);
        if (item.kind === "dir") await collectGitkeep(item.path ?? path + item.name + "/");
      }
    }

    for (const root of roots) await collectGitkeep(root);
    expect(gitkeepPaths).toEqual(
      [],
      `S3 .gitkeep pollution: ${gitkeepPaths.length} objects. minio-init must exclude .gitkeep.`
    );
  });

  it("M4-CLEAN: .test/<runId>/ removed (no leftover test namespace)", async () => {
    const testNsPath = "/@root/DISK_C/My Documents/.test/";
    const res = await fetchApi("/api/fs/list?path=" + encodeURIComponent(testNsPath));
    if (res.status !== 200) return;
    const body = await res.json();
    const items = body.items ?? [];
    for (const item of items) {
      if (item.kind === "dir" && item.path)
        await cleanupTestNamespace(fetchApi, item.path, WRITE_HEADERS);
    }
    const res2 = await fetchApi("/api/fs/list?path=" + encodeURIComponent(testNsPath));
    if (res2.status !== 200) return;
    const body2 = await res2.json();
    const items2 = body2.items ?? [];
    expect(items2).toEqual(
      [],
      `S3 .test/ namespace has ${items2.length} leftover runId folders after cleanup.`
    );
  });
});
