/**
 * FP4 negative cases — unsupported ext/mime.
 * API must not return 500; 404 for missing, 400 for bad path.
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

describe("FP4 unsupported / negative", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("open-url for missing file returns 404, not 500", async () => {
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/nonexistent.xyz",
      }),
    });
    expect(res.status).toBe(404);
    expect(res.status).not.toBe(500);
  });

  it("open-url for .txt (unsupported ext) returns 200 if file exists", async () => {
    // API does not filter by MIME; it serves any path. So .txt returns 200.
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/@root/DISK_C/readme.txt" }),
    });
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(500);
  });

  it("open-url for path traversal returns 400, not 500", async () => {
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/../etc/passwd",
      }),
    });
    expect([400, 403, 404]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
