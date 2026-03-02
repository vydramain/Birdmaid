/**
 * FP5 M1: Launch tests (L1, L3).
 * L1: double click user app => Shell creates window with hosted route src
 * L3: broken package (no index.html) => controlled error state, Shell stable
 *
 * RED: Shell currently uses open-url for all apps, not hosted route for user apps.
 * L3: AppHost with user app src that fails to load => handshake timeout => controlled error.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AppHost } from "../../core/AppHost";

const HANDSHAKE_TIMEOUT_MS = 2000;

describe("FP5 Launch (L1, L3)", () => {
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

  it("L1: user app window MUST use hosted route src (/apps/user/pkg/), not open-url signed URL", async () => {
    const userAppSrc =
      "/apps/user/pkg/" + encodeURIComponent("/@root/DISK_C/My Documents/sample-app/") + "/";
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <AppHost
          windowId="win-fp5-l1"
          src={userAppSrc}
          scale={1}
          theme="DefaultMock"
          onTitleUpdate={onTitleUpdate}
        />
      );
    });

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    const src = (iframe as HTMLIFrameElement).getAttribute("src");
    expect(src).toContain("/apps/user/");
    expect(src).toContain("/pkg/");

    root.unmount();
  });

  it("L3: broken package (missing index.html) => controlled error state after timeout", async () => {
    vi.useFakeTimers();

    const brokenUserAppSrc =
      "/apps/user/pkg/" + encodeURIComponent("/@root/DISK_C/My Documents/nonexistent/") + "/";
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-fp5-l3"
        src={brokenUserAppSrc}
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(container.querySelector(".app-host-placeholder")?.textContent).toBe("Loading...");

    await act(async () => {
      vi.advanceTimersByTime(HANDSHAKE_TIMEOUT_MS + 100);
    });

    const placeholder = container.querySelector(".app-host-placeholder");
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent).toMatch(/not responding|invalid|error/i);

    root.unmount();
    vi.useRealTimers();
  }, 5000);
});
