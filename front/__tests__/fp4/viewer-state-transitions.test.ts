/**
 * FP4: Viewer state transitions.
 * Unit: loading -> loaded, loading -> error, prev/next after first load.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("FP4 Image Viewer — state transitions", () => {
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

  it("T-FP4-STATE-LOADING: shows loading until fetch resolves", async () => {
    const blob = new Blob([], { type: "image/webp" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "image/webp" }),
        blob: () => Promise.resolve(blob),
      })
    );
    await import("../../../infra/minio/fixtures/DISK_C/Program Files/Image Viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/a.webp",
            initialUrl: "http://s3.shell.local/a.webp",
            playlist: [{ path: "/a.webp", url: "http://s3.shell.local/a.webp" }],
          },
        },
        origin: "null",
      })
    );

    const loading = document.getElementById("viewer-loading");
    const img = document.getElementById("viewer-img") as HTMLImageElement;
    expect(loading?.style.display).not.toBe("none");
    expect(img?.style.display).toBe("none");

    await vi.waitFor(
      () => {
        expect(img?.src).toMatch(/^blob:/);
      },
      { timeout: 500 }
    );
    img.dispatchEvent(new Event("load"));
    expect(img?.style.display).toBe("block");
  });

  it("T-FP4-STATE-ERROR: fetch failure shows error, hides loading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    await import("../../../infra/minio/fixtures/DISK_C/Program Files/Image Viewer/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/bad.webp",
            initialUrl: "http://invalid/bad.webp",
            playlist: [{ path: "/bad.webp", url: "http://invalid/bad.webp" }],
          },
        },
        origin: "null",
      })
    );

    await vi.waitFor(
      () => {
        const error = document.getElementById("viewer-error");
        expect(error?.style.display).not.toBe("none");
        expect(error?.textContent).toBe("Unable to load image");
      },
      { timeout: 500 }
    );
  });

  it("T-FP4-STATE-PREV-NEXT: prev/next after first load fetches new URL", async () => {
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
    await import("../../../infra/minio/fixtures/DISK_C/Program Files/Image Viewer/main");

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

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(url2, expect.any(Object)), {
      timeout: 500,
    });

    const prevBtn = document.getElementById("btn-prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("btn-next") as HTMLButtonElement;

    nextBtn.click();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(url3, expect.any(Object)), {
      timeout: 500,
    });

    prevBtn.click();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(url2, expect.any(Object)), {
      timeout: 500,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
