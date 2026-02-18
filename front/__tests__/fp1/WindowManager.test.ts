/**
 * WindowManager unit tests — AC B1, transitions, z-order, focus, updateBounds.
 * M2 TESTS-RED: all fail (Not implemented) until M3.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { WindowManager } from "../../core/WindowManager";

describe("WindowManager", () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = new WindowManager();
  });

  describe("createWindow (AC B1)", () => {
    it("adds entry to WindowManager state", () => {
      const win = wm.createWindow({ id: "win-1", src: "/testapp", title: "Test" });
      expect(win).toBeDefined();
      expect(win.id).toBe("win-1");
      const windows = wm.getWindows();
      expect(windows).toContainEqual(expect.objectContaining({ id: "win-1" }));
    });

    it("getWindows returns empty initially", () => {
      const windows = wm.getWindows();
      expect(windows).toHaveLength(0);
    });

    it("createWindow returns window with default state normal", () => {
      const win = wm.createWindow({ id: "win-1" });
      expect(win.state).toBe("normal");
    });
  });

  describe("state transitions", () => {
    it("minimize changes state to minimized", () => {
      wm.createWindow({ id: "win-1" });
      wm.minimize("win-1");
      const windows = wm.getWindows();
      expect(windows.find((w) => w.id === "win-1")?.state).toBe("minimized");
    });

    it("maximize changes state to maximized", () => {
      wm.createWindow({ id: "win-1" });
      wm.maximize("win-1");
      const windows = wm.getWindows();
      expect(windows.find((w) => w.id === "win-1")?.state).toBe("maximized");
    });

    it("restore from minimized changes state to normal", () => {
      wm.createWindow({ id: "win-1" });
      wm.minimize("win-1");
      wm.restore("win-1");
      const windows = wm.getWindows();
      expect(windows.find((w) => w.id === "win-1")?.state).toBe("normal");
    });

    it("unmaximize from maximized changes state to normal", () => {
      wm.createWindow({ id: "win-1" });
      wm.maximize("win-1");
      wm.unmaximize("win-1");
      const windows = wm.getWindows();
      expect(windows.find((w) => w.id === "win-1")?.state).toBe("normal");
    });

    it("close removes window from state", () => {
      wm.createWindow({ id: "win-1" });
      wm.close("win-1");
      const windows = wm.getWindows();
      expect(windows.find((w) => w.id === "win-1")).toBeUndefined();
    });
  });

  describe("z-order", () => {
    it("createWindow adds new window to top of z-order", () => {
      wm.createWindow({ id: "win-1" });
      wm.createWindow({ id: "win-2" });
      const order = wm.getZOrder();
      expect(order[order.length - 1]).toBe("win-2");
    });

    it("focus moves window to top of z-order", () => {
      wm.createWindow({ id: "win-1" });
      wm.createWindow({ id: "win-2" });
      wm.focus("win-1");
      const order = wm.getZOrder();
      expect(order[order.length - 1]).toBe("win-1");
    });

    it("getZOrder returns windows in stack order (bottom to top)", () => {
      wm.createWindow({ id: "win-1" });
      wm.createWindow({ id: "win-2" });
      wm.createWindow({ id: "win-3" });
      const order = wm.getZOrder();
      expect(order).toHaveLength(3);
      expect(order).toContain("win-1");
      expect(order).toContain("win-2");
      expect(order).toContain("win-3");
    });
  });

  describe("focus", () => {
    it("focus sets activeId", () => {
      wm.createWindow({ id: "win-1" });
      wm.focus("win-1");
      expect(wm.getActiveId()).toBe("win-1");
    });

    it("focusDesktop clears activeId", () => {
      wm.createWindow({ id: "win-1" });
      wm.focus("win-1");
      wm.focusDesktop();
      expect(wm.getActiveId()).toBeNull();
    });
  });

  describe("updateBounds", () => {
    it("updateBounds updates window position and size", () => {
      wm.createWindow({ id: "win-1" });
      wm.updateBounds("win-1", { x: 100, y: 50, width: 400, height: 300 });
      const win = wm.getWindows().find((w) => w.id === "win-1");
      expect(win?.bounds).toEqual(
        expect.objectContaining({ x: 100, y: 50, width: 400, height: 300 })
      );
    });
  });
});
