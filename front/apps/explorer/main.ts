/**
 * Explorer — system app, roots view + folder navigation.
 * FP3 M1: roots A/C/D. M2: double click C: -> C:/, list + address bar.
 * FP3 M5: context menu (New Folder, Upload, Delete, Rename), write API with token.
 * FP3.1 A2/A4: fs-tile layout, shared icons.
 * FP4 M3: list + open-url → playlist → SHELL_OPEN_FILE for image/audio/video.
 */

import "../../shared/fs-tile.css";
import { getMimeForPath } from "../../lib/fp4/handler";
import {
  getExtensionsForMedia,
  filterMediaItems,
  sortByLocaleCompare,
} from "../../lib/fp4/playlist";

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
/** FP3.1: Navigation history stack. "" = roots; apiPath = folder. */
const historyStack: string[] = [];
/** FP3.1 A3: Current list items for context menu delegation. */
let currentListItems: FsItem[] = [];

/** Unique testid from full path (M2a: avoids strict-mode duplicates). */
function pathToUniqueId(path: string): string {
  const norm = path.replace(/\/$/, "").replace(/^\//, "").replace(/\s+/g, "-");
  return norm.replace(/\//g, "-") || "item";
}

let pendingCreateId = 0;
let pendingUploadId = 0;

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

/** FP3.2 A8: dirname(fromPath) — parent dir with trailing slash. */
function dirname(apiPath: string): string {
  const trimmed = apiPath.replace(/\/$/, "");
  const idx = trimmed.lastIndexOf("/");
  return idx >= 0 ? trimmed.slice(0, idx + 1) : "";
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
      window.parent.postMessage({ type, payload, timestamp: Date.now() }, "*");
    } catch {
      /* ignore */
    }
  }
}

function getRootEl(): HTMLElement | null {
  return document.getElementById("explorer-root");
}

function renderToolbar(displayPath: string, backDisabled: boolean): void {
  let toolbar = document.querySelector("[data-testid='explorer-toolbar']") as HTMLDivElement | null;
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.setAttribute("data-testid", "explorer-toolbar");
    toolbar.style.display = "flex";
    toolbar.style.alignItems = "center";
    toolbar.style.gap = "0.25rem";
    toolbar.style.padding = "0.25rem 0.5rem";
    toolbar.style.borderBottom = "1px solid #ccc";
    toolbar.style.flexShrink = "0";
    toolbar.style.position = "sticky";
    toolbar.style.top = "0";
    toolbar.style.background = "#fff";
    toolbar.style.zIndex = "1";
    const container = getRootEl();
    if (container) container.insertBefore(toolbar, container.firstChild);

    const backBtn = document.createElement("button");
    backBtn.setAttribute("data-testid", "explorer-back");
    backBtn.setAttribute("aria-label", "Back");
    backBtn.style.fontSize = "0.875rem";
    backBtn.style.padding = "0.25rem 0.5rem";
    backBtn.style.cursor = "pointer";
    backBtn.style.border = "none";
    backBtn.style.background = "transparent";
    const backIcon = document.createElement("span");
    backIcon.className = "fs-tile-icon fs-icon-back";
    backIcon.setAttribute("aria-hidden", "true");
    backBtn.appendChild(backIcon);
    backBtn.addEventListener("click", onBackClick);
    toolbar.appendChild(backBtn);

    const bar = document.createElement("div");
    bar.setAttribute("data-testid", "address-bar");
    bar.style.fontSize = "0.875rem";
    bar.style.flex = "1";
    bar.style.minWidth = "1rem";
    bar.style.minHeight = "1rem";
    toolbar.appendChild(bar);
  }
  const backBtn = toolbar.querySelector("[data-testid='explorer-back']") as HTMLButtonElement;
  const bar = toolbar.querySelector("[data-testid='address-bar']");
  if (backBtn) {
    backBtn.disabled = backDisabled;
    backBtn.setAttribute("aria-disabled", backDisabled ? "true" : "false");
  }
  if (bar) {
    bar.textContent = displayPath;
  }
}

function onBackClick(): void {
  if (historyStack.length === 0) return;
  const prev = historyStack.pop()!;
  if (prev === "") {
    state = { mode: "roots" };
    renderRoots();
  } else {
    state = { mode: "folder", path: apiPathToDisplay(prev), apiPath: prev };
    loadAndRenderList();
  }
}

