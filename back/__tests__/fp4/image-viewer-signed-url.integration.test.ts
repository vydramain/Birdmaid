/**
 * FP4 M1: ImageViewer signed URL integrity.
 * T-FP4-IV-URL-200, T-FP4-IV-CTYPE, T-FP4-IV-NOT-HTML.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * Fixtures: My Documents/Images/sample.webp
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

describe("FP4 ImageViewer signed URL integrity (M1)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  const webpPath = "/@root/DISK_C/My Documents/Images/sample.webp";

  it("T-FP4-IV-URL-200: open-url for sample.webp returns URL; fetch(URL) → status=200", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: webpPath }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    expect(typeof body.url).toBe("string");
    expect(body.url).toContain("s3.shell.local");

    const getRes = await fetch(body.url);
    expect(getRes.status).toBe(200);
  });

  it("T-FP4-IV-CTYPE: Content-Type starts with image/ and matches webp", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: webpPath }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    const getRes = await fetch(body.url);
    expect(getRes.status).toBe(200);

    const ct = getRes.headers.get("Content-Type") ?? "";
    expect(ct.toLowerCase().startsWith("image/")).toBe(true);
    expect(ct.toLowerCase()).toContain("webp");
  });

  it("T-FP4-IV-NOT-HTML: body is not HTML/XML error (minimal heuristic)", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: webpPath }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    const getRes = await fetch(body.url);
    expect(getRes.status).toBe(200);

    const buf = await getRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // WebP: RIFF....WEBP (bytes 0-3: 52 49 46 46, 8-11: 57 45 42 50)
    // HTML/XML: < or <? (60, 60 63)
    const first = bytes[0];
    const isHtmlStart = first === 0x3c; // '<'
    const isRiff =
      bytes.length >= 4 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46;
    const isWebp =
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;
    expect(isHtmlStart).toBe(false);
    expect(isRiff && isWebp).toBe(true);
  });
});
