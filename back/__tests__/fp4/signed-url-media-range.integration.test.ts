/**
 * FP4 M1: T-FP4-MEDIA-SIGNED-URL-RETURNS-MP4-BYTES + T-FP4-MEDIA-SIGNED-URL-RANGE
 * RED tests: detect "mp4 not actually mp4" and "range broken" for open-url.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * Runs in Docker (test-api-fp.sh) with s3.shell.local:host-gateway.
 * Fixture: DISK_C/My Documents/Video/sample.mp4
 */

const API_BASE = "http://api.shell.local";
const MP4_PATH = "/@root/DISK_C/My Documents/Video/sample.mp4";

async function fetchApi(path: string, opts?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    return await fetch(`${API_BASE}${path}`, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function hasFtypInFirst16Bytes(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  // ftyp at offset 4 (bytes 4-7) is standard for mp4
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true;
  // Also check first 16 bytes for ftyp (user said "within first ~16 bytes window")
  const window = bytes.subarray(0, Math.min(16, bytes.length));
  const s = String.fromCharCode(...window);
  return s.includes("ftyp");
}

describe("FP4 M1 T-FP4-MEDIA-SIGNED-URL", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("T-FP4-MEDIA-SIGNED-URL-RETURNS-MP4-BYTES: open-url for mp4 → 200/206 + video/mp4 + ftyp in first 32 bytes", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: MP4_PATH }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    expect(body).toHaveProperty("url");
    expect(typeof body.url).toBe("string");
    expect(body.url).toContain("s3.shell.local");

    const getRes = await fetch(body.url);
    expect([200, 206]).toContain(getRes.status);

    const ct = getRes.headers.get("Content-Type") ?? "";
    const isVideoMp4 = /video\/mp4/i.test(ct);
    const isOctetStream = /application\/octet-stream/i.test(ct);
    expect(isVideoMp4 || isOctetStream).toBe(true);

    const buf = await getRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    expect(bytes.length).toBeGreaterThanOrEqual(12); // ftyp at offset 4-7
    expect(bytes[0]).not.toBe(0x3c); // NOT XML/HTML error
    expect(hasFtypInFirst16Bytes(bytes)).toBe(true);
  });

  it("T-FP4-MEDIA-SIGNED-URL-RANGE: Range bytes=0-1023 → 206 + Content-Range", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: MP4_PATH }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    const url = body.url as string;

    // GET with Range (what <video> uses for metadata/seek) — must return 206.
    const rangeRes = await fetch(url, {
      headers: { Range: "bytes=0-1023" },
    });
    expect(rangeRes.status).toBe(206);
    const contentRange = rangeRes.headers.get("Content-Range");
    expect(contentRange).toBeTruthy();
    expect(contentRange).toMatch(/bytes 0-\d+\/\d+/);
  });

  it("T-FP4-M4-MP4-PLAYABLE: signed URL for mp4 is playable (content signature + range)", async () => {
    const openRes = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: MP4_PATH }),
    });
    expect(openRes.status).toBe(200);
    const body = await openRes.json();
    const url = body.url as string;

    // Plain fetch: must return mp4 bytes (ftyp)
    const plainRes = await fetch(url);
    expect([200, 206]).toContain(plainRes.status);
    const plainBuf = await plainRes.arrayBuffer();
    const plainBytes = new Uint8Array(plainBuf);
    expect(hasFtypInFirst16Bytes(plainBytes)).toBe(true);

    // Range fetch: must return 206 + Content-Range (metadata/seek)
    const rangeRes = await fetch(url, { headers: { Range: "bytes=0-1023" } });
    expect(rangeRes.status).toBe(206);
    expect(rangeRes.headers.get("Content-Range")).toMatch(/bytes 0-\d+\/\d+/);
  });
});