function pushHistory(): void {
  const entry = state.mode === "roots" ? "" : state.apiPath;
  historyStack.push(entry);
}

function createFsTile(
  iconClass: string,
  label: string,
  testId: string,
  onClick: () => void,
  iconTestId?: string,
  dataItemIndex?: number
): HTMLDivElement {
  const tile = document.createElement("div");
  tile.setAttribute("data-testid", testId);
  tile.setAttribute("data-explorer-item", "1");
  if (dataItemIndex !== undefined) tile.setAttribute("data-item-index", String(dataItemIndex));
  tile.className = "fs-tile";
  tile.style.cursor = "pointer";
  const icon = document.createElement("span");
  icon.className = `fs-tile-icon ${iconClass}`;
  if (iconTestId) icon.setAttribute("data-testid", iconTestId);
  icon.setAttribute("aria-hidden", "true");
  const labelEl = document.createElement("span");
  labelEl.className = "fs-tile-label";
  labelEl.textContent = label;
  tile.appendChild(icon);
  tile.appendChild(labelEl);
  tile.addEventListener("dblclick", onClick);
  return tile;
}

function onContentContextMenu(e: MouseEvent): void {
  e.preventDefault();
  const target = e.target as HTMLElement;
  const itemEl = target.closest("[data-explorer-item][data-item-index]");
  if (itemEl) {
    const idx = parseInt(itemEl.getAttribute("data-item-index") ?? "-1", 10);
    const item = currentListItems[idx];
    if (item) showContextMenu(e.clientX, e.clientY, "item", item);
    return;
  }
  showContextMenu(e.clientX, e.clientY, "blank");
}

function createContentWrapper(): HTMLDivElement {
  const content = document.createElement("div");
  content.setAttribute("data-testid", "explorer-content");
  content.style.flex = "1";
  content.style.minHeight = "0";
  content.style.overflow = "auto";
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.addEventListener("contextmenu", onContentContextMenu);
  return content;
}

function renderRoots(): void {
  const root = getRootEl();
  if (!root) return;
  root.innerHTML = "";
  /* FP3.2: No toolbar in roots view */
  const content = createContentWrapper();
  const grid = document.createElement("div");
  grid.setAttribute("data-testid", "explorer-roots");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(var(--fs-tile-width), var(--fs-tile-width)))";
  grid.style.gap = "1rem";
  grid.style.padding = "1rem";
  /* FP3.2: Only disks A/C/D; no "My Computer" tile */
  for (const r of roots) {
    const item = createFsTile(
      "fs-icon-disk",
      labelToDisplay(r.id, r.label),
      `root-${r.id.toLowerCase()}`,
      () => onRootDblClick(r.id)
    );
    grid.appendChild(item);
  }
  content.appendChild(grid);
  root.appendChild(content);
  root.setAttribute("data-testid", "explorer-ready");
}

function onRootDblClick(rootId: string): void {
  pushHistory();
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
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return map[ext];
}

const PLAYLIST_LIMIT = 100;

function mimeToMedia(mime: string): "image" | "audio" | "video" | null {
  if (mime.startsWith("image/")) return "image";
  if (mime === "audio/mpeg") return "audio";
  if (mime.startsWith("video/")) return "video";
  return null;
}

