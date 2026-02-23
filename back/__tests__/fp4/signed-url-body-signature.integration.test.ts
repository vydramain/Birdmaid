/**
 * FP4 M0: Signed URL body binary signature.
 * Integration: open-url → fetch(url) → status 200, Content-Type, body matches format.
 * WebP: RIFF....WEBP, PNG: \x89PNG, JPG: \xFF\xD8\xFF, MP3: ID3 or frame sync, MP4/WebM: ftyp/webm.
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
  // ID3v2: "ID3" or frame sync 0xFF 0xFB/0xFA/0xF3/0xF2
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return true;
  return false;
}

function checkMP4(bytes: Uint8Array): boolean {
  // ftyp at offset 4
  if (bytes.length < 12) return false;
  const ftyp = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  return ftyp;
}

function checkWebM(bytes: Uint8Array): boolean {
  // 0x1a 0x45 0xdf 0xa3 (EBML header)
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
  checkSignature: (bytes: Uint8Array) => boolean;
}> = [
  {
    path: "/@root/DISK_C/My Documents/Images/sample.webp",
    label: "webp",
    expectedContentType: /image\/webp/i,
    checkSignature: checkWebP,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.png",
    label: "png",
    expectedContentType: /image\/png/i,
    checkSignature: checkPNG,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.jpg",
    label: "jpg",
    expectedContentType: /image\/jpeg/i,
    checkSignature: checkJPEG,
  },
  {
    path: "/@root/DISK_C/My Documents/Music/sample.mp3",
    label: "mp3",
    expectedContentType: /audio\/mpeg/i,
    checkSignature: checkMP3,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.mp4",
    label: "mp4",
    expectedContentType: /video\/mp4/i,
    checkSignature: checkMP4,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.webm",
    label: "webm",
    expectedContentType: /video\/webm/i,
    checkSignature: checkWebM,
  },
];

describe("FP4 M0 signed URL body signature (T-FP4-M0-BODY-SIG)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  for (const { path, label, expectedContentType, checkSignature } of CASES) {
    it(`T-FP4-M0-BODY-SIG-${label}: open-url → 200 + Content-Type + body signature`, async () => {
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
      expect(bytes.length).toBeGreaterThan(0);
      // Body must NOT be XML/HTML error (S3/MinIO returns XML on error; would break viewer)
      expect(bytes[0]).not.toBe(0x3c); // '<'
      expect(checkSignature(bytes)).toBe(true);
    });
  }
});
