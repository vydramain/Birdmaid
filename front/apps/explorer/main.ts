/**
 * Explorer — system app, roots view + folder navigation.
 * FP3 M1: roots A/C/D. M2: double click C: -> C:/, list + address bar.
 * FP3 M5: context menu (New Folder, Upload, Delete, Rename), write API with token.
 */

let systemToken: string | null = null;

window.addEventListener("message", (e) => {
  const data = e.data as { type?: string; payload?: { systemToken?: string } };
  if (data?.type === "SHELL_CAPS" && data.payload?.systemToken) {
    systemToken = data.payload.systemToken;
  }
});

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.origin.includes("shell.local") ||
    window.location.origin.includes("localhost") ||
    window.location.origin.includes("127.0.0.1"))
    ? ""
    : "http://api.shell.local";

interface Root {
  id: string;
  label: string;
}

interface FsItem {
  path: string;
  name: string;
  kind: "dir" | "file";
  isApp?: boolean;
}

type ViewState = { mode: "roots" } | { mode: "folder"; path: string; apiPath: string };

let state: ViewState = { mode: "roots" };
let roots: Root[] = [];

function labelToDisplay(id: string, label: string): string {
  if (id === "DISK_A") return "Floppy (A:)";
  if (id === "DISK_C") return "(C:)";
  if (id === "DISK_D") return "(D:)";
  return label;
}

function apiPathToDisplay(apiPath: string): string {
  const m = apiPath.match(/\/@root\/(DISK_[ACD])\/(.*)$/);
  if (!m) return apiPath;
  const [, rootId, suffix] = m;
  const drive = rootId === "DISK_A" ? "A:" : rootId === "DISK_C" ? "C:" : "D:";
  return suffix ? `${drive}/${suffix.replace(/\/$/, "")}` : `${drive}/`;
}

async function fetchRoots(): Promise<Root[]> {
  const url = API_BASE ? `${API_BASE}/api/fs/roots` : "/api/fs/roots";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`roots failed: ${res.status}`);
  const data = await res.json();
  return data.roots ?? [];
}

