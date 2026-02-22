/**
 * FP4 MediaPlayer state machine — play/pause/stop, volume, mute.
 */

export type PlaybackState = "playing" | "paused" | "stopped";

export class MediaPlayerState {
  private _playbackState: PlaybackState = "stopped";
  private _volume = 100;
  private _muted = false;
  private _volumeBeforeMute = 100;

  get playbackState(): PlaybackState {
    return this._playbackState;
  }

  get volume(): number {
    return this._volume;
  }

  get muted(): boolean {
    return this._muted;
  }

  play(): void {
    if (this._playbackState === "playing") return;
    this._playbackState = "playing";
  }

  pause(): void {
    if (this._playbackState !== "playing") return;
    this._playbackState = "paused";
  }

  stop(): void {
    if (this._playbackState === "stopped") return;
    this._playbackState = "stopped";
  }

  setVolume(value: number): void {
    const v = Math.max(0, Math.min(100, value));
    if (this._muted) {
      this._volumeBeforeMute = v;
    } else {
      this._volume = v;
      this._volumeBeforeMute = v;
    }
  }

  toggleMute(): void {
    if (this._muted) {
      this._muted = false;
      this._volume = this._volumeBeforeMute;
    } else {
      this._volumeBeforeMute = this._volume;
      this._muted = true;
      this._volume = 0;
    }
  }
}
