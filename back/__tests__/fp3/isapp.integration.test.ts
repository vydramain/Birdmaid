/**
 * FP3 M3: isApp detection in list response.
 * T-M3.2: list returns isApp for dirs with index.html.
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

describe("FP3 M3: isApp in list (T-M3.2)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("list Program Files returns Explorer with isApp true", async () => {
    const res = await fetchApi(
      "/api/fs/list?path=" + encodeURIComponent("/@root/DISK_C/Program Files/")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const explorer = body.items.find((i: { name: string }) => i.name === "Explorer");
    expect(explorer).toBeDefined();
    expect(explorer.kind).toBe("dir");
    expect(explorer.isApp).toBe(true);
  });

  it("list My Documents returns sample-app with isApp true", async () => {
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
});
