/**
 * FP4 Media Player — system app, audio + video mode.
 * Sandbox: allow-scripts only. No gateway. Content via signed URL only.
 */

import { nextIndex, prevIndex } from "../../lib/fp4/playlist";
import { MediaPlayerState } from "../../lib/fp4/MediaPlayerState";
import { shouldShowPressPlay } from "../../lib/fp4/autoplay";

interface PlaylistItem {
  path: string;
  url: string;
}

type Mode = "audio" | "video";

let playlist: PlaylistItem[] = [];
let currentIndex = 0;
let mode: Mode = "audio";
let keydownHandlerRef: ((e: KeyboardEvent) => void) | null = null;
let state: MediaPlayerState;
let mediaEl: HTMLAudioElement | HTMLVideoElement | null = null;

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

function updateTitle(name: string): void {
  send("WINDOW_TITLE", { title: name || "Media Player" });
}

function syncMediaToState(): void {
  if (!mediaEl) return;
  const pressPlay = getEl("player-press-play");
  if (state.playbackState === "playing") {
    mediaEl
      .play()
      .then(() => {
        pressPlay?.style.setProperty("display", "none");
      })
      .catch((err) => {
        if (typeof console !== "undefined" && console.error) {
          console.error("[MediaPlayer] play() rejected:", err);
        }
        if (shouldShowPressPlay(true)) {
          pressPlay?.style.setProperty("display", "block");
        }
      });
  } else if (state.playbackState === "paused") {
    mediaEl.pause();
  } else {
    mediaEl.pause();
    mediaEl.currentTime = 0;
  }
  mediaEl.volume = state.volume / 100;
  const slider = getEl("volume-slider") as HTMLInputElement | null;
  if (slider) slider.value = String(state.volume);
}

const DEV_DEBUG = typeof import.meta !== "undefined" && import.meta.env?.DEV === true;
const LOAD_TIMEOUT_MS = 30000;

let currentMediaObjectUrl: string | null = null;

function revokeCurrentMediaObjectUrl(): void {
  if (currentMediaObjectUrl) {
    URL.revokeObjectURL(currentMediaObjectUrl);
    currentMediaObjectUrl = null;
  }
}

function setMediaSrcAndPlay(
  el: HTMLAudioElement | HTMLVideoElement,
  srcUrl: string,
  pressPlay: HTMLElement | null,
  loadError: HTMLElement | null,
  urlForLog: string
): void {
  let loadResolved = false;
  const resolveLoad = (): void => {
    if (loadResolved) return;
    loadResolved = true;
    if (loadError) loadError.style.display = "none";
  };
  const timeoutId = setTimeout(() => {
    if (loadResolved) return;
    if (DEV_DEBUG) console.debug("[MediaPlayer] load timeout");
    if (typeof console !== "undefined" && console.error) {
      console.error("[MediaPlayer] Load timeout (CORS/network?):", urlForLog);
    }
    resolveLoad();
    if (loadError) loadError.style.setProperty("display", "block");
  }, LOAD_TIMEOUT_MS);
  el.onerror = () => {
    clearTimeout(timeoutId);
    resolveLoad();
    if (DEV_DEBUG) console.debug("[MediaPlayer] onerror fired");
    if (typeof console !== "undefined" && console.error) {
      console.error("[MediaPlayer] Failed to load:", urlForLog);
    }
    if (loadError) loadError.style.setProperty("display", "block");
  };
  el.oncanplay = () => resolveLoad();
  el.crossOrigin = "anonymous";
  el.src = srcUrl;
  el.load();
  state.stop();
  el.play().then(
    () => {
      state.play();
      pressPlay?.style.setProperty("display", "none");
    },
    () => {
      if (shouldShowPressPlay(true)) {
        pressPlay?.style.setProperty("display", "block");
      }
    }
  );
}

