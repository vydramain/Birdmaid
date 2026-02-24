/**
 * FP4 Media Player HOTFIX — R1 play() reject, R3 overflow, R4 object-fit, R2 min size.
 * M1 Red: tests fail before implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WindowManager } from "../../core/WindowManager";

describe("FP4 Media Player HOTFIX", () => {
  describe("R1: play() reject handling", () => {
    let container: HTMLDivElement;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let playStub: ReturnType<typeof vi.spyOn>;
    let loadStub: ReturnType<typeof vi.spyOn>;
    let pauseStub: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      playStub = vi
        .spyOn(HTMLMediaElement.prototype, "play")
        .mockRejectedValue(new Error("NotAllowedError"));
      loadStub = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
      pauseStub = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
      container = document.createElement("div");
      container.innerHTML = `
        <div id="player-root">
          <div id="player-video-area"><video id="player-video"></video></div>
          <div id="player-audio-area" class="hidden"></div>
          <div id="player-press-play" style="display:none">Press Play</div>
          <div id="player-load-error" style="display:none">Unable to load media</div>
          <div class="player-controls">
            <button id="btn-prev" disabled>◀</button>
            <button id="btn-play">▶</button>
            <button id="btn-pause">⏸</button>
            <button id="btn-stop">⏹</button>
            <button id="btn-next" disabled>▶</button>
            <button id="btn-mute">Mute</button>
            <input type="range" id="volume-slider" min="0" max="100" value="100" />
          </div>
        </div>
      `;
      document.body.appendChild(container);
      Object.defineProperty(window, "parent", { value: {}, configurable: true });
    });

    afterEach(() => {
      container.remove();
      Object.defineProperty(window, "parent", { value: window, configurable: true });
      consoleErrorSpy.mockRestore();
      playStub.mockRestore();
      loadStub.mockRestore();
      pauseStub.mockRestore();
    });

    it("T-FP4-HOTFIX-PLAY-REJECT: when play() rejects, console.error is called", async () => {
      await import("../../apps/media-player/main");

      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "OPEN_FILE",
            payload: {
              initialPath: "/@root/DISK_C/Video/sample.mp4",
              initialUrl: "http://s3.shell.local/sample.mp4",
              playlist: [
                { path: "/@root/DISK_C/Video/sample.mp4", url: "http://s3.shell.local/sample.mp4" },
              ],
            },
          },
          origin: "null",
        })
      );

      const video = await vi.waitFor(
        () => document.getElementById("player-video") as HTMLVideoElement,
        { timeout: 500 }
      );
      video.dispatchEvent(new Event("canplay"));

      await vi.waitFor(
        () => {
          const pressPlay = document.getElementById("player-press-play");
          expect(pressPlay).toBeTruthy();
          expect(pressPlay?.style.display).not.toBe("none");
        },
        { timeout: 1500 }
      );

      const playBtn = document.getElementById("btn-play") as HTMLButtonElement;
      playBtn.click();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringMatching(/\[MediaPlayer\].*play|rejected|NotAllowedError/i),
            expect.anything()
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe("R3: no scrollbars (overflow hidden)", () => {
    it("T-FP4-HOTFIX-OVERFLOW: html and body have overflow hidden", () => {
      const htmlPath = resolve(__dirname, "../../apps/media-player/index.html");
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/overflow:\s*hidden/);
      expect(html).toMatch(/(?:html|body)[^}]*\{[^}]*overflow:\s*hidden/);
    });

    it("T-FP4-HOTFIX-OVERFLOW-ROOT: player-root has overflow hidden", () => {
      const htmlPath = resolve(__dirname, "../../apps/media-player/index.html");
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/\.player-root\s*\{[^}]*overflow:\s*hidden/);
    });
  });

  describe("R4: object-fit contain", () => {
    it("T-FP4-HOTFIX-OBJECT-FIT: video uses object-fit contain", () => {
      const htmlPath = resolve(__dirname, "../../apps/media-player/index.html");
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/object-fit:\s*contain/);
    });
  });

  describe("R2: min size for iframe windows (FP4.1)", () => {
    it("T-FP4-HOTFIX-MIN-SIZE: default min 320×240 for iframe window", () => {
      const wm = new WindowManager();
      const win = wm.createWindow({
        src: "/apps/media-player/",
        title: "Media Player",
      });
      expect(win).toBeTruthy();
      wm.updateBounds(win.id, { width: 100, height: 50 });
      const updated = wm.getWindow(win.id);
      expect(updated?.bounds.width).toBe(320);
      expect(updated?.bounds.height).toBe(240);
    });
  });
});