async function fetchOpenUrl(path: string): Promise<string | null> {
  const url = API_BASE ? `${API_BASE}/api/fs/open-url` : "/api/fs/open-url";
  const res = await fetchWithToken(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { url?: string };
  return typeof data.url === "string" ? data.url : null;
}

async function buildPlaylistAndOpen(clickedPath: string): Promise<void> {
  const mime = getMimeForPath(clickedPath);
  if (!mime) {
    if (typeof console !== "undefined" && console.warn)
      console.warn("[Explorer] Unsupported file type, no handler:", clickedPath);
    return;
  }
  const media = mimeToMedia(mime);
  if (!media) return;
  const dirPath = dirname(clickedPath);
  let items: FsItem[];
  try {
    items = await fetchList(dirPath);
  } catch {
    if (typeof console !== "undefined" && console.warn)
      console.warn("[Explorer] List failed for playlist:", dirPath);
    return;
  }
  const ext = getExtensionsForMedia(media);
  const playlistItems = filterMediaItems(items, ext);
  const sorted = sortByLocaleCompare(playlistItems);
  const limited = sorted.slice(0, PLAYLIST_LIMIT);
  const playlist: Array<{ path: string; url: string }> = [];
  for (const p of limited) {
    const url = await fetchOpenUrl(p.path);
    if (url) playlist.push({ path: p.path, url });
  }
  if (playlist.length === 0) {
    if (typeof console !== "undefined" && console.warn)
      console.warn("[Explorer] No signed URLs for playlist:", clickedPath);
    return;
  }
  send("SHELL_OPEN_FILE", { path: clickedPath, playlist });
}

async function onItemDblClick(item: FsItem): Promise<void> {
  if (item.kind === "file") {
    const mime = getMimeForPath(item.path);
    const media = mime ? mimeToMedia(mime) : null;
    if (media) {
      await buildPlaylistAndOpen(item.path);
      return;
    }
    if (typeof console !== "undefined" && console.warn)
      console.warn("[Explorer] Unsupported file type, no handler:", item.path);
    return;
  }
  const apiPath = item.path.endsWith("/") ? item.path : item.path + "/";
  const isApp = item.isApp ?? (await checkIsApp(apiPath));
  if (isApp) {
    send("SHELL_OPEN", { kind: "app", path: apiPath, title: item.name });
    return;
  }
  pushHistory();
  state = { mode: "folder", path: apiPathToDisplay(apiPath), apiPath };
  loadAndRenderList();
}

// State for context menu; used for positioning and target (item vs blank). Read when extending menu behavior.
let contextMenuState: {
  x: number;
  y: number;
  target: "blank" | "item";
  item?: FsItem;
} | null = null;

function hideContextMenu(): void {
  void contextMenuState; // read for TS noUnusedLocals (state holder for context menu)
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
    // M4: Ensure upload inputs exist for E2E setInputFiles (no native picker needed)
    getOrCreateUploadFileInput();
    getOrCreateUploadZipInput();
    const newFolder = document.createElement("div");
    newFolder.setAttribute("role", "menuitem");
    newFolder.setAttribute("data-testid", "menu-new-folder");
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
    uploadFile.setAttribute("data-testid", "menu-upload-file");
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
    uploadZip.setAttribute("data-testid", "menu-upload-zip");
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
    del.setAttribute("data-testid", "menu-delete");
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
    ren.setAttribute("data-testid", "menu-rename");
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

const NEW_FOLDER_BASE = "Новая Папка";
const CREATE_FOLDER_RETRY_MAX = 5;

function suggestNewFolderName(items: FsItem[]): string {
  const used = new Set<string>();
  for (const it of items) {
    if (it.name === NEW_FOLDER_BASE) used.add("1");
    const m = it.name.match(
      new RegExp(`^${NEW_FOLDER_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (\\d+)$`)
    );
    if (m) used.add(m[1]);
  }
  if (!used.has("1")) return NEW_FOLDER_BASE;
  for (let n = 2; n <= CREATE_FOLDER_RETRY_MAX + 2; n++) {
    if (!used.has(String(n))) return `${NEW_FOLDER_BASE} ${n}`;
  }
  return `${NEW_FOLDER_BASE} ${Date.now()}`;
}

function nextNewFolderNameAfter(current: string): string {
  if (current === NEW_FOLDER_BASE) return `${NEW_FOLDER_BASE} 2`;
  const m = current.match(
    new RegExp(`^${NEW_FOLDER_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (\\d+)$`)
  );
  if (m) return `${NEW_FOLDER_BASE} ${parseInt(m[1], 10) + 1}`;
  return `${NEW_FOLDER_BASE} 2`;
}

async function createFolderWithRetry(
  baseName: string,
  onRetry: (nextName: string) => void
): Promise<{ ok: true; path: string; name: string } | { ok: false }> {
  const url = API_BASE ? `${API_BASE}/api/fs/create-folder` : "/api/fs/create-folder";
  let name = baseName;
  for (let k = 0; k < CREATE_FOLDER_RETRY_MAX; k++) {
    const path = state.mode === "folder" ? state.apiPath + name.replace(/[/\\]/g, "") + "/" : "";
    if (!path) return { ok: false };
    const res = await fetchWithToken(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (res.ok) {
      const data = (await res.json()) as { path?: string; name?: string };
      return { ok: true, path: data.path ?? path, name: data.name ?? name };
    }
    if (res.status === 409) {
      name = nextNewFolderNameAfter(name);
      onRetry(name);
      continue;
    }
    return { ok: false };
  }
  return { ok: false };
}

async function onNewFolder(): Promise<void> {
  if (state.mode !== "folder" || !isWritablePath(state.apiPath)) return;
  const apiPath = state.apiPath;
  const name = suggestNewFolderName(currentListItems);
  const placeholderPath = apiPath + name.replace(/[/\\]/g, "") + "/";
  const placeholder: FsItem = { path: placeholderPath, name, kind: "dir" };
  currentListItems.push(placeholder);

  const listEl = document.querySelector("[data-testid='explorer-list']") as HTMLDivElement | null;
  if (!listEl) {
    currentListItems.pop();
    return;
  }
  const idx = currentListItems.length - 1;
  const pendingId = pendingCreateId++;
  const tempTestId = `item-pending-${pendingId}`;
  const div = createFsTile("fs-icon-folder", name, tempTestId, () => {}, undefined, idx);
  div.setAttribute("data-placeholder", "1");
  const spinner = document.createElement("div");
  spinner.className = "fs-tile-spinner";
  spinner.setAttribute("data-testid", "new-folder-spinner");
  div.appendChild(spinner);
  listEl.appendChild(div);

  const result = await createFolderWithRetry(name, (nextName) => {
    placeholder.name = nextName;
    placeholder.path = apiPath + nextName.replace(/[/\\]/g, "") + "/";
    const labelEl = div.querySelector(".fs-tile-label");
    if (labelEl) labelEl.textContent = nextName;
    div.setAttribute("data-testid", `item-pending-${pendingId}`);
  });
  if (!result.ok) {
    div.remove();
    currentListItems.pop();
    console.error("[Explorer] create-folder failed");
    return;
  }
  placeholder.path = result.path;
  placeholder.name = result.name;
  div.remove();
  const testId = `item-${pathToUniqueId(result.path)}`;
  const newTile = createFsTile(
    "fs-icon-folder",
    result.name,
    testId,
    () => void onItemDblClick(placeholder),
    undefined,
    idx
  );
  listEl.appendChild(newTile);
  reindexListTiles();
  startRename(placeholder);
}

const UPLOAD_ACCEPT = ".png,.jpg,.jpeg,.webp,.mp3,.mp4,.webm";
const UPLOAD_MAX_FILES = 10;

let uploadFileInput: HTMLInputElement | null = null;
let uploadZipInput: HTMLInputElement | null = null;

function getOrCreateUploadFileInput(): HTMLInputElement {
  if (!uploadFileInput) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = UPLOAD_ACCEPT;
    input.setAttribute("data-testid", "upload-file-input");
    input.style.position = "absolute";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    input.style.width = "0";
    input.style.height = "0";
    input.onchange = onUploadFileChange;
    document.body.appendChild(input);
    uploadFileInput = input;
  }
  return uploadFileInput;
}

function getOrCreateUploadZipInput(): HTMLInputElement {
  if (!uploadZipInput) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.setAttribute("data-testid", "upload-zip-input");
    input.style.position = "absolute";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    input.style.width = "0";
    input.style.height = "0";
    input.onchange = onUploadZipChange;
    document.body.appendChild(input);
    uploadZipInput = input;
  }
  return uploadZipInput;
}

async function onUploadFileChange(): Promise<void> {
  const input = uploadFileInput;
  if (!input) return;
  const files = Array.from(input.files ?? []).slice(0, UPLOAD_MAX_FILES);
  input.value = "";
  if (!files.length || state.mode !== "folder") return;
  const apiPath = state.apiPath;
  const url = API_BASE ? `${API_BASE}/api/fs/upload-file` : "/api/fs/upload-file";
  const listEl = document.querySelector("[data-testid='explorer-list']") as HTMLDivElement | null;
  if (!listEl) return;

  for (const file of files) {
    const path = apiPath + file.name;
    const placeholder: FsItem = { path, name: file.name, kind: "file" };
    currentListItems.push(placeholder);
    const idx = currentListItems.length - 1;
    const tempId = pendingUploadId++;
    const testId = `item-pending-upload-${tempId}`;
    const div = createFsTile(
      "fs-icon-file",
      file.name,
      testId,
      () => onItemDblClick(placeholder),
      undefined,
      idx
    );
    div.setAttribute("data-placeholder", "1");
    div.setAttribute("data-upload-placeholder", "1");
    const labelEl = div.querySelector(".fs-tile-label") as HTMLElement;
    const spinner = document.createElement("div");
    spinner.className = "fs-tile-spinner";
    spinner.setAttribute("data-testid", "upload-spinner");
    if (labelEl) labelEl.replaceWith(spinner);
    listEl.appendChild(div);

    try {
      const form = new FormData();
      form.append("path", path);
      form.append("file", file);
      const res = await fetchWithToken(url, { method: "POST", body: form });
      if (res.status === 201) {
        const data = (await res.json()) as { path?: string; name?: string };
        placeholder.path = data.path ?? path;
        placeholder.name = data.name ?? file.name;
        div.setAttribute("data-testid", `item-${pathToUniqueId(placeholder.path)}`);
        const restored = document.createElement("span");
        restored.className = "fs-tile-label";
        restored.textContent = placeholder.name;
        spinner.replaceWith(restored);
        div.removeAttribute("data-placeholder");
        div.removeAttribute("data-upload-placeholder");
      } else {
        div.remove();
        currentListItems.splice(currentListItems.indexOf(placeholder), 1);
        console.error("[Explorer] upload failed:", res.status, await res.text());
      }
    } catch (e) {
      div.remove();
      currentListItems.splice(currentListItems.indexOf(placeholder), 1);
      console.error("[Explorer] upload error:", e);
    }
    reindexListTiles();
  }
}

function onUploadFile(): void {
  getOrCreateUploadFileInput().click();
}

function reindexListTiles(): void {
  const listEl = document.querySelector("[data-testid='explorer-list']");
  if (!listEl) return;
  for (let i = 0; i < listEl.children.length; i++) {
    (listEl.children[i] as HTMLElement).setAttribute("data-item-index", String(i));
  }
}

async function onUploadZipChange(): Promise<void> {
  const input = uploadZipInput;
  if (!input) return;
  const file = input.files?.[0];
  input.value = "";
  if (!file || state.mode !== "folder") return;
  const apiPath = state.apiPath;
  const dirName = file.name.replace(/\.zip$/i, "") || "app";
  const path = apiPath + dirName + "/";
  const placeholder: FsItem = { path, name: dirName, kind: "dir", isApp: true };
  currentListItems.push(placeholder);

  const listEl = document.querySelector("[data-testid='explorer-list']") as HTMLDivElement | null;
  if (!listEl) {
    currentListItems.pop();
    return;
  }
  const idx = currentListItems.length - 1;
  const tempId = pendingUploadId++;
  const testId = `item-pending-upload-${tempId}`;
  const div = createFsTile(
    "fs-icon-app",
    dirName,
    testId,
    () => onItemDblClick(placeholder),
    undefined,
    idx
  );
  div.setAttribute("data-placeholder", "1");
  div.setAttribute("data-upload-zip-placeholder", "1");
  const labelEl = div.querySelector(".fs-tile-label") as HTMLElement;
  const spinner = document.createElement("div");
  spinner.className = "fs-tile-spinner";
  spinner.setAttribute("data-testid", "upload-zip-spinner");
  if (labelEl) labelEl.replaceWith(spinner);
  listEl.appendChild(div);

  const url = API_BASE ? `${API_BASE}/api/fs/upload-zip-app` : "/api/fs/upload-zip-app";
  try {
    const form = new FormData();
    form.append("path", path);
    form.append("file", file);
    const res = await fetchWithToken(url, { method: "POST", body: form });
    if (res.status === 201) {
      const data = (await res.json()) as { path?: string; name?: string };
      placeholder.path = (data.path ?? path).replace(/\/?$/, "/");
      placeholder.name = data.name ?? dirName;
      placeholder.isApp = true;
      div.setAttribute("data-testid", `item-${pathToUniqueId(placeholder.path)}`);
      const restored = document.createElement("span");
      restored.className = "fs-tile-label";
      restored.textContent = placeholder.name;
      spinner.replaceWith(restored);
      div.removeAttribute("data-placeholder");
      div.removeAttribute("data-upload-zip-placeholder");
    } else {
      div.remove();
      currentListItems.splice(currentListItems.indexOf(placeholder), 1);
      console.error("[Explorer] upload-zip-app failed:", res.status, await res.text());
    }
  } catch (e) {
    div.remove();
    currentListItems.splice(currentListItems.indexOf(placeholder), 1);
    console.error("[Explorer] upload-zip-app error:", e);
  }
  reindexListTiles();
}

function onUploadZipApp(): void {
  getOrCreateUploadZipInput().click();
}

async function onDelete(item: FsItem): Promise<void> {
  if (!window.confirm(`Delete ${item.name}?`)) return;
  const found = getTileForItem(item);
  if (!found) return;
  const { tile, labelEl } = found;
  const oldName = item.name;
  tile.setAttribute("aria-disabled", "true");
  tile.style.pointerEvents = "none";
  const spinner = document.createElement("div");
  spinner.setAttribute("data-testid", "delete-spinner");
  spinner.className = "fs-tile-spinner";
  labelEl.replaceWith(spinner);

  const path =
    item.kind === "dir" ? (item.path.endsWith("/") ? item.path : item.path + "/") : item.path;
  const url = API_BASE ? `${API_BASE}/api/fs/delete` : "/api/fs/delete";
  try {
    const res = await fetchWithToken(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (res.status === 204) {
      const idx = currentListItems.findIndex((i) => itemPathMatch(i, item));
      if (idx >= 0) {
        currentListItems.splice(idx, 1);
        tile.remove();
        const listEl = document.querySelector("[data-testid='explorer-list']");
        if (listEl) {
          for (let i = idx; i < listEl.children.length; i++) {
            (listEl.children[i] as HTMLElement).setAttribute("data-item-index", String(i));
          }
        }
      }
    } else {
      tile.removeAttribute("aria-disabled");
      tile.style.pointerEvents = "";
      const restored = document.createElement("span");
      restored.className = "fs-tile-label";
      restored.textContent = oldName;
      spinner.replaceWith(restored);
      console.error("[Explorer] delete failed:", res.status, await res.text());
    }
  } catch (e) {
    tile.removeAttribute("aria-disabled");
    tile.style.pointerEvents = "";
    const restored = document.createElement("span");
    restored.className = "fs-tile-label";
    restored.textContent = oldName;
    spinner.replaceWith(restored);
    console.error("[Explorer] delete error:", e);
  }
}

function itemPathMatch(a: FsItem, b: FsItem): boolean {
  const pa = a.kind === "dir" && !a.path.endsWith("/") ? a.path + "/" : a.path;
  const pb = b.kind === "dir" && !b.path.endsWith("/") ? b.path + "/" : b.path;
  return pa === pb;
}

function getTileForItem(item: FsItem): { tile: HTMLDivElement; labelEl: HTMLElement } | null {
  const idx = currentListItems.findIndex((i) => itemPathMatch(i, item));
  if (idx < 0) return null;
  const tile = document.querySelector(`[data-item-index="${idx}"]`) as HTMLDivElement | null;
  if (!tile) return null;
  const labelEl = tile.querySelector(".fs-tile-label") as HTMLElement | null;
  if (!labelEl) return null;
  return { tile, labelEl };
}

function startRename(item: FsItem): void {
  const found = getTileForItem(item);
  if (!found) return;
  const { tile, labelEl } = found;
  const oldName = item.name;
  const input = document.createElement("input");
  input.setAttribute("data-testid", "rename-input");
  input.type = "text";
  input.value = oldName;
  input.className = "fs-tile-label";
  input.style.fontSize = "var(--fs-tile-font-size)";
  input.style.width = "100%";
  input.style.textAlign = "center";
  input.style.border = "none";
  input.style.background = "transparent";
  input.style.outline = "1px solid var(--wm-accent, #0078d4)";
  labelEl.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const commit = (): void => {
    if (done) return;
    const newName = input.value.trim();
    if (!newName || newName === oldName) {
      cancel();
      return;
    }
    done = true;
    void commitRename(item, newName, tile, oldName);
  };

  const cancel = (): void => {
    if (done) return;
    done = true;
    input.replaceWith(labelEl);
    labelEl.textContent = oldName;
    labelEl.className = "fs-tile-label";
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });
  input.addEventListener("blur", () => void Promise.resolve().then(() => commit()), {
    capture: false,
  });
}

async function commitRename(
  item: FsItem,
  newName: string,
  tile: HTMLDivElement,
  oldName: string
): Promise<void> {
  const fromPath =
    item.kind === "dir" ? (item.path.endsWith("/") ? item.path : item.path + "/") : item.path;
  const parentPath = dirname(fromPath);
  const toPath = item.kind === "dir" ? parentPath + newName + "/" : parentPath + newName;
  const input = tile.querySelector("[data-testid='rename-input']") as HTMLInputElement | null;
  if (input) input.remove();
  tile.setAttribute("aria-disabled", "true");
  tile.style.pointerEvents = "none";
  const labelEl = document.createElement("span");
  labelEl.className = "fs-tile-label";
  const spinner = document.createElement("div");
  spinner.setAttribute("data-testid", "rename-spinner");
  spinner.className = "fs-tile-spinner";
  tile.appendChild(spinner);

  const url = API_BASE ? `${API_BASE}/api/fs/rename` : "/api/fs/rename";
  try {
    const res = await fetchWithToken(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPath, toPath }),
    });
    spinner.remove();
    tile.removeAttribute("aria-disabled");
    tile.style.pointerEvents = "";
    if (res.ok) {
      const idx = currentListItems.findIndex((i) => itemPathMatch(i, item));
      if (idx >= 0) {
        const entry = currentListItems[idx];
        entry.name = newName;
        entry.path = toPath;
      }
      labelEl.textContent = newName;
      tile.setAttribute("data-testid", `item-${pathToUniqueId(toPath)}`);
      tile.appendChild(labelEl);
    } else {
      labelEl.textContent = oldName;
      tile.appendChild(labelEl);
      console.error("[Explorer] rename failed:", res.status, await res.text());
    }
  } catch (e) {
    spinner.remove();
    tile.removeAttribute("aria-disabled");
    tile.style.pointerEvents = "";
    labelEl.textContent = oldName;
    tile.appendChild(labelEl);
    console.error("[Explorer] rename error:", e);
  }
}

