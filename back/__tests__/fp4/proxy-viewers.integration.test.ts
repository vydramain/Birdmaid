/**
 * FP4 proxy endpoint for viewers — bypass CORS when loading media from s3.shell.local.
 * GET /api/fs/proxy?url=... → streams content from signed URL (SSRF guard: only s3.shell.local).
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

describe("FP4 proxy for viewers", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("proxy s3 signed URL → 200 + Content-Type", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/@root/DISK_C/My Documents/Images/sample.jpg" }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    const signedUrl = body.url as string;
    expect(signedUrl).toContain("s3.shell.local");

    const proxyUrl = `/api/fs/proxy?url=${encodeURIComponent(signedUrl)}`;
    const proxyRes = await fetchApi(proxyUrl);
    expect(proxyRes.status).toBe(200);
    expect(proxyRes.headers.get("Content-Type")).toMatch(/image\//);
    const buf = await proxyRes.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(0);
  });

  it("proxy rejects non-s3 URL → 403", async () => {
    const badUrl = encodeURIComponent("https://evil.com/secret");
    const res = await fetchApi(`/api/fs/proxy?url=${badUrl}`);
    expect(res.status).toBe(403);
  });

  it("proxy without url → 400", async () => {
    const res = await fetchApi("/api/fs/proxy");
    expect(res.status).toBe(400);
  });
});
