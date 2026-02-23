/**
 * FP4 M0: T-FP4-M0-REACHABLE — open-url returns reachable resource.
 * Integration: POST open-url → fetch URL (node fetch) → status 200, Content-Type, body length > 0.
 *
 * RED: Asserts Access-Control-Allow-Origin is exact "http://shell.local" (not "*").
 * Traefik minio-cors returns "*". Will pass after fix (CORS or test update).
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

const CASES: Array<{
  path: string;
  label: string;
  expectedContentType: RegExp;
}> = [
  {
    path: "/@root/DISK_C/My Documents/Images/sample.webp",
    label: "webp",
    expectedContentType: /image\/webp/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.png",
    label: "png",
    expectedContentType: /image\/png/i,
  },
  {
    path: "/@root/DISK_C/My Documents/Images/sample.jpg",
    label: "jpg",
    expectedContentType: /image\/jpeg/i,
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

describe("FP4 M0 open-url returns reachable resource (T-FP4-M0-REACHABLE)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  for (const { path, label, expectedContentType } of CASES) {
    it(`T-FP4-M0-REACHABLE-${label}: open-url → 200 + Content-Type + body > 0 + CORS`, async () => {
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

      const getRes = await fetch(body.url, {
        headers: { Origin: "http://shell.local" },
      });
      expect(getRes.status).toBe(200);

      const ct = getRes.headers.get("Content-Type") ?? "";
      expect(expectedContentType.test(ct)).toBe(true);

      const buf = await getRes.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(0);

      // RED: Assert CORS returns exact origin (not "*"). Traefik returns "*".
      const acao = getRes.headers.get("Access-Control-Allow-Origin");
      expect(acao).toBe("http://shell.local");
    });
  }
});
