/**
 * FP4 MediaPlayer state machine — play/pause/stop, volume, mute.
 * TESTS-RED: MediaPlayerState stubs throw.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MediaPlayerState } from "../../lib/fp4/MediaPlayerState";

describe("FP4 media-player-state", () => {
  let state: MediaPlayerState;

  beforeEach(() => {
    state = new MediaPlayerState();
  });

  describe("Play/Pause/Stop semantics", () => {
    it("initial state is stopped", () => {
      expect(state.playbackState).toBe("stopped");
    });
    it("play from stopped → playing", () => {
      state.play();
      expect(state.playbackState).toBe("playing");
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
    it("stop from playing → stopped", () => {
      state.play();
      state.stop();
      expect(state.playbackState).toBe("stopped");
    });
    it("stop when stopped → no-op (stays stopped)", () => {
      state.stop();
      expect(state.playbackState).toBe("stopped");
    });
    it("pause when paused → no-op", () => {
      state.play();
      state.pause();
      state.pause();
      expect(state.playbackState).toBe("paused");
    });
    it("play when playing → no-op", () => {
      state.play();
      state.play();
      expect(state.playbackState).toBe("playing");
    });
  });

  describe("Volume 0..100", () => {
    it("initial volume is 100", () => {
      expect(state.volume).toBe(100);
    });
    it("setVolume clamps to 0..100", () => {
      state.setVolume(50);
      expect(state.volume).toBe(50);
      state.setVolume(0);
      expect(state.volume).toBe(0);
      state.setVolume(100);
      expect(state.volume).toBe(100);
    });
  });

  describe("Mute toggle", () => {
    it("toggleMute saves previous value and sets 0", () => {
      state.setVolume(70);
      state.toggleMute();
      expect(state.muted).toBe(true);
      expect(state.volume).toBe(0);
    });
    it("toggleMute again restores previous value", () => {
      state.setVolume(70);
      state.toggleMute();
      state.toggleMute();
      expect(state.muted).toBe(false);
      expect(state.volume).toBe(70);
    });
  });
});
