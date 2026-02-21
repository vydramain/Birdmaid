/**
 * FP3.1 M7: upload-file allowlist, 415, 2xx, no 500 for valid requests.
 * T-C1.1: allowed ext/mime -> 201 and file in list
 * T-C1.2: disallowed ext/mime -> 415
 * T-C3.1: valid request -> 2xx or 4xx (never 500)
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 */

const API_BASE = "http://api.shell.local";

const WRITE_HEADERS = {
  "X-System-App": "explorer",
  "X-System-Token": "fp3-explorer-token",
};

async function fetchApi(path: string, opts?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    return await fetch(`${API_BASE}${path}`, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

describe("FP3.1 M7: upload-file allowlist (api-fs-upload)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  const basePath = "/@root/DISK_C/My Documents/";
  const testPrefix = "fp3-upload-";

  it("T-C1.1: allowed upload (png) -> 201 and file in list", async () => {
    const fileName = testPrefix + "img-" + Date.now() + ".png";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["fake png content"], { type: "image/png" }), fileName);

    const res = await fetchApi("/api/fs/upload-file", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("name", fileName);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === fileName);
    expect(found).toBeDefined();
    expect(found.kind).toBe("file");
  });

  it("T-C1.2: disallowed ext (.txt) -> 415", async () => {
    const fileName = testPrefix + "disallowed-" + Date.now() + ".txt";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["hello"], { type: "text/plain" }), fileName);

    const res = await fetchApi("/api/fs/upload-file", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("UNSUPPORTED_MEDIA");
  });

  it("T-C1.2: disallowed mime (image/gif) -> 415", async () => {
    const fileName = testPrefix + "gif-" + Date.now() + ".gif";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["gif89a"], { type: "image/gif" }), fileName);

    const res = await fetchApi("/api/fs/upload-file", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("UNSUPPORTED_MEDIA");
  });

  it("T-M8-Z1: upload-zip-app without index.html -> 400 NO_INDEX_HTML, no partial files", async () => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    zip.file("readme.txt", "no index here");
    zip.file("other.js", "// empty");
    const zipBlob = new Blob([await zip.generateAsync({ type: "arraybuffer" })]);

    const dirName = testPrefix + "noindex-" + Date.now();
    const path = basePath + dirName + "/";
    const form = new FormData();
    form.append("path", path);
    form.append("file", zipBlob, "noindex.zip");

    const res = await fetchApi("/api/fs/upload-zip-app", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error.code).toBe("NO_INDEX_HTML");

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === dirName);
    expect(found).toBeUndefined();
  });

  it("T-C3.1: valid allowed request -> 2xx (no 500)", async () => {
    const fileName = testPrefix + "valid-" + Date.now() + ".jpg";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["jpeg content"], { type: "image/jpeg" }), fileName);

    const res = await fetchApi("/api/fs/upload-file", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).not.toBe(500);
    expect([200, 201]).toContain(res.status);
  });
});