async function fetchList(apiPath: string): Promise<FsItem[]> {
  const url = API_BASE
    ? `${API_BASE}/api/fs/list?path=${encodeURIComponent(apiPath)}`
    : `/api/fs/list?path=${encodeURIComponent(apiPath)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

async function checkIsApp(apiPath: string): Promise<boolean> {
  const indexPath = apiPath.replace(/\/$/, "") + "/index.html";
  const url = API_BASE
    ? `${API_BASE}/api/fs/stat?path=${encodeURIComponent(indexPath)}`
    : `/api/fs/stat?path=${encodeURIComponent(indexPath)}`;
  const res = await fetch(url);
  return res.ok;
}

function isWritablePath(apiPath: string): boolean {
  return /\/@root\/DISK_C\/My Documents\//.test(apiPath);
}

async function fetchWithToken(
  url: string,
  opts: RequestInit & { body?: unknown }
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
    "X-System-App": "explorer",
    "X-System-Token": systemToken ?? "",
  };
  return fetch(url, { ...opts, headers });
}

function send(type: string, payload?: Record<string, unknown>): void {
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type, payload, timestamp: Date.now() }, window.location.origin);
    } catch {
      /* ignore */
    }
  }
}

function getRootEl(): HTMLElement | null {
  return document.getElementById("explorer-root");
}

function renderAddressBar(displayPath: string): void {
  let bar = document.querySelector("[data-testid='address-bar']");
  if (!bar) {
    bar = document.createElement("div");
    bar.setAttribute("data-testid", "address-bar");
    bar.style.padding = "0.25rem 0.5rem";
    bar.style.borderBottom = "1px solid #ccc";
    bar.style.fontSize = "0.875rem";
    const container = getRootEl();
    if (container) container.insertBefore(bar, container.firstChild);
  }
  bar.textContent = displayPath;
}

function renderRoots(): void {
  const root = getRootEl();
  if (!root) return;
  root.innerHTML = "";
  renderAddressBar("");
  const grid = document.createElement("div");
  grid.setAttribute("data-testid", "explorer-roots");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(80px, 1fr))";
  grid.style.gap = "1rem";
  grid.style.padding = "1rem";
  for (const r of roots) {
    const item = document.createElement("div");
    item.setAttribute("data-testid", `root-${r.id.toLowerCase()}`);
    item.textContent = labelToDisplay(r.id, r.label);
    item.style.cursor = "pointer";
    item.style.padding = "0.5rem";
    item.style.border = "1px solid #ccc";
    item.style.borderRadius = "4px";
    item.style.textAlign = "center";
    item.addEventListener("dblclick", () => onRootDblClick(r.id));
    grid.appendChild(item);
  }
  root.appendChild(grid);
}

function onRootDblClick(rootId: string): void {
  const apiPath = `/@root/${rootId}/`;
  state = { mode: "folder", path: apiPathToDisplay(apiPath), apiPath };
  loadAndRenderList();
}

function mimeFromExt(name: string): string | undefined {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext];
}

async function onItemDblClick(item: FsItem): Promise<void> {
  if (item.kind === "file") {
    const mime = mimeFromExt(item.name);
    if (mime?.startsWith("image/")) {
      send("SHELL_OPEN", { kind: "file", path: item.path, mime, title: item.name });
      return;
    }
    return;
  }
  const apiPath = item.path.endsWith("/") ? item.path : item.path + "/";
  const isApp = item.isApp ?? (await checkIsApp(apiPath));
  if (isApp) {
    send("SHELL_OPEN", { kind: "app", path: apiPath, title: item.name });
    return;
  }
  state = { mode: "folder", path: apiPathToDisplay(apiPath), apiPath };
  loadAndRenderList();
}

// let contextMenuState: {
//   x: number;
//   y: number;
//   target: "blank" | "item";
//   item?: FsItem;
// } | null = null;

function hideContextMenu(): void {
  const menu = document.getElementById("explorer-context-menu");
  if (menu) menu.remove();
  contextMenuState = null;
}

function showContextMenu(x: number, y: number, target: "blank" | "item", item?: FsItem): void {
  hideContextMenu();
  contextMenuState = { x, y, target, item };
  const menu = document.createElement("div");
  menu.id = "explorer-context-menu";
  menu.setAttribute("data-testid", "context-menu");
  menu.setAttribute("role", "menu");
  menu.style.position = "fixed";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.background = "#fff";
  menu.style.border = "1px solid #999";
  menu.style.boxShadow = "2px 2px 4px rgba(0,0,0,0.2)";
  menu.style.padding = "4px 0";
  menu.style.minWidth = "160px";
  menu.style.zIndex = "9999";

  const writable = state.mode === "folder" && isWritablePath(state.apiPath);

  if (target === "blank" && writable) {
    const newFolder = document.createElement("div");
    newFolder.setAttribute("role", "menuitem");
    newFolder.textContent = "New Folder";
    newFolder.style.padding = "4px 12px";
    newFolder.style.cursor = "pointer";
    newFolder.onclick = () => {
      hideContextMenu();
      onNewFolder();
    };
    menu.appendChild(newFolder);
    const uploadFile = document.createElement("div");
    uploadFile.setAttribute("role", "menuitem");
    uploadFile.textContent = "Upload File";
    uploadFile.style.padding = "4px 12px";
    uploadFile.style.cursor = "pointer";
    uploadFile.onclick = () => {
      hideContextMenu();
      onUploadFile();
    };
    menu.appendChild(uploadFile);
    const uploadZip = document.createElement("div");
    uploadZip.setAttribute("role", "menuitem");
    uploadZip.textContent = "Upload Zip App";
    uploadZip.style.padding = "4px 12px";
    uploadZip.style.cursor = "pointer";
    uploadZip.onclick = () => {
      hideContextMenu();
      onUploadZipApp();
    };
    menu.appendChild(uploadZip);
  }

  if (target === "item" && item && writable) {
    const del = document.createElement("div");
    del.setAttribute("role", "menuitem");
    del.textContent = "Delete";
    del.style.padding = "4px 12px";
    del.style.cursor = "pointer";
    del.onclick = () => {
      hideContextMenu();
      onDelete(item);
    };
    menu.appendChild(del);
    const ren = document.createElement("div");
    ren.setAttribute("role", "menuitem");
    ren.textContent = "Rename";
    ren.style.padding = "4px 12px";
    ren.style.cursor = "pointer";
    ren.onclick = () => {
      hideContextMenu();
      onRename(item);
    };
    menu.appendChild(ren);
  }

  document.body.appendChild(menu);
  const close = () => {
    document.removeEventListener("click", close);
    hideContextMenu();
  };
  requestAnimationFrame(() => document.addEventListener("click", close));
}

async function onNewFolder(): Promise<void> {
  const name = window.prompt("New folder name:");
  if (!name?.trim()) return;
  const path =
    state.mode === "folder" ? state.apiPath + name.trim().replace(/[/\\]/g, "") + "/" : "";
  if (!path) return;
  const url = API_BASE ? `${API_BASE}/api/fs/create-folder` : "/api/fs/create-folder";
  const res = await fetchWithToken(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (res.ok) loadAndRenderList();
}

function onUploadFile(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file || state.mode !== "folder") return;
    const path = state.apiPath + file.name;
    const url = API_BASE ? `${API_BASE}/api/fs/upload-file` : "/api/fs/upload-file";
    const form = new FormData();
    form.append("path", path);
    form.append("file", file);
    const res = await fetchWithToken(url, { method: "POST", body: form });
    if (res.ok) loadAndRenderList();
  };
  input.click();
}

function onUploadZipApp(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".zip";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file || state.mode !== "folder") return;
    const dirName = file.name.replace(/\.zip$/i, "") || "app";
    const path = state.apiPath + dirName + "/";
    const url = API_BASE ? `${API_BASE}/api/fs/upload-zip-app` : "/api/fs/upload-zip-app";
    const form = new FormData();
    form.append("path", path);
    form.append("file", file);
    const res = await fetchWithToken(url, { method: "POST", body: form });
    if (res.ok) loadAndRenderList();
  };
  input.click();
}

async function onDelete(item: FsItem): Promise<void> {
  if (!window.confirm(`Delete ${item.name}?`)) return;
  const path =
    item.kind === "dir" ? (item.path.endsWith("/") ? item.path : item.path + "/") : item.path;
  const url = API_BASE ? `${API_BASE}/api/fs/delete` : "/api/fs/delete";
  const res = await fetchWithToken(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (res.status === 204) loadAndRenderList();
}

async function onRename(item: FsItem): Promise<void> {
  const newName = window.prompt("Rename to:", item.name);
  if (!newName?.trim() || newName === item.name) return;
  const parentPath = item.path.replace(/\/[^/]+$/, "").replace(/([^/])$/, "$1/");
  const fromPath =
    item.kind === "dir" ? (item.path.endsWith("/") ? item.path : item.path + "/") : item.path;
  const toPath =
    item.kind === "dir" ? parentPath + newName.trim() + "/" : parentPath + newName.trim();
  const url = API_BASE ? `${API_BASE}/api/fs/rename` : "/api/fs/rename";
  const res = await fetchWithToken(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromPath, toPath }),
  });
  if (res.ok) loadAndRenderList();
}

async function loadAndRenderList(): Promise<void> {
  if (state.mode !== "folder") return;
  const root = getRootEl();
  if (!root) return;
  root.innerHTML = "";
  renderAddressBar(state.path);
  const listEl = document.createElement("div");
  listEl.setAttribute("data-testid", "explorer-list");
  listEl.style.display = "grid";
  listEl.style.gridTemplateColumns = "repeat(auto-fill, minmax(80px, 1fr))";
  listEl.style.gap = "1rem";
  listEl.style.padding = "1rem";
  listEl.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest("[data-explorer-item]")) return;
    showContextMenu(e.clientX, e.clientY, "blank");
  });
  root.appendChild(listEl);
  try {
    const items = await fetchList(state.apiPath);
    for (const item of items) {
      const div = document.createElement("div");
      div.setAttribute("data-testid", `item-${item.name.replace(/\s/g, "-")}`);
      div.setAttribute("data-explorer-item", "1");
      div.textContent = item.name;
      const isOpenable =
        item.kind === "dir" ||
        (item.kind === "file" && mimeFromExt(item.name)?.startsWith("image/"));
      div.style.cursor = isOpenable ? "pointer" : "default";
      div.style.padding = "0.5rem";
      div.style.border = "1px solid #ccc";
      div.style.borderRadius = "4px";
      div.style.textAlign = "center";
      div.addEventListener("dblclick", () => void onItemDblClick(item));
      div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, "item", item);
      });
      listEl.appendChild(div);
    }
  } catch (e) {
    listEl.innerHTML = `<p style="color:red">Failed: ${(e as Error).message}</p>`;
  }
}

async function init(): Promise<void> {
  send("APP_READY", { appId: "explorer", version: "0.1.0" });
  send("WINDOW_TITLE", { title: "My Computer" });
  try {
    roots = await fetchRoots();
    renderRoots();
  } catch (e) {
    const root = getRootEl();
    if (root) {
      root.innerHTML = `<p style="color:red">Failed to load roots: ${(e as Error).message}</p>`;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
