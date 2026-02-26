/**
 * FP2 API Integration Tests (TESTS-RED)
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 * Tests hit api.shell.local, s3.shell.local via domains (not localhost ports).
 * Fixtures: MinIO init must have loaded DISK_C, APPS (minio-init in compose).
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

describe("FP2 API Integration", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });
  describe("T-A2: GET /health", () => {
    it("returns 200 and { status: 'ok' }", async () => {
      const res = await fetchApi("/health");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ status: "ok" });
    });
  });

  describe("T-D1: GET /api/fs/roots", () => {
    it("returns 200 and roots array with id, label", async () => {
      const res = await fetchApi("/api/fs/roots");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("roots");
      expect(Array.isArray(body.roots)).toBe(true);
      for (const r of body.roots) {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("label");
      }
      expect(body.roots.map((r: { id: string }) => r.id)).toContain("DISK_A");
      expect(body.roots.map((r: { id: string }) => r.id)).toContain("DISK_C");
      expect(body.roots.map((r: { id: string }) => r.id)).toContain("DISK_D");
    });
  });

  describe("T-B1/T-D2: GET /api/fs/list", () => {
    it("list root returns 200 and items[] with path, name, kind", async () => {
      const res = await fetchApi("/api/fs/list?path=/@root/DISK_C/");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("items");
      expect(Array.isArray(body.items)).toBe(true);
      for (const item of body.items) {
        expect(item).toHaveProperty("path");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("kind");
        expect(["dir", "file"]).toContain(item.kind);
      }
    });

    it("dirs before files, lexicographic within group", async () => {
      const res = await fetchApi("/api/fs/list?path=/@root/DISK_C/");
      expect(res.status).toBe(200);
      const body = await res.json();
      const dirs = body.items.filter((i: { kind: string }) => i.kind === "dir");
      const files = body.items.filter((i: { kind: string }) => i.kind === "file");
      expect(dirs.length + files.length).toBe(body.items.length);
      for (let i = 1; i < dirs.length; i++) {
        expect(dirs[i].name.localeCompare(dirs[i - 1].name) >= 0).toBe(true);
      }
      for (let i = 1; i < files.length; i++) {
        expect(files[i].name.localeCompare(files[i - 1].name) >= 0).toBe(true);
      }
    });
  });

  describe("T-B2: GET /api/fs/stat", () => {
    it("stat existing file returns 200 with path, name, kind, size, mime", async () => {
      const res = await fetchApi("/api/fs/stat?path=/@root/DISK_C/readme.txt");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("path", "/@root/DISK_C/readme.txt");
      expect(body).toHaveProperty("name", "readme.txt");
      expect(body).toHaveProperty("kind", "file");
      expect(body).toHaveProperty("size");
      expect(typeof body.size).toBe("number");
    });

    it("stat missing returns 404 with error schema", async () => {
      const res = await fetchApi("/api/fs/stat?path=/@root/DISK_C/nonexistent.txt");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toHaveProperty("code", "NOT_FOUND");
      expect(body.error).toHaveProperty("message");
    });
  });

  describe("T-F2: bad path -> 400", () => {
    it("list with path traversal returns 400 BAD_PATH", async () => {
      const res = await fetchApi("/api/fs/list?path=/@root/DISK_C/../etc/");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toHaveProperty("code", "BAD_PATH");
    });
  });

  describe("T-F2: bad root -> 403", () => {
    it("list with unknown root returns 403 ROOT_NOT_FOUND", async () => {
      const res = await fetchApi("/api/fs/list?path=/@root/UNKNOWN_ROOT/");
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toHaveProperty("code", "ROOT_NOT_FOUND");
    });
  });

  describe("T-C1/T-C2: POST /api/fs/open-url", () => {
    it("returns 200 with url and expiresIn in [60, 300]", async () => {
      const res = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("url");
      expect(typeof body.url).toBe("string");
      expect(body.url).toContain("s3.shell.local");
      expect(body).toHaveProperty("expiresIn");
      expect(body.expiresIn).toBeGreaterThanOrEqual(60);
      expect(body.expiresIn).toBeLessThanOrEqual(300);
    });

    it("ttlSec 90 returns expiresIn in [60, 300]", async () => {
      const res = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt", ttlSec: 90 }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.expiresIn).toBeGreaterThanOrEqual(60);
      expect(body.expiresIn).toBeLessThanOrEqual(300);
    });

    it("ttlSec 30 clamped to 60", async () => {
      const res = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt", ttlSec: 30 }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.expiresIn).toBe(60);
    });
  });

  describe("T-signed-url-get-200 (M4)", () => {
    it("signed URL GET returns 200, host is s3.shell.local", async () => {
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt" }),
      });
      expect(openRes.status).toBe(200);
      const { url } = await openRes.json();
      expect(url).toContain("s3.shell.local");

      const getRes = await fetch(url);
      expect(getRes.status).toBe(200);
    });

    it("signed URL GET with Range returns 200 or 206", async () => {
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt" }),
      });
      expect(openRes.status).toBe(200);
      const { url } = await openRes.json();

      const getRes = await fetch(url, { headers: { Range: "bytes=0-0" } });
      expect([200, 206]).toContain(getRes.status);
    });
  });

  describe("T-E2: CORS on signed URL (MinIO)", () => {
    it("GET signed URL with Origin returns Access-Control-Allow-Origin", async () => {
      const openRes = await fetchApi("/api/fs/open-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/@root/DISK_C/readme.txt" }),
      });
      expect(openRes.status).toBe(200);
      const { url } = await openRes.json();

      const getRes = await fetch(url, { headers: { Origin: "http://shell.local" } });
      expect(getRes.status).toBe(200);
      // MinIO/Traefik returns * for s3.shell.local (accesscontrolalloworiginlist=*)
      expect(["*", "http://shell.local"]).toContain(
        getRes.headers.get("Access-Control-Allow-Origin")
      );
    });
  });

  describe("T-E1: CORS", () => {
    it("allowed origin returns Access-Control-Allow-Origin", async () => {
      const res = await fetchApi("/health", {
        headers: { Origin: "http://shell.local" },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://shell.local");
    });

    it("disallowed origin returns 403", async () => {
      const res = await fetchApi("/api/fs/roots", {
        headers: { Origin: "http://evil.example" },
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error?.code).toBe("BAD_ORIGIN");
    });
  });
});
