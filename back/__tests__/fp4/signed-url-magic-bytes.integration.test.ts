/**
 * FP4: T-FP4-SIGNED-URL-MAGIC-BYTES — signed URL returns valid binary for each fixture.
 * For each fixture: POST open-url → fetch URL → 200 + Content-Type + body magic bytes.
 * FAILS when fixtures are placeholders (text) or Content-Type/bytes mismatch.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * Runs in Docker (test-api-fp.sh) with s3.shell.local:host-gateway.
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

function checkWebP(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function checkPNG(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function checkJPEG(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function checkMP3(bytes: Uint8Array): boolean {
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return true;
  return false;
}

function checkMP4(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
}

function checkWebM(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  );
}

const CASES: Array<{
  path: string;
  label: string;
  expectedContentType: RegExp;
  minLength: number;
  checkMagic: (bytes: Uint8Array) => boolean;
}> = [
  {
    path: "/@root/DISK_C/My Documents/Images/sample.webp",
    label: "webp",
    expectedContentType: /image\/webp/i,
    minLength: 12,
    checkMagic: checkWebP,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.png",
    label: "png",
    expectedContentType: /image\/png/i,
    minLength: 8,
    checkMagic: checkPNG,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.jpg",
    label: "jpg",
    expectedContentType: /image\/jpeg/i,
    minLength: 3,
    checkMagic: checkJPEG,
  },
  {
    path: "/@root/DISK_C/My Documents/Music/sample.mp3",
    label: "mp3",
    expectedContentType: /audio\/mpeg/i,
    minLength: 2,
    checkMagic: checkMP3,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.mp4",
    label: "mp4",
    expectedContentType: /video\/mp4/i,
    minLength: 12,
    checkMagic: checkMP4,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.webm",
    label: "webm",
    expectedContentType: /video\/webm/i,
    minLength: 4,
    checkMagic: checkWebM,
  },
];

describe("FP4 T-FP4-SIGNED-URL-MAGIC-BYTES", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  for (const { path, label, expectedContentType, minLength, checkMagic } of CASES) {
    it(`T-FP4-SIGNED-URL-MAGIC-BYTES-${label}: open-url → 200 + Content-Type + magic bytes`, async () => {
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      expect(openRes.status).toBe(200);
      const body = await openRes.json();
      expect(body).toHaveProperty("url");
      expect(typeof body.url).toBe("string");
      expect(body.url).toContain("s3.shell.local");

      const getRes = await fetch(body.url);
      expect(getRes.status).toBe(200);

      const ct = getRes.headers.get("Content-Type") ?? "";
      expect(expectedContentType.test(ct)).toBe(true);

      const buf = await getRes.arrayBuffer();
      const bytes = new Uint8Array(buf);
      expect(bytes.length).toBeGreaterThanOrEqual(minLength);
      expect(bytes[0]).not.toBe(0x3c); // NOT XML/HTML error
      expect(checkMagic(bytes)).toBe(true);
    });
  }
});
