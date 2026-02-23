/**
 * FP4 M0: Signed URL from open-url MUST be fetchable from container.
 * Integration: POST open-url → curl/fetch that URL → 200 + Content-Type image/webp.
 * Runs in Docker container (test-api-fp.sh) with s3.shell.local:host-gateway.
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

describe("FP4 M0 signed URL fetchable from container", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  const webpPath = "/@root/DISK_C/My Documents/Images/sample.webp";

  it("T-FP4-NO-CHECKSUM: modifying presigned URL (strip or add x-amz-checksum-mode) invalidates signature → 403", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: webpPath }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    const url = body.url as string;
    expect(url).toContain("s3.shell.local");
    const hasParam = url.includes("x-amz-checksum-mode=");
    const modified = hasParam
      ? url.replace(/[?&]x-amz-checksum-mode=[^&]*/g, "").replace(/\?&/, "?")
      : url + (url.includes("?") ? "&" : "?") + "x-amz-checksum-mode=ENABLED";
    const getRes = await fetch(modified);
    expect([403, 400]).toContain(getRes.status);
    if (getRes.status === 400) {
      const text = await getRes.text();
      expect(
        text.includes("SignatureDoesNotMatch") ||
          text.includes("InvalidRequest") ||
          text.includes("AccessDenied")
      ).toBe(true);
    }
  });

  it("T-FP4-M0-CURL: open-url signed URL is fetchable from container (200, Content-Type image/webp)", async () => {
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

    const ct = getRes.headers.get("Content-Type") ?? "";
    expect(ct.toLowerCase().startsWith("image/")).toBe(true);
    expect(ct.toLowerCase()).toContain("webp");

    const buf = await getRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes[0]).not.toBe(0x3c); // Body must NOT be XML/HTML error
    // WebP: RIFF....WEBP
    expect(
      bytes.length >= 12 &&
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ).toBe(true);
  });

  const mp3Path = "/@root/DISK_C/My Documents/Music/sample.mp3";

  it("T-FP4-M0-MP3: open-url signed URL for sample.mp3 (Media Player) → 200 + audio/mpeg + body signature", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: mp3Path }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    expect(typeof body.url).toBe("string");
    expect(body.url).toContain("s3.shell.local");

    const getRes = await fetch(body.url);
    expect(getRes.status).toBe(200);

    const ct = getRes.headers.get("Content-Type") ?? "";
    expect(ct.toLowerCase()).toMatch(/audio\/mpeg/);

    const buf = await getRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes[0]).not.toBe(0x3c); // Body must NOT be XML/HTML error
    // MP3: ID3 or frame sync
    const hasId3 = bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const hasFrameSync = bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    expect(hasId3 || hasFrameSync).toBe(true);
  });
});
