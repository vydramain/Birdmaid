/**
 * FP4 Media Player — system app, audio + video mode.
 * Sandbox: allow-scripts only. No gateway. Content via signed URL only.
 */

import { nextIndex, prevIndex } from "@lib/fp4/playlist";

const DEBUG = false;
const _log =
  DEBUG && typeof globalThis !== "undefined"
    ? (Reflect.get(globalThis, "console") as
        | { debug?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void }
        | undefined)
    : undefined;
const log = {
  debug: (...a: unknown[]) => _log?.debug?.(...a),
  error: (...a: unknown[]) => _log?.error?.(...a),
};

const DEBUG = false;
const _log =
  DEBUG && typeof globalThis !== "undefined"
    ? (Reflect.get(globalThis, "console") as
        | { debug?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void }
        | undefined)
    : undefined;
const log = {
  debug: (...a: unknown[]) => _log?.debug?.(...a),
  error: (...a: unknown[]) => _log?.error?.(...a),
};
import { MediaPlayerState } from "@lib/fp4/MediaPlayerState";
import { shouldShowPressPlay } from "@lib/fp4/autoplay";
import { computeSeekTime, isSeekDisabled } from "@lib/fp4/seek";

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

function updateTimelineUI(): void {
  const timeline = getEl("player-timeline") as HTMLElement | null;
  const fill = getEl("player-timeline-fill");
  const thumb = getEl("player-timeline-thumb");
  if (!timeline || !mediaEl || !fill || !thumb) return;
  const duration = mediaEl.duration;
  const disabled = isSeekDisabled(duration);
  timeline.setAttribute("aria-valuemax", String(duration));
  if (disabled) {
    timeline.setAttribute("aria-disabled", "true");
    timeline.classList.add("disabled");
    fill.style.width = "0%";
    thumb.style.left = "0%";
    return;
  }
  timeline.setAttribute("aria-disabled", "false");
  timeline.classList.remove("disabled");
  const t = mediaEl.currentTime;
  const pct = duration > 0 ? (t / duration) * 100 : 0;
  timeline.setAttribute("aria-valuenow", String(t));
  fill.style.width = `${pct}%`;
  thumb.style.left = `${pct}%`;
}

function setupTimelineSeek(): void {
  const timeline = getEl("player-timeline");
  if (!timeline) return;
  let seeking = false;
  const onPointerUp = (e: PointerEvent): void => {
    if (!seeking || !mediaEl) return;
    seeking = false;
    timeline.releasePointerCapture(e.pointerId);
    const rect = timeline.getBoundingClientRect();
    const t = computeSeekTime(e.clientX, rect, mediaEl.duration);
    if (Number.isFinite(mediaEl.duration) && mediaEl.duration > 0) {
      mediaEl.currentTime = t;
    }
  };
  timeline.addEventListener("pointerdown", (e: PointerEvent) => {
    if (timeline.classList.contains("disabled") || isSeekDisabled(mediaEl?.duration ?? NaN)) return;
    seeking = true;
    timeline.setPointerCapture(e.pointerId);
  });
  timeline.addEventListener("pointermove", (e: PointerEvent) => {
    if (!seeking || !mediaEl) return;
    const rect = timeline.getBoundingClientRect();
    const t = computeSeekTime(e.clientX, rect, mediaEl.duration);
    if (Number.isFinite(mediaEl.duration) && mediaEl.duration > 0) {
      mediaEl.currentTime = t;
    }
  }); // seek while dragging (immediate feedback)
  timeline.addEventListener("pointerup", onPointerUp);
  timeline.addEventListener("pointercancel", () => {
    seeking = false;
  });
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
        log.error("[MediaPlayer] play() rejected:", err);
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
    log.debug("[MediaPlayer] load timeout");
    log.error("[MediaPlayer] Load timeout (CORS/network?):", urlForLog);
    resolveLoad();
    if (loadError) loadError.style.setProperty("display", "block");
  }, LOAD_TIMEOUT_MS);
  el.onerror = () => {
    clearTimeout(timeoutId);
    resolveLoad();
    log.debug("[MediaPlayer] onerror fired");
    log.error("[MediaPlayer] Failed to load:", urlForLog);
    if (loadError) loadError.style.setProperty("display", "block");
  };
  el.oncanplay = () => resolveLoad();
  el.onloadedmetadata = () => updateTimelineUI();
  el.ontimeupdate = () => updateTimelineUI();
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
  log.debug("[MediaPlayer] load started (direct URL):", url);
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
  log.debug("[MediaPlayer] OPEN_FILE received");
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

  setupTimelineSeek();

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
