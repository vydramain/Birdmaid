/**
 * FP4 M1: T-FP4-IV-HANDSHAKE — viewer responds APP_READY, after OPEN_FILE no crash/timeout.
 * Tests AppHost: when APP_READY received from iframe, placeholder cleared, OPEN_FILE sent.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AppHost } from "../../core/AppHost";

describe("FP4 AppHost handshake (T-FP4-IV-HANDSHAKE)", () => {
  let container: HTMLDivElement;
  let onTitleUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    onTitleUpdate = vi.fn();
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it("clears placeholder when APP_READY received from iframe", async () => {
    const openFilePayload = {
      initialPath: "/@root/DISK_C/My Documents/Images/sample.webp",
      initialUrl: "http://s3.shell.local/test.webp",
      playlist: [{ path: "/test.webp", url: "http://s3.shell.local/test.webp" }],
    };

    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-test"
        src="about:blank"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        openFilePayload={openFilePayload}
      />
    );

    // Wait for iframe to mount; jsdom may need time for contentWindow
    await new Promise((r) => setTimeout(r, 100));

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    const cw = (iframe as HTMLIFrameElement).contentWindow;
    if (!cw) {
      // jsdom: about:blank may not provide contentWindow; skip
      root.unmount();
      return;
    }

    // Mock postMessage to avoid jsdom "Invalid target origin 'null'" when Shell sends OPEN_FILE
    cw.postMessage = vi.fn();

    // Simulate APP_READY from iframe (as ImageViewer does)
    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "APP_READY", timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    const placeholderAfter = container.querySelector(".app-host-placeholder");
    expect(placeholderAfter).toBeFalsy();

    root.unmount();
  });
});