function onRename(item: FsItem): void {
  startRename(item);
}

async function loadAndRenderList(): Promise<void> {
  if (state.mode !== "folder") return;
  const root = getRootEl();
  if (!root) return;
  root.innerHTML = "";
  renderToolbar(state.path, historyStack.length === 0);
  const content = createContentWrapper();
  const listEl = document.createElement("div");
  listEl.setAttribute("data-testid", "explorer-list");
  listEl.style.display = "grid";
  listEl.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(var(--fs-tile-width), var(--fs-tile-width)))";
  listEl.style.gap = "1rem";
  listEl.style.padding = "1rem";
  listEl.style.flexShrink = "0";
  content.appendChild(listEl);
  const blankArea = document.createElement("div");
  blankArea.setAttribute("data-testid", "explorer-blank-area");
  blankArea.style.flex = "1";
  blankArea.style.minHeight = "50vh";
  blankArea.style.cursor = "default";
  content.appendChild(blankArea);
  root.appendChild(content);
  try {
    const items = await fetchList(state.apiPath);
    currentListItems = items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const iconClass =
        item.kind === "dir" ? (item.isApp ? "fs-icon-app" : "fs-icon-folder") : "fs-icon-file";
      const testId = `item-${pathToUniqueId(item.path)}`;
      const div = createFsTile(
        iconClass,
        item.name,
        testId,
        () => void onItemDblClick(item),
        undefined,
        i
      );
      const isOpenable =
        item.kind === "dir" ||
        (item.kind === "file" && mimeFromExt(item.name)?.startsWith("image/"));
      if (!isOpenable) {
        div.style.cursor = "default";
        div.setAttribute("aria-disabled", "true");
      }
      listEl.appendChild(div);
    }
    root.setAttribute("data-testid", "explorer-ready");
  } catch (e) {
    listEl.innerHTML = `<p style="color:red">Failed: ${(e as Error).message}</p>`;
  }
}

function setupExplorerRootLayout(): void {
  const root = getRootEl();
  if (!root) return;
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.minHeight = "100vh";
  root.style.overflow = "hidden";
}

async function init(): Promise<void> {
  send("APP_READY", { appId: "explorer", version: "0.1.0" });
  send("WINDOW_TITLE", { title: "My Computer" });
  setupExplorerRootLayout();
  getOrCreateUploadFileInput();
  getOrCreateUploadZipInput();
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
