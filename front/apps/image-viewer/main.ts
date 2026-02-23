/**
 * FP4 Image Viewer — system app, OPEN_FILE protocol.
 * Sandbox: allow-scripts only. No gateway. Content via signed URL only.
 */

import { nextIndex, prevIndex } from "../../lib/fp4/playlist";

interface PlaylistItem {
  path: string;
  url: string;
}

let playlist: PlaylistItem[] = [];
let currentIndex = 0;
let keydownHandlerRef: ((e: KeyboardEvent) => void) | null = null;

function send(type: string, payload?: Record<string, unknown>): void {
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type, payload, timestamp: Date.now() }, "*");
    } catch {
      /* ignore */
    }
  }
}

function getEl(id: string): HTMLElement | null {
  return document.getElementById(id);
}

const DEV_DEBUG = typeof import.meta !== "undefined" && import.meta.env?.DEV === true;

const LOAD_TIMEOUT_MS = 10000;

let currentObjectUrl: string | null = null;

function revokeCurrentObjectUrl(): void {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function showImage(url: string): void {
  const img = getEl("viewer-img") as HTMLImageElement | null;
  const loading = getEl("viewer-loading");
  const error = getEl("viewer-error");
  if (!img || !loading || !error) return;

  revokeCurrentObjectUrl();
  img.src = "";
  loading.style.display = "block";
  error.style.display = "none";
  img.style.display = "none";
  if (DEV_DEBUG) console.debug("[ImageViewer] fetch started:", url);

  let resolved = false;
  const resolve = (): void => {
    if (resolved) return;
    resolved = true;
    loading.style.display = "none";
  };

  const timeoutId = setTimeout(() => {
    if (resolved) return;
    if (DEV_DEBUG) console.debug("[ImageViewer] load timeout");
    if (typeof console !== "undefined" && console.error) {
      console.error("[ImageViewer] Load timeout (CORS/network?):", url);
    }
    resolve();
    error.style.display = "block";
    error.textContent = "Unable to load image";
    img.style.display = "none";
  }, LOAD_TIMEOUT_MS);

  fetch(url, { mode: "cors" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const ct = res.headers.get("Content-Type") ?? "";
      if (!ct.toLowerCase().startsWith("image/")) {
        throw new Error(`Invalid Content-Type: ${ct}`);
      }
      return res.blob();
    })
    .then((blob) => {
      if (resolved) return;
      clearTimeout(timeoutId);
      const objectUrl = URL.createObjectURL(blob);
      currentObjectUrl = objectUrl;
      img.onerror = () => {
        revokeCurrentObjectUrl();
        resolve();
        error.style.display = "block";
        error.textContent = "Unable to load image";
        img.style.display = "none";
      };
      img.onload = () => {
        resolve();
        error.style.display = "none";
        img.style.display = "block";
      };
      img.src = objectUrl;
    })
    .catch((err) => {
      if (resolved) return;
      clearTimeout(timeoutId);
      if (DEV_DEBUG) console.debug("[ImageViewer] fetch failed:", err);
      if (typeof console !== "undefined" && console.error) {
        console.error("[ImageViewer] Failed to load image:", url, err);
      }
      resolve();
      error.style.display = "block";
      error.textContent = "Unable to load image";
      img.style.display = "none";
    });
}

function updateStatus(): void {
  const status = getEl("viewer-status");
  if (!status) return;
  const len = playlist.length;
  if (len <= 0) {
    status.textContent = "";
    return;
  }
  const item = playlist[currentIndex];
  const name = item?.path?.split("/").pop() ?? "";
  status.textContent = len > 1 ? `${currentIndex + 1} of ${len}` : name;
}

function updateTitle(name: string): void {
  send("WINDOW_TITLE", { title: name || "Picture Viewer" });
}

function goPrev(): void {
  if (playlist.length <= 1) return;
  currentIndex = prevIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    showImage(item.url);
    updateStatus();
    updateTitle(item.path.split("/").pop() ?? "");
  }
}

function goNext(): void {
  if (playlist.length <= 1) return;
  currentIndex = nextIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    showImage(item.url);
    updateStatus();
    updateTitle(item.path.split("/").pop() ?? "");
  }
}

function handleOpenFile(payload: {
  initialPath?: string;
  initialUrl?: string;
  playlist?: PlaylistItem[];
}): void {
  if (DEV_DEBUG) console.debug("[ImageViewer] OPEN_FILE received");
  const list = payload.playlist ?? [];
  const initialPath = payload.initialPath ?? "";
  const initialUrl = payload.initialUrl ?? "";
  playlist = list.length > 0 ? list : initialUrl ? [{ path: initialPath, url: initialUrl }] : [];
  currentIndex = playlist.findIndex((p) => p.path === initialPath || p.url === initialUrl);
  if (currentIndex < 0) currentIndex = 0;

  const prevBtn = getEl("btn-prev") as HTMLButtonElement | null;
  const nextBtn = getEl("btn-next") as HTMLButtonElement | null;
  if (prevBtn) {
    prevBtn.disabled = playlist.length <= 1;
    prevBtn.onclick = goPrev;
  }
  if (nextBtn) {
    nextBtn.disabled = playlist.length <= 1;
    nextBtn.onclick = goNext;
  }

  if (initialUrl) {
    showImage(initialUrl);
  }
  updateStatus();
  updateTitle(initialPath.split("/").pop() ?? "Picture Viewer");

  if (keydownHandlerRef) {
    document.removeEventListener("keydown", keydownHandlerRef);
  }
  keydownHandlerRef = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };
  document.addEventListener("keydown", keydownHandlerRef);
}

window.addEventListener("message", (e) => {
  const data = e.data as { type?: string; payload?: Record<string, unknown> };
  if (data?.type === "OPEN_FILE" && data.payload) {
    handleOpenFile(data.payload as Parameters<typeof handleOpenFile>[0]);
  }
});

// Process OPEN_FILE if it arrived before module load (early APP_READY)
const pending = (
  window as unknown as { __fp4PendingOpenFile?: Parameters<typeof handleOpenFile>[0] }
).__fp4PendingOpenFile;
if (pending) {
  (window as unknown as { __fp4PendingOpenFile?: unknown }).__fp4PendingOpenFile = null;
  handleOpenFile(pending);
}
