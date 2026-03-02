/**
 * FP4 open-url / signed-url flow for viewers.
 * POST open-url for image/audio/video paths → 200, url; GET url → 200.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * Fixtures: My Documents/Images/, Music/, Video/ with sample files.
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

describe("FP4 open-url for viewers", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  const paths = [
    { path: "/@root/DISK_C/My Documents/Images/sample.png", label: "image png" },
    { path: "/@root/DISK_C/My Documents/Images/sample.jpg", label: "image jpg" },
    { path: "/@root/DISK_C/My Documents/Images/sample.webp", label: "image webp" },
    { path: "/@root/DISK_C/My Documents/Music/sample.mp3", label: "audio mp3" },
    { path: "/@root/DISK_C/My Documents/Video/sample.mp4", label: "video mp4" },
    { path: "/@root/DISK_C/My Documents/Video/sample.webm", label: "video webm" },
  ];

  for (const { path, label } of paths) {
    it(`open-url ${label} → 200, GET url → 200`, async () => {
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
    });
  }
});
