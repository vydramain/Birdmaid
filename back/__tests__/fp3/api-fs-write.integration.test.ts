/**
 * FP3 M5: Write operations in writable path (C:/My Documents/**).
 * T-M5.3: create-folder -> 200 + visible in list
 * T-M5.4: upload-file -> appears
 * T-M5.5: upload-zip-app -> unzips, validates index.html
 * T-M5.6: delete -> removed
 * T-M5.7: rename same-parent -> 200; cross-parent -> 403
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

describe("FP3 M5: Write operations (api-fs-write)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  const basePath = "/@root/DISK_C/My Documents/";
  const testPrefix = "fp3-test-";

  it("T-M5.3: create-folder in My Documents -> 200 + visible in list", async () => {
    const folderName = testPrefix + "folder-" + Date.now();
    const path = basePath + folderName + "/";
    const res = await fetchApi("/api/fs/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...WRITE_HEADERS },
      body: JSON.stringify({ path }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("name", folderName);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === folderName);
    expect(found).toBeDefined();
    expect(found.kind).toBe("dir");
  });

  it("T-M5.4: upload-file -> appears in list", async () => {
    const fileName = testPrefix + "file-" + Date.now() + ".png";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["fake png"], { type: "image/png" }), fileName);

    const res = await fetchApi("/api/fs/upload-file", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(201);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === fileName);
    expect(found).toBeDefined();
    expect(found.kind).toBe("file");
  });

  it("T-M5.6: delete -> item removed", async () => {
    const fileName = testPrefix + "del-" + Date.now() + ".png";
    const path = basePath + fileName;
    const form = new FormData();
    form.append("path", path);
    form.append("file", new Blob(["x"], { type: "image/png" }), fileName);
    await fetchApi("/api/fs/upload-file", { method: "POST", headers: WRITE_HEADERS, body: form });

    const delRes = await fetchApi("/api/fs/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...WRITE_HEADERS },
      body: JSON.stringify({ path }),
    });
    expect(delRes.status).toBe(204);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === fileName);
    expect(found).toBeUndefined();
  });

  it("T-M5.7: rename same-parent -> 200", async () => {
    const fromName = testPrefix + "rn-from-" + Date.now() + ".png";
    const toName = testPrefix + "rn-to-" + Date.now() + ".png";
    const fromPath = basePath + fromName;
    const toPath = basePath + toName;

    const form = new FormData();
    form.append("path", fromPath);
    form.append("file", new Blob(["rename test"], { type: "image/png" }), fromName);
    await fetchApi("/api/fs/upload-file", { method: "POST", headers: WRITE_HEADERS, body: form });

    const res = await fetchApi("/api/fs/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...WRITE_HEADERS },
      body: JSON.stringify({ fromPath, toPath }),
    });
    expect(res.status).toBe(200);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    const listBody = await listRes.json();
    expect(listBody.items?.find((i: { name: string }) => i.name === fromName)).toBeUndefined();
    expect(listBody.items?.find((i: { name: string }) => i.name === toName)).toBeDefined();
  });

  it("T-M5.7: rename cross-parent -> 403", async () => {
    const fromName = testPrefix + "cross-" + Date.now() + ".png";
    const fromPath = basePath + fromName;
    const form = new FormData();
    form.append("path", fromPath);
    form.append("file", new Blob(["x"], { type: "image/png" }), fromName);
    await fetchApi("/api/fs/upload-file", { method: "POST", headers: WRITE_HEADERS, body: form });

    const toPath = "/@root/DISK_C/docs/moved.txt"; // different parent

    const res = await fetchApi("/api/fs/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...WRITE_HEADERS },
      body: JSON.stringify({ fromPath, toPath }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("T-M5.5: upload-zip-app -> unzips, validates index.html", async () => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    zip.file("index.html", "<!DOCTYPE html><html><body>App</body></html>");
    const zipBlob = new Blob([await zip.generateAsync({ type: "arraybuffer" })]);

    const dirName = testPrefix + "zipapp-" + Date.now();
    const path = basePath + dirName + "/";
    const form = new FormData();
    form.append("path", path);
    form.append("file", zipBlob, "app.zip");

    const res = await fetchApi("/api/fs/upload-zip-app", {
      method: "POST",
      headers: WRITE_HEADERS,
      body: form,
    });
    expect(res.status).toBe(201);

    const listRes = await fetchApi("/api/fs/list?path=" + encodeURIComponent(basePath));
    const listBody = await listRes.json();
    const found = listBody.items?.find((i: { name: string }) => i.name === dirName);
    expect(found).toBeDefined();
    expect(found.kind).toBe("dir");
    expect(found.isApp).toBe(true);
  });
});
