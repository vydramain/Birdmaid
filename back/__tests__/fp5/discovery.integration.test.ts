/**
 * FP5 M1: Discovery tests (D1, D2, D3).
 * D1: dir with root index.html => isApp=true
 * D2: dir without index.html => isApp=false
 * D3: subdir/index.html only (no root index.html) => isApp=false (OUT of scope)
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

describe("FP5 Discovery (D1, D2, D3)", () => {
  it("D1: dir with root index.html => isApp=true", async () => {
    const res = await fetchApi(
      "/api/fs/list?path=" + encodeURIComponent("/@root/DISK_C/My Documents/")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const sampleApp = body.items.find((i: { name: string }) => i.name === "sample-app");
    expect(sampleApp).toBeDefined();
    expect(sampleApp.kind).toBe("dir");
    expect(sampleApp.isApp).toBe(true);
  });

  it("D2: dir without index.html => isApp=false", async () => {
    const res = await fetchApi(
      "/api/fs/list?path=" + encodeURIComponent("/@root/DISK_C/My Documents/")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const games = body.items.find((i: { name: string }) => i.name === "Games");
    expect(games).toBeDefined();
    expect(games.kind).toBe("dir");
    expect(games.isApp).toBe(false);
  });

  it("D3: subdir/index.html only (no root index.html) => isApp=false", async () => {
    const res = await fetchApi(
      "/api/fs/list?path=" + encodeURIComponent("/@root/DISK_C/My Documents/")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const subdirOnly = body.items.find((i: { name: string }) => i.name === "subdir-only");
    expect(subdirOnly).toBeDefined();
    expect(subdirOnly.kind).toBe("dir");
    expect(subdirOnly.isApp).toBe(false);
  });
});
