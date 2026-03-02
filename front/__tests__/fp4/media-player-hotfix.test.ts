/**
 * FP4 Media Player HOTFIX — R1 play() reject, R3 overflow, R4 object-fit, R2 min size.
 * Layout+seek: computeSeekTime, duration disabled, flex layout.
 * M1 Red: tests fail before implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { computeSeekTime, isSeekDisabled } from "../../lib/fp4/seek";
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
      await import("../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/main");

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
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/overflow:\s*hidden/);
      expect(html).toMatch(/(?:html|body)[^}]*\{[^}]*overflow:\s*hidden/);
    });

    it("T-FP4-HOTFIX-OVERFLOW-ROOT: player-root has overflow hidden", () => {
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/\.player-root\s*\{[^}]*overflow:\s*hidden/);
    });
  });

  describe("R4: object-fit contain", () => {
    it("T-FP4-HOTFIX-OBJECT-FIT: video uses object-fit contain", () => {
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/object-fit:\s*contain/);
    });
  });

  describe("R2: min size for iframe windows (FP4.1)", () => {
    it("T-FP4-HOTFIX-MIN-SIZE: default min 640×400 for iframe window", () => {
      const wm = new WindowManager();
      const win = wm.createWindow({
        src: "/apps/media-player/",
        title: "Media Player",
      });
      expect(win).toBeTruthy();
      wm.updateBounds(win.id, { width: 100, height: 50 });
      const updated = wm.getWindow(win.id);
      expect(updated?.bounds.width).toBe(640);
      expect(updated?.bounds.height).toBe(400);
    });
  });

  describe("Seek: computeSeekTime", () => {
    it("T-FP4-SEEK-CLAMP: computeSeekTime clamps to [0, duration]", () => {
      const rect = new DOMRect(0, 0, 100, 10);
      expect(computeSeekTime(0, rect, 60)).toBe(0);
      expect(computeSeekTime(50, rect, 60)).toBe(30);
      expect(computeSeekTime(100, rect, 60)).toBe(60);
      expect(computeSeekTime(-10, rect, 60)).toBe(0);
      expect(computeSeekTime(150, rect, 60)).toBe(60);
    });

    it("T-FP4-SEEK-RECT-OFFSET: computeSeekTime uses rect.left", () => {
      const rect = new DOMRect(20, 0, 60, 10);
      expect(computeSeekTime(20, rect, 60)).toBe(0);
      expect(computeSeekTime(50, rect, 60)).toBe(30);
      expect(computeSeekTime(80, rect, 60)).toBe(60);
    });
  });

  describe("Seek: duration NaN/Infinity => disabled", () => {
    it("T-FP4-SEEK-DISABLED: isSeekDisabled true for NaN", () => {
      expect(isSeekDisabled(Number.NaN)).toBe(true);
    });
    it("T-FP4-SEEK-DISABLED: isSeekDisabled true for Infinity", () => {
      expect(isSeekDisabled(Number.POSITIVE_INFINITY)).toBe(true);
      expect(isSeekDisabled(Number.NEGATIVE_INFINITY)).toBe(true);
    });
    it("T-FP4-SEEK-DISABLED: isSeekDisabled false for finite positive duration", () => {
      expect(isSeekDisabled(60)).toBe(false);
    });
  });

  describe("Layout: controls always visible (flex column)", () => {
    it("T-FP4-LAYOUT-ROOT: player-root has flex column + overflow hidden", () => {
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/\.player-root\s*\{[^}]*display:\s*flex/);
      expect(html).toMatch(/\.player-root\s*\{[^}]*flex-direction:\s*column/);
      expect(html).toMatch(/\.player-root\s*\{[^}]*overflow:\s*hidden/);
    });

    it("T-FP4-LAYOUT-CONTROLS-LAST: controls container is last child of player-root", () => {
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      const rootStart = html.indexOf('id="player-root"');
      const rootEnd = html.indexOf("<!-- M1+M2:", rootStart);
      expect(rootStart).toBeGreaterThan(-1);
      expect(rootEnd).toBeGreaterThan(rootStart);
      const rootContent = html.slice(rootStart, rootEnd);
      const controlsIdx = rootContent.indexOf("player-controls");
      const videoAreaIdx = rootContent.indexOf("player-video-area");
      expect(controlsIdx).toBeGreaterThan(videoAreaIdx);
      const afterControls = rootContent.slice(controlsIdx);
      expect(afterControls).not.toMatch(
        /<div[^>]*(?:id|class)="[^"]*player-(?:video|audio|press|load)/
      );
    });

    it("T-FP4-LAYOUT-CONTROLS-FLEX: player-controls has flex 0 0 auto", () => {
      const htmlPath = resolve(
        __dirname,
        "../../../infra/minio/fixtures/DISK_C/Program Files/Media Player/index.html"
      );
      const html = readFileSync(htmlPath, "utf-8");
      expect(html).toMatch(/\.player-controls\s*\{[^}]*flex:\s*0\s+0\s+auto/);
    });
  });
});
