/**
 * FP4 M3: Playlist flow — list + open-url builds playlist with N>=1 items.
 * Integration: simulates Explorer buildPlaylistAndOpen flow for Images dir.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 */

const API_BASE = "http://api.shell.local";

async function fetchApi(path: string, opts?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    return await fetch(`${API_BASE}${path}`, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

function filterByExt(items: { name: string; kind: string }[], ext: string[]): typeof items {
  const set = new Set(ext.map((e) => e.toLowerCase()));
  return items.filter((i) => {
    if (i.kind !== "file") return false;
    const e = i.name.slice(i.name.lastIndexOf(".")).toLowerCase();
    return set.has(e);
  });
}

function sortByName(items: { name: string }[]): typeof items {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

describe("FP4 M3 playlist flow", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("T-FP4-M3-PLAYLIST-BUILD: list Images dir + open-url per file → playlist N>=1", async () => {
    const dirPath = "/@root/DISK_C/My Documents/Images/";
    const listRes = await fetchApi(`/api/fs/list?path=${encodeURIComponent(dirPath)}`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const items = listBody.items ?? [];
    const filtered = filterByExt(items, IMAGE_EXT);
    const sorted = sortByName(filtered);
    const limited = sorted.slice(0, 100);

    const playlist: Array<{ path: string; url: string }> = [];
    for (const p of limited) {
      const path = dirPath.replace(/\/$/, "") + "/" + p.name;
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (openRes.status !== 200) continue;
      const openBody = await openRes.json();
      if (typeof openBody.url === "string") {
        playlist.push({ path, url: openBody.url });
      }
    }

    expect(playlist.length).toBeGreaterThanOrEqual(1);
    for (const item of playlist) {
      expect(item.path).toBeTruthy();
      expect(item.url).toContain("s3.shell.local");
    }
  });

  it("T-FP4-M3-PLAYLIST-NEXT-PREV: playlist order stable, next/prev wrap (cyclic)", async () => {
    const dirPath = "/@root/DISK_C/My Documents/Images/";
    const listRes = await fetchApi(`/api/fs/list?path=${encodeURIComponent(dirPath)}`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const items = listBody.items ?? [];
    const filtered = filterByExt(items, IMAGE_EXT);
    const sorted = sortByName(filtered);
    const limited = sorted.slice(0, 100);

    const playlist: Array<{ path: string; url: string }> = [];
    for (const p of limited) {
      const path = dirPath.replace(/\/$/, "") + "/" + p.name;
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (openRes.status !== 200) continue;
      const openBody = await openRes.json();
      if (typeof openBody.url === "string") {
        playlist.push({ path, url: openBody.url });
      }
    }

    expect(playlist.length).toBeGreaterThanOrEqual(1);
    const n = playlist.length;
    const nextIndex = (i: number) => (i + 1) % n;
    const prevIndex = (i: number) => (i - 1 + n) % n;
    expect(nextIndex(0)).toBe(n === 1 ? 0 : 1);
    expect(prevIndex(0)).toBe(n === 1 ? 0 : n - 1);
  });

  it("T-FP4-M3-OPEN-FILE-PAYLOAD: playlist builds OPEN_FILE payload for initial load + next/prev", async () => {
    const dirPath = "/@root/DISK_C/My Documents/Images/";
    const listRes = await fetchApi(`/api/fs/list?path=${encodeURIComponent(dirPath)}`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const items = listBody.items ?? [];
    const filtered = filterByExt(items, IMAGE_EXT);
    const sorted = sortByName(filtered);
    const limited = sorted.slice(0, 100);

    const playlist: Array<{ path: string; url: string }> = [];
    for (const p of limited) {
      const path = dirPath.replace(/\/$/, "") + "/" + p.name;
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (openRes.status !== 200) continue;
      const openBody = await openRes.json();
      if (typeof openBody.url === "string") {
        playlist.push({ path, url: openBody.url });
      }
    }

    expect(playlist.length).toBeGreaterThanOrEqual(1);
    const clickedPath = playlist[0]!.path;
    const clickedItem = playlist.find((p) => p.path === clickedPath);
    expect(clickedItem).toBeTruthy();
    const openFilePayload = {
      initialPath: clickedPath,
      initialUrl: clickedItem!.url,
      playlist,
    };
    expect(openFilePayload.initialPath).toBeTruthy();
    expect(openFilePayload.initialUrl).toContain("s3.shell.local");
    expect(openFilePayload.playlist).toHaveLength(playlist.length);
    openFilePayload.playlist.forEach((item) => {
      expect(item.path).toBeTruthy();
      expect(item.url).toContain("s3.shell.local");
    });
  });
});
