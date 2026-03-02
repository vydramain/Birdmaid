/**
 * FP3 M4: open-url for viewers.
 * POST /api/fs/open-url returns url; GET on url returns 200.
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

describe("FP3 M4: open-url for viewers (T-M4-open-url)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("POST open-url returns url; GET on url returns 200", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/sample-image.png",
      }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    expect(typeof body.url).toBe("string");
    expect(body.url).toMatch(/s3\.shell\.local|X-Amz-/);

    const getRes = await fetch(body.url);
    expect(getRes.status).toBe(200);
  });
});
