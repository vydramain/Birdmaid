/**
 * FP5 M1: Confinement / delivery route tests (C1, C2).
 * C1: relative asset inside package root => loads successfully
 * C2: parent traversal (../) => 403 or 404
 *
 * RED: /apps/user/ route does not exist yet.
 * Prerequisite: Vite dev server (pnpm dev) for C1/C2.
 */

const BASE = process.env.SHELL_BASE_URL ?? process.env.VITE_BASE_URL ?? "http://localhost:5173";

async function fetchUrl(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

describe("FP5 Delivery Route (C1, C2, C3, C4, B-invalid)", () => {
  it("C1: relative asset inside package root loads", async () => {
    const path = encodeURIComponent("/@root/DISK_C/My Documents/sample-app/");
    const res = await fetchUrl(`${BASE}/apps/user/pkg/${path}/`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Sample User App");
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("connect-src 'self'");
  });

  it("C2: parent traversal (../) in path => 400 denied", async () => {
    const path = encodeURIComponent("/@root/DISK_C/My Documents/sample-app/../Games/");
    const res = await fetchUrl(`${BASE}/apps/user/pkg/${path}/`);
    expect(res.status).toBe(400);
  });

  it("C3: encoded traversal (%2e%2e/) in path => 400 denied", async () => {
    const path = encodeURIComponent("/@root/DISK_C/My Documents/sample-app/") + "%2e%2e%2f";
    const res = await fetchUrl(`${BASE}/apps/user/pkg/${path}/`);
    expect(res.status).toBe(400);
  });

  it("C4: path param escaping to other app (../OtherApp/) => 400 denied", async () => {
    const path = encodeURIComponent("/@root/DISK_C/My Documents/sample-app/../OtherApp/");
    const res = await fetchUrl(`${BASE}/apps/user/pkg/${path}/`);
    expect(res.status).toBe(400);
  });

  it("B-invalid: invalid package path (non-@root format) => 400 denied", async () => {
    const path = encodeURIComponent("/invalid/path/");
    const res = await fetchUrl(`${BASE}/apps/user/pkg/${path}/`);
    expect(res.status).toBe(400);
  });
});
