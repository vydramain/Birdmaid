/**
 * FP4 M0: T-FP4-M0-HANDSHAKE-TIMEOUT — when APP_READY never arrives, placeholder shows "App not responding".
 * Unit: AppHost handshake timeout path.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AppHost } from "../../core/AppHost";

const HANDSHAKE_TIMEOUT_MS = 2000;

describe("FP4 AppHost handshake timeout (T-FP4-M0-HANDSHAKE-TIMEOUT)", () => {
  let container: HTMLDivElement;
  let onTitleUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    onTitleUpdate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    container.remove();
    vi.restoreAllMocks();
  });

  it("T-FP4-M0-HANDSHAKE-TIMEOUT: placeholder shows 'App not responding' when APP_READY never received", async () => {
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-timeout-test"
        src="about:blank"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Before timeout: placeholder shows "Loading..."
    const placeholderBefore = container.querySelector(".app-host-placeholder");
    expect(placeholderBefore).toBeTruthy();
    expect(placeholderBefore?.textContent).toBe("Loading...");

    // Advance past handshake timeout (AppHost uses 2000ms)
    await act(async () => {
      vi.advanceTimersByTime(HANDSHAKE_TIMEOUT_MS + 100);
    });

    // After timeout: placeholder shows "App not responding"
    const placeholderAfter = container.querySelector(".app-host-placeholder");
    expect(placeholderAfter).toBeTruthy();
    expect(placeholderAfter?.textContent).toBe("App not responding");

    root.unmount();
  }, 3000);
});
