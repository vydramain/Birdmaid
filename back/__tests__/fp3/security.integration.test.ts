/**
 * FP3 M6: Security gates.
 * T-M6.4: Write without token -> 403
 * T-PATH: Write to system path with token -> 403 (also in write-denied)
 * T-M6-origin: Bad origin -> 403 for /api/fs/*
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

describe("FP3 M6: Security gates", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("T-M6.4: Write endpoint without token -> 403", async () => {
    const res = await fetchApi("/api/fs/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/@root/DISK_C/My Documents/test/" }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("PERMISSION_DENIED");
  });

  it("T-M6.4: Write endpoint with wrong app header -> 403", async () => {
    const res = await fetchApi("/api/fs/create-folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-System-App": "user-app",
        "X-System-Token": "any",
      },
      body: JSON.stringify({ path: "/@root/DISK_C/My Documents/test/" }),
    });
    expect(res.status).toBe(403);
  });

  it("T-PATH: Write to system path with token -> 403", async () => {
    const res = await fetchApi("/api/fs/create-folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-System-App": "explorer",
        "X-System-Token": "fp3-explorer-token",
      },
      body: JSON.stringify({ path: "/@root/DISK_C/WINDOWS/forbidden/" }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("POLICY_VIOLATION");
  });

  it("T-M6-origin: Bad origin -> 403 for /api/fs/roots", async () => {
    const res = await fetchApi("/api/fs/roots", {
      headers: { Origin: "http://evil.example.com" },
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("BAD_ORIGIN");
  });

  it("T-M6-origin: Bad origin -> 403 for /api/fs/list", async () => {
    const res = await fetchApi("/api/fs/list?path=" + encodeURIComponent("/@root/DISK_C/"), {
      headers: { Origin: "http://evil.example.com" },
    });
    expect(res.status).toBe(403);
  });

  it("T-M6-origin: s3.shell.local origin (Explorer/system apps) -> 200 for read", async () => {
    const res = await fetchApi("/api/fs/roots", {
      headers: { Origin: "http://s3.shell.local" },
    });
    expect(res.status).toBe(200);
  });
});
