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
let state: MediaPlayerState;
let mediaEl: HTMLAudioElement | HTMLVideoElement | null = null;

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

function updateTitle(name: string): void {
  send("WINDOW_TITLE", { title: name || "Media Player" });
}

function syncMediaToState(): void {
  if (!mediaEl) return;
  if (state.playbackState === "playing") {
    mediaEl.play().catch(() => {});
  } else if (state.playbackState === "paused") {
    mediaEl.pause();
  } else {
    mediaEl.pause();
    mediaEl.currentTime = 0;
  }
  const slider = getEl("volume-slider") as HTMLInputElement | null;
  if (slider) slider.value = String(state.volume);
}

function loadMedia(url: string): void {
  if (mediaEl) {
    mediaEl.pause();
    mediaEl.currentTime = 0;
  }
  const videoArea = getEl("player-video-area");
  const audioArea = getEl("player-audio-area");
  const pressPlay = getEl("player-press-play");
  if (mode === "video") {
    videoArea?.classList.remove("hidden");
    audioArea?.classList.add("hidden");
    const video = getEl("player-video") as HTMLVideoElement | null;
    if (video) {
      mediaEl = video;
      video.src = url;
      video.load();
      state.stop();
      video.play().then(
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
      audio.src = url;
      audio.load();
      state.stop();
      audio.play().then(
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

  document.addEventListener("keydown", (e) => {
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
  });

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
