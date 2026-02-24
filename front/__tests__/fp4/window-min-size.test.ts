/**
 * FP4.1 M1 RED: Min size 320×240 for iframe windows.
 * Tests fail until M2 implementation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { WindowManager } from "../../core/WindowManager";

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 240;

describe("FP4.1 iframe window min size (320×240)", () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = new WindowManager();
  });

  it("T-MIN-DEFAULT: iframe window without override clamps to 320×240", () => {
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
    wm.updateBounds(win.id, { width: 400, height: 300 });
    const w = wm.getWindow(win.id);
    expect(w?.bounds.width).toBe(400);
    expect(w?.bounds.height).toBe(300);
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
