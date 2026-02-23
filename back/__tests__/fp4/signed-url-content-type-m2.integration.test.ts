/**
 * FP4 M2: Signed URL must return 200 and correct Content-Type for all media types.
 * Integration: POST open-url → fetch URL → 200 + expected Content-Type.
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

const CASES: Array<{
  path: string;
  label: string;
  expectedContentType: string | RegExp;
}> = [
  {
    path: "/@root/DISK_C/My Documents/Images/sample.webp",
    label: "webp",
    expectedContentType: /image\/webp/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.jpg",
    label: "jpg",
    expectedContentType: /image\/jpeg/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.png",
    label: "png",
    expectedContentType: /image\/png/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Music/sample.mp3",
    label: "mp3",
    expectedContentType: /audio\/mpeg/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.mp4",
    label: "mp4",
    expectedContentType: /video\/mp4/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Video/sample.webm",
    label: "webm",
    expectedContentType: /video\/webm/i,
  },
];

describe("FP4 M2 signed URL Content-Type", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  for (const { path, label, expectedContentType } of CASES) {
    it(`T-FP4-M2-${label}: open-url → 200 + Content-Type`, async () => {
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
      const matches =
        typeof expectedContentType === "string"
          ? ct.toLowerCase().includes(expectedContentType.toLowerCase())
          : expectedContentType.test(ct);
      expect(matches).toBe(true);
    });
  }

  const RANGE_CASES = [
    { path: "/@root/DISK_C/My Documents/Video/sample.mp4", label: "mp4" },
    { path: "/@root/DISK_C/My Documents/Video/sample.webm", label: "webm" },
  ];

  for (const { path, label } of RANGE_CASES) {
    it(`T-FP4-M2-RANGE-${label}: Range bytes=0-0 → 206 + Accept-Ranges`, async () => {
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      expect(openRes.status).toBe(200);
      const body = await openRes.json();
      expect(body).toHaveProperty("url");

      const rangeRes = await fetch(body.url, {
        headers: { Range: "bytes=0-0" },
      });
      expect([200, 206]).toContain(rangeRes.status);
      const acceptRanges = rangeRes.headers.get("Accept-Ranges");
      expect(acceptRanges === "bytes" || rangeRes.status === 206).toBe(true);
    });
  }
});
