/**
 * Internet Explorer — system app, OPEN_FILE protocol.
 * Opens images, audio, video, HTML like Image Viewer and Media Player.
 * Sandbox: allow-scripts only. Content via signed URL only.
 */

import { nextIndex, prevIndex } from "@lib/fp4/playlist";

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

function hideAll(): void {
  const img = getEl("ie-img") as HTMLImageElement | null;
  const video = getEl("ie-video") as HTMLVideoElement | null;
  const audio = getEl("ie-audio") as HTMLAudioElement | null;
  const frame = getEl("ie-frame") as HTMLIFrameElement | null;
  const loading = getEl("ie-loading");
  const error = getEl("ie-error");
  if (img) img.style.display = "none";
  if (video) {
    video.pause();
    video.src = "";
    video.style.display = "none";
  }
  if (audio) {
    audio.pause();
    audio.src = "";
    audio.style.display = "none";
  }
  if (frame) {
    frame.src = "about:blank";
    frame.style.display = "none";
  }
  if (loading) loading.style.display = "none";
  if (error) error.style.display = "none";
}

function showError(msg: string): void {
  hideAll();
  const error = getEl("ie-error");
  const loading = getEl("ie-loading");
  if (error) {
    error.textContent = msg;
    error.style.display = "block";
  }
  if (loading) loading.style.display = "none";
}

function showContent(url: string, mime: string): void {
  hideAll();
  const loading = getEl("ie-loading");
  if (loading) loading.style.display = "block";

  if (mime.startsWith("image/")) {
    const img = getEl("ie-img") as HTMLImageElement | null;
    if (!img) return;
    img.onload = () => {
      if (loading) loading.style.display = "none";
      img.style.display = "block";
    };
    img.onerror = () => showError("Unable to load image");
    img.src = url;
  } else if (mime.startsWith("video/") || mime === "video/mp4" || mime === "video/webm") {
    const video = getEl("ie-video") as HTMLVideoElement | null;
    if (!video) return;
    video.onloadeddata = () => {
      if (loading) loading.style.display = "none";
      video.style.display = "block";
    };
    video.onerror = () => showError("Unable to load video");
    video.src = url;
  } else if (mime === "audio/mpeg" || mime.startsWith("audio/")) {
    const audio = getEl("ie-audio") as HTMLAudioElement | null;
    if (!audio) return;
    audio.onloadeddata = () => {
      if (loading) loading.style.display = "none";
      audio.style.display = "block";
    };
    audio.onerror = () => showError("Unable to load audio");
    audio.src = url;
  } else if (mime === "text/html" || mime.startsWith("text/")) {
    const frame = getEl("ie-frame") as HTMLIFrameElement | null;
    if (!frame) return;
    if (loading) loading.style.display = "none";
    frame.style.display = "block";
    frame.src = url;
  } else {
    showError("Unsupported type: " + mime);
  }
}

function inferMime(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const m: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    webm: "video/webm",
    html: "text/html",
    htm: "text/html",
    txt: "text/plain",
  };
  return m[ext] ?? "application/octet-stream";
}

function updateStatus(): void {
  const status = getEl("ie-status");
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
  send("WINDOW_TITLE", { title: name || "Internet Explorer" });
}

function goPrev(): void {
  if (playlist.length <= 1) return;
  currentIndex = prevIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    showContent(item.url, inferMime(item.path));
    updateStatus();
    updateTitle(item.path.split("/").pop() ?? "");
  }
}

function goNext(): void {
  if (playlist.length <= 1) return;
  currentIndex = nextIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    showContent(item.url, inferMime(item.path));
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
    showContent(initialUrl, inferMime(initialPath));
  }
  updateStatus();
  updateTitle(initialPath.split("/").pop() ?? "Internet Explorer");

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

const pending = (
  window as unknown as { __fp4PendingOpenFile?: Parameters<typeof handleOpenFile>[0] }
).__fp4PendingOpenFile;
if (pending) {
  (window as unknown as { __fp4PendingOpenFile?: unknown }).__fp4PendingOpenFile = null;
  handleOpenFile(pending);
}
