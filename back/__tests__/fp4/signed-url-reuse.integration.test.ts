/**
 * FP4 M3: Firefox-style signed URL reuse.
 * Integration: same signed URL fetched multiple times → 200 each time.
 * Mimics browser behavior (img retry, multiple elements, back/forward).
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

describe("FP4 M3 signed URL reuse (Firefox smoke)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("T-FP4-M3-REUSE: same signed URL fetched 5× → 200 each time (no single-use)", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/Images/sample.webp",
      }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    const url = body.url as string;
    expect(url).toContain("s3.shell.local");

    for (let i = 0; i < 5; i++) {
      const getRes = await fetch(url);
      expect(getRes.status).toBe(200);
      const buf = await getRes.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(0);
      expect(new Uint8Array(buf)[0]).not.toBe(0x3c);
    }
  });
});