function loadMedia(url: string): void {
  if (DEV_DEBUG) console.debug("[MediaPlayer] load started (direct URL):", url);
  if (mediaEl) {
    mediaEl.pause();
    mediaEl.currentTime = 0;
  }
  revokeCurrentMediaObjectUrl();

  const videoArea = getEl("player-video-area");
  const audioArea = getEl("player-audio-area");
  const pressPlay = getEl("player-press-play");
  const loadError = getEl("player-load-error");
  if (loadError) loadError.style.display = "none";

  if (mode === "video") {
    videoArea?.classList.remove("hidden");
    audioArea?.classList.add("hidden");
    const video = getEl("player-video") as HTMLVideoElement | null;
    if (video) {
      mediaEl = video;
      setMediaSrcAndPlay(video, url, pressPlay, loadError, url);
    }
  } else {
    videoArea?.classList.add("hidden");
    audioArea?.classList.remove("hidden");
    let audio = document.querySelector("#player-audio") as HTMLAudioElement | null;
    if (!audio && audioArea) {
      audio = document.createElement("audio");
      audio.id = "player-audio";
      audioArea.appendChild(audio);
    }
    if (audio) {
      mediaEl = audio;
      setMediaSrcAndPlay(audio, url, pressPlay, loadError, url);
    }
  }
  syncMediaToState();
}

function goPrev(): void {
  if (playlist.length <= 1) return;
  state.stop();
  currentIndex = prevIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    loadMedia(item.url);
    updateTitle(item.path.split("/").pop() ?? "");
  }
}

function goNext(): void {
  if (playlist.length <= 1) return;
  state.stop();
  currentIndex = nextIndex(currentIndex, playlist.length);
  const item = playlist[currentIndex];
  if (item) {
    loadMedia(item.url);
    updateTitle(item.path.split("/").pop() ?? "");
  }
}

function inferMode(path: string): Mode {
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  return ext === ".mp3" ? "audio" : "video";
}

function handleOpenFile(payload: {
  initialPath?: string;
  initialUrl?: string;
  playlist?: PlaylistItem[];
}): void {
  if (DEV_DEBUG) console.debug("[MediaPlayer] OPEN_FILE received");
  const list = payload.playlist ?? [];
  const initialPath = payload.initialPath ?? "";
  const initialUrl = payload.initialUrl ?? "";
  mode = inferMode((initialPath || list[0]?.path) ?? "audio");
  playlist = list.length > 0 ? list : initialUrl ? [{ path: initialPath, url: initialUrl }] : [];
  currentIndex = playlist.findIndex((p) => p.path === initialPath || p.url === initialUrl);
  if (currentIndex < 0) currentIndex = 0;

  state = new MediaPlayerState();

  const prevBtn = getEl("btn-prev") as HTMLButtonElement | null;
  const nextBtn = getEl("btn-next") as HTMLButtonElement | null;
  const playBtn = getEl("btn-play") as HTMLButtonElement | null;
  const pauseBtn = getEl("btn-pause") as HTMLButtonElement | null;
  const stopBtn = getEl("btn-stop") as HTMLButtonElement | null;
  const muteBtn = getEl("btn-mute") as HTMLButtonElement | null;
  const slider = getEl("volume-slider") as HTMLInputElement | null;

  if (prevBtn) {
    prevBtn.disabled = playlist.length <= 1;
    prevBtn.onclick = goPrev;
  }
  if (nextBtn) {
    nextBtn.disabled = playlist.length <= 1;
    nextBtn.onclick = goNext;
  }
  if (playBtn) {
    playBtn.onclick = () => {
      state.play();
      syncMediaToState();
    };
  }
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      state.pause();
      syncMediaToState();
    };
  }
  if (stopBtn) {
    stopBtn.onclick = () => {
      state.stop();
      syncMediaToState();
    };
  }
  if (muteBtn) {
    muteBtn.onclick = () => {
      state.toggleMute();
      if (mediaEl) mediaEl.volume = state.volume / 100;
      if (slider) slider.value = String(state.volume);
    };
  }
  if (slider) {
    slider.oninput = () => {
      const v = parseInt(slider.value, 10);
      state.setVolume(v);
      if (mediaEl) mediaEl.volume = state.volume / 100;
    };
  }

  if (keydownHandlerRef) {
    document.removeEventListener("keydown", keydownHandlerRef);
  }
  keydownHandlerRef = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      if (state.playbackState === "playing") {
        state.pause();
      } else {
        state.play();
      }
      syncMediaToState();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };
  document.addEventListener("keydown", keydownHandlerRef);

  if (initialUrl) {
    loadMedia(initialUrl);
  }
  updateTitle(initialPath.split("/").pop() ?? "Media Player");
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
