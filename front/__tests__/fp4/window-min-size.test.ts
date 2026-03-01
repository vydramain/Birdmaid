/**
 * FP4.1 M1: Min size 640×400 for iframe windows.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as WindowManagerModule from "../../core/WindowManager";
import { WindowManager } from "../../core/WindowManager";

const DEFAULT_MIN_WIDTH = 640;
const DEFAULT_MIN_HEIGHT = 400;

describe("FP4.1 iframe window min size (640×400)", () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = new WindowManager();
  });

  it("T-MIN-DEFAULT: iframe window without override clamps to 640×400", () => {
    const win = wm.createWindow({ src: "/apps/explorer/", title: "Explorer" });
    wm.updateBounds(win.id, { width: 100, height: 50 });
    const w = wm.getWindow(win.id);
    expect(w?.bounds.width).toBe(DEFAULT_MIN_WIDTH);
    expect(w?.bounds.height).toBe(DEFAULT_MIN_HEIGHT);
  });

  it("T-MIN-RESTORE: unmaximize clamps prevBounds to min", () => {
    const win = wm.createWindow({ src: "/apps/image-viewer/", title: "Viewer" });
    wm.updateBounds(win.id, { width: 250, height: 200 });
    wm.maximize(win.id, { width: 800, height: 600 });
    wm.unmaximize(win.id);
    const w = wm.getWindow(win.id);
    expect(w?.bounds.width).toBeGreaterThanOrEqual(DEFAULT_MIN_WIDTH);
    expect(w?.bounds.height).toBeGreaterThanOrEqual(DEFAULT_MIN_HEIGHT);
  });

  it("T-MIN-NO-CHANGE: sizes above min are unchanged", () => {
    const win = wm.createWindow({ src: "/apps/explorer/", title: "Explorer" });
    wm.updateBounds(win.id, { width: 800, height: 600 });
    const w = wm.getWindow(win.id);
    expect(w?.bounds.width).toBe(800);
    expect(w?.bounds.height).toBe(600);
  });

  it("T-MIN-OVERRIDE: per-window minWidth/minHeight respected", () => {
    const win = wm.createWindow({
      src: "/apps/media-player/",
      title: "Player",
      minWidth: 400,
      minHeight: 300,
    });
    wm.updateBounds(win.id, { width: 100, height: 50 });
    const w = wm.getWindow(win.id);
    expect(w?.bounds.width).toBe(400);
    expect(w?.bounds.height).toBe(300);
  });
});

/**
 * REPO M1 RED: SSOT min-size export.
 * Fails until getComputedMinSize(scale) is implemented in WindowManager.
 */
describe("REPO M1 SSOT: computed min size export", () => {
  it("T-SSOT-COMPUTED: scale=1.0, no override → computedMinWidthPx == 640, computedMinHeightPx == 400", () => {
    const WM = WindowManagerModule as {
      getComputedMinSize?: (scale: number) => { width: number; height: number };
    };
    const getComputedMinSize = WM.getComputedMinSize;
    expect(getComputedMinSize).toBeDefined();
    const { width, height } = getComputedMinSize!(1.0);
    expect(width).toBe(640);
    expect(height).toBe(400);
  });
});
