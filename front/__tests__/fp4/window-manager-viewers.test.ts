/**
 * FP4 M3: Multiple viewers + re-open regression.
 * T-FP4-M3-MULTI: 2 viewer windows each store own playlist/index.
 * T-FP4-M3-REOPEN: close → open same file again works (no page reload).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { WindowManager } from "../../core/WindowManager";

const payload1 = {
  initialPath: "/@root/DISK_C/My Documents/Images/sample.png",
  initialUrl: "http://s3.shell.local/bucket/sample.png?X-Amz-...",
  playlist: [
    {
      path: "/@root/DISK_C/My Documents/Images/sample.png",
      url: "http://s3.shell.local/.../sample.png",
    },
    {
      path: "/@root/DISK_C/My Documents/Images/sample.jpg",
      url: "http://s3.shell.local/.../sample.jpg",
    },
  ],
};

const payload2 = {
  initialPath: "/@root/DISK_C/My Documents/Music/sample.mp3",
  initialUrl: "http://s3.shell.local/bucket/sample.mp3?X-Amz-...",
  playlist: [
    {
      path: "/@root/DISK_C/My Documents/Music/sample.mp3",
      url: "http://s3.shell.local/.../sample.mp3",
    },
  ],
};

describe("FP4 M3 WindowManager viewers (T-FP4-M3-MULTI, T-FP4-M3-REOPEN)", () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = new WindowManager();
  });

  it("T-FP4-M3-MULTI: 2 viewer windows each store own openFilePayload; focus switch does not reset", () => {
    const win1 = wm.createWindow({
      id: "viewer-1",
      src: "/apps/image-viewer/",
      title: "sample.png",
      openFilePayload: payload1,
    });
    const win2 = wm.createWindow({
      id: "viewer-2",
      src: "/apps/media-player/",
      title: "sample.mp3",
      openFilePayload: payload2,
    });

    expect(win1.openFilePayload?.initialPath).toBe(payload1.initialPath);
    expect(win1.openFilePayload?.playlist).toHaveLength(2);
    expect(win2.openFilePayload?.initialPath).toBe(payload2.initialPath);
    expect(win2.openFilePayload?.playlist).toHaveLength(1);

    wm.focus("viewer-1");
    expect(wm.getWindow("viewer-1")?.openFilePayload?.playlist).toHaveLength(2);
    expect(wm.getWindow("viewer-2")?.openFilePayload?.playlist).toHaveLength(1);

    wm.focus("viewer-2");
    expect(wm.getWindow("viewer-1")?.openFilePayload?.playlist).toHaveLength(2);
    expect(wm.getWindow("viewer-2")?.openFilePayload?.playlist).toHaveLength(1);
  });

  it("T-FP4-M3-REOPEN: close viewer → open same file again → new window works", () => {
    wm.createWindow({
      id: "viewer-1",
      src: "/apps/image-viewer/",
      title: "sample.png",
      openFilePayload: payload1,
    });
    wm.close("viewer-1");
    expect(wm.getWindow("viewer-1")).toBeUndefined();

    const win2 = wm.createWindow({
      id: "viewer-2",
      src: "/apps/image-viewer/",
      title: "sample.png",
      openFilePayload: payload1,
    });
    expect(win2.openFilePayload?.initialPath).toBe(payload1.initialPath);
    expect(win2.openFilePayload?.playlist).toHaveLength(2);
    expect(wm.getWindows()).toHaveLength(1);
  });
});
