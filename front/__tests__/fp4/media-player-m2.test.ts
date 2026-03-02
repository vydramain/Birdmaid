/**
 * FP4 M2: MediaPlayer controls + playlist.
 * T-FP4-MP-PLAYLIST, T-FP4-MP-NEXT-PREV, T-FP4-MP-PLAY-PAUSE-STOP, T-FP4-MP-VOLUME-MUTE.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  filterMediaItems,
  sortByLocaleCompare,
  getExtensionsForMedia,
  nextIndex,
  prevIndex,
  type FsItem,
} from "../../lib/fp4/playlist";
import { MediaPlayerState } from "../../lib/fp4/MediaPlayerState";

const PLAYLIST_LIMIT = 100;

describe("FP4 MediaPlayer M2", () => {
  describe("T-FP4-MP-PLAYLIST: virtual list from same-type files, limit N=100", () => {
    it("playlist is built from files of same media type in current dir", () => {
      const items: FsItem[] = [
        { path: "/dir/a.mp3", name: "a.mp3", kind: "file" },
        { path: "/dir/b.mp3", name: "b.mp3", kind: "file" },
        { path: "/dir/c.mp4", name: "c.mp4", kind: "file" },
      ];
      const ext = getExtensionsForMedia("audio");
      const filtered = filterMediaItems(items, ext);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((i) => i.name).sort()).toEqual(["a.mp3", "b.mp3"]);
    });

    it("playlist is limited to 100 items", () => {
      const items: FsItem[] = Array.from({ length: 150 }, (_, i) => ({
        path: `/dir/f${i}.mp3`,
        name: `f${i}.mp3`,
        kind: "file" as const,
      }));
      const ext = getExtensionsForMedia("audio");
      const filtered = filterMediaItems(items, ext);
      const sorted = sortByLocaleCompare(filtered);
      const limited = sorted.slice(0, PLAYLIST_LIMIT);
      expect(limited).toHaveLength(100);
    });
  });

  describe("T-FP4-MP-NEXT-PREV: next/prev cyclic", () => {
    it("next wraps from last to first", () => {
      expect(nextIndex(2, 3)).toBe(0);
    });
    it("prev wraps from first to last", () => {
      expect(prevIndex(0, 3)).toBe(2);
    });
    it("cyclic with 1 item is no-op", () => {
      expect(nextIndex(0, 1)).toBe(0);
      expect(prevIndex(0, 1)).toBe(0);
    });
  });

  describe("T-FP4-MP-PLAY-PAUSE-STOP: state and position", () => {
    let state: MediaPlayerState;

    beforeEach(() => {
      state = new MediaPlayerState();
    });

    it("stop when stopped is no-op", () => {
      state.stop();
      expect(state.playbackState).toBe("stopped");
    });
    it("play from stopped → playing", () => {
      state.play();
      expect(state.playbackState).toBe("playing");
    });
    it("stop from playing → stopped (seek 0 implied by caller)", () => {
      state.play();
      state.stop();
      expect(state.playbackState).toBe("stopped");
    });
    it("pause from playing → paused", () => {
      state.play();
      state.pause();
      expect(state.playbackState).toBe("paused");
    });
    it("play from paused → playing", () => {
      state.play();
      state.pause();
      state.play();
      expect(state.playbackState).toBe("playing");
    });
  });

  describe("T-FP4-MP-VOLUME-MUTE: mute saves old value, slider 0..100", () => {
    let state: MediaPlayerState;

    beforeEach(() => {
      state = new MediaPlayerState();
    });

    it("slider 0..100", () => {
      state.setVolume(0);
      expect(state.volume).toBe(0);
      state.setVolume(50);
      expect(state.volume).toBe(50);
      state.setVolume(100);
      expect(state.volume).toBe(100);
      state.setVolume(150);
      expect(state.volume).toBe(100);
      state.setVolume(-10);
      expect(state.volume).toBe(0);
    });
    it("mute saves previous value and sets 0", () => {
      state.setVolume(70);
      state.toggleMute();
      expect(state.muted).toBe(true);
      expect(state.volume).toBe(0);
    });
    it("unmute restores previous value", () => {
      state.setVolume(70);
      state.toggleMute();
      state.toggleMute();
      expect(state.muted).toBe(false);
      expect(state.volume).toBe(70);
    });
    it("slider change while muted updates stored value for unmute", () => {
      state.setVolume(70);
      state.toggleMute();
      state.setVolume(30); // user moves slider while muted
      state.toggleMute(); // unmute
      expect(state.volume).toBe(30);
    });
  });
});
