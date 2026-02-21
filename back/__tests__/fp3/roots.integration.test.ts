/**
 * FP3 T-ROOTS: GET /api/fs/roots returns only DISK_A, DISK_C, DISK_D.
 * APPS (FP2) is deprecated for FP3; gateway MUST NOT return APPS.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * /etc/hosts: 127.0.0.1 api.shell.local (see docs/dev/DEV_DOMAIN.md)
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

describe("FP3 T-ROOTS: GET /api/fs/roots", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("returns exactly DISK_A, DISK_C, DISK_D (no APPS)", async () => {
    const res = await fetchApi("/api/fs/roots");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("roots");
    expect(Array.isArray(body.roots)).toBe(true);

    const ids = body.roots.map((r: { id: string }) => r.id);
    expect(ids).toContain("DISK_A");
    expect(ids).toContain("DISK_C");
    expect(ids).toContain("DISK_D");
    expect(ids).not.toContain("APPS");
    expect(ids).toHaveLength(3);
  });

  it("each root has id and label", async () => {
    const res = await fetchApi("/api/fs/roots");
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const r of body.roots) {
      expect(r).toHaveProperty("id");
      expect(r).toHaveProperty("label");
      expect(typeof r.id).toBe("string");
      expect(typeof r.label).toBe("string");
    }
  });
});
