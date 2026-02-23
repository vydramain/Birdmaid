/**
 * FP4 M0: Viewer handshake contract.
 * When OPEN_FILE is received with initialUrl, viewer MUST set img src to that URL.
 * Unit: simulate message flow; assert img#viewer-img gets src.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("FP4 Image Viewer — OPEN_FILE sets img src (M0)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <div id="viewer-root">
        <div class="viewer-content">
          <img id="viewer-img" alt="" style="display:none" />
          <div id="viewer-loading">Loading...</div>
          <div id="viewer-error" style="display:none"></div>
        </div>
        <button id="btn-prev" disabled></button>
        <button id="btn-next" disabled></button>
        <span id="viewer-status"></span>
      </div>
    `;
    document.body.appendChild(container);
    Object.defineProperty(window, "parent", { value: {}, configurable: true });
  });

  afterEach(() => {
    container.remove();
    Object.defineProperty(window, "parent", { value: window, configurable: true });
    vi.restoreAllMocks();
  });

  it("T-FP4-VIEWER-OPEN-FILE: OPEN_FILE with initialUrl fetches and sets img src (blob URL)", async () => {
    const signedUrl =
      "http://s3.shell.local/birdmaid-dev/roots/DISK_C/My%20Documents/Images/sample.webp?X-Amz-";
    const blob = new Blob([new Uint8Array([0x52, 0x49, 0x46, 0x46])], { type: "image/webp" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "image/webp" }),
        blob: () => Promise.resolve(blob),
      })
    );
    await import("../../apps/image-viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/@root/DISK_C/My Documents/Images/sample.webp",
            initialUrl: signedUrl,
            playlist: [{ path: "/@root/DISK_C/My Documents/Images/sample.webp", url: signedUrl }],
          },
        },
        origin: "null",
      })
    );

    await vi.waitFor(
      () => {
        const img = document.getElementById("viewer-img") as HTMLImageElement;
        expect(img?.src).toMatch(/^blob:/);
      },
      { timeout: 500 }
    );
  });

  it("T-FP4-M3-LOAD-ERROR: fetch failure shows error UI, no crash", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badUrl = "http://invalid.example/bad.webp";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    await import("../../apps/image-viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/bad.webp",
            initialUrl: badUrl,
            playlist: [{ path: "/bad.webp", url: badUrl }],
          },
        },
        origin: "null",
      })
    );

    await vi.waitFor(
      () => {
        const errorEl = document.getElementById("viewer-error");
        expect(errorEl?.textContent).toBe("Unable to load image");
      },
      { timeout: 500 }
    );
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("T-FP4-M3-PLAYLIST: OPEN_FILE with playlist of 2+ items enables Prev/Next", async () => {
    const url1 = "http://s3.shell.local/a.webp";
    const url2 = "http://s3.shell.local/b.webp";
    const blob = new Blob([], { type: "image/webp" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "image/webp" }),
        blob: () => Promise.resolve(blob),
      })
    );
    await import("../../apps/image-viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/@root/DISK_C/Images/a.webp",
            initialUrl: url1,
            playlist: [
              { path: "/@root/DISK_C/Images/a.webp", url: url1 },
              { path: "/@root/DISK_C/Images/b.webp", url: url2 },
            ],
          },
        },
        origin: "null",
      })
    );

    const prevBtn = document.getElementById("btn-prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("btn-next") as HTMLButtonElement;
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(false);
  });

  it("T-FP4-M3-NEXT-PREV-URL: OPEN_FILE initial load + next/prev changes img src (playlist nav)", async () => {
    const url1 = "http://s3.shell.local/a.webp";
    const url2 = "http://s3.shell.local/b.webp";
    const url3 = "http://s3.shell.local/c.webp";
    const blob = new Blob([], { type: "image/webp" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "image/webp" }),
      blob: () => Promise.resolve(blob),
    });
    vi.stubGlobal("fetch", fetchMock);
    await import("../../apps/image-viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/@root/DISK_C/Images/b.webp",
            initialUrl: url2,
            playlist: [
              { path: "/@root/DISK_C/Images/a.webp", url: url1 },
              { path: "/@root/DISK_C/Images/b.webp", url: url2 },
              { path: "/@root/DISK_C/Images/c.webp", url: url3 },
            ],
          },
        },
        origin: "null",
      })
    );

    const status = document.getElementById("viewer-status");
    const prevBtn = document.getElementById("btn-prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("btn-next") as HTMLButtonElement;

    await vi.waitFor(() => expect(status?.textContent).toContain("2 of 3"), { timeout: 500 });

    nextBtn.click();
    await vi.waitFor(() => expect(status?.textContent).toContain("3 of 3"), { timeout: 500 });

    nextBtn.click();
    await vi.waitFor(() => expect(status?.textContent).toContain("1 of 3"), { timeout: 500 });

    prevBtn.click();
    await vi.waitFor(() => expect(status?.textContent).toContain("3 of 3"), { timeout: 500 });

    prevBtn.click();
    await vi.waitFor(() => expect(status?.textContent).toContain("2 of 3"), { timeout: 500 });

    expect(fetchMock).toHaveBeenCalledWith(url2, expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith(url3, expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith(url1, expect.any(Object));
  });
});
