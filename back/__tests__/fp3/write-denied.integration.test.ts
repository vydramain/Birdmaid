/**
 * FP3 M2: write to system paths denied (403).
 * T-PATH: create-folder under C:/WINDOWS -> 403.
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

describe("FP3 M2: write to system paths denied (T-PATH)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("create-folder under C:/WINDOWS returns 403", async () => {
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
    expect(body.error).toHaveProperty("code");
  });
});
