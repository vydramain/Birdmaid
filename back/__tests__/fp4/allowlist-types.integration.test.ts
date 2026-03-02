/**
 * FP4 allowlist types — open-url for image/audio/video paths.
 * Ensures API returns 200 for allowlist extensions (no 500).
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

describe("FP4 allowlist types", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("open-url for png returns 200", async () => {
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/Images/sample.png",
      }),
    });
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(500);
  });

  it("open-url for mp3 returns 200", async () => {
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/Music/sample.mp3",
      }),
    });
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(500);
  });

  it("open-url for mp4 returns 200", async () => {
    const res = await fetchApi("/api/fs/open-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/@root/DISK_C/My Documents/Video/sample.mp4",
      }),
    });
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(500);
  });
});
