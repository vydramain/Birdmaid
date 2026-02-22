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

function send(type: string, payload?: Record<string, unknown>): void {
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type, payload, timestamp: Date.now() }, window.location.origin);
    } catch {
      /* ignore */
    }
  }
}

function getEl(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function showImage(url: string): void {
  const img = getEl("viewer-img") as HTMLImageElement | null;
  const loading = getEl("viewer-loading");
  const error = getEl("viewer-error");
  if (!img || !loading || !error) return;
  loading.style.display = "block";
  error.style.display = "none";
  img.style.display = "none";
  img.onerror = () => {
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "Unable to load image";
    img.style.display = "none";
  };
  img.onload = () => {
    loading.style.display = "none";
    error.style.display = "none";
    img.style.display = "block";
  };
  img.src = url;
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  });
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
