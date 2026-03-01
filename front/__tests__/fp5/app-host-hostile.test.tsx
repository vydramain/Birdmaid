/**
 * FP5 M3: Hostile app + security tests (H1, H2, H5, protocol allowlist, sandbox).
 * H1: user app sends SHELL_OPEN => rejected
 * H2: user app sends SHELL_OPEN_FILE => rejected
 * H5: user app never receives systemToken in SHELL_CAPS
 * Protocol: unknown/privileged types from user app => message_rejected
 * Sandbox: user app iframe allow-scripts only, no allow-same-origin
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AppHost } from "../../core/AppHost";
import { analytics } from "../../core/analytics";

describe("FP5 Hostile App (H1, H2, H5, protocol, sandbox)", () => {
  let container: HTMLDivElement;
  let onShellOpen: ReturnType<typeof vi.fn>;
  let onShellOpenFile: ReturnType<typeof vi.fn>;
  let onTitleUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    onShellOpen = vi.fn();
    onShellOpenFile = vi.fn();
    onTitleUpdate = vi.fn();
    analytics.clearBuffer();
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it("H1: user app sends SHELL_OPEN => rejected (onShellOpen not called)", async () => {
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-fp5-h1"
        src="/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        isExplorer={false}
        isUserApp={true}
        onShellOpen={onShellOpen}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const iframe = container.querySelector("iframe");
    const cw = (iframe as HTMLIFrameElement)?.contentWindow;
    if (!cw) {
      throw new Error("contentWindow not available (jsdom)");
    }

    cw.postMessage = vi.fn();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "APP_READY",
            timestamp: Date.now(),
          },
          origin: "null",
          source: cw,
        })
      );
    });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "SHELL_OPEN",
            payload: { kind: "app", path: "/@root/DISK_C/My Documents/OtherApp/", title: "Other" },
            timestamp: Date.now(),
          },
          origin: "null",
          source: cw,
        })
      );
    });

    expect(onShellOpen).not.toHaveBeenCalled();

    root.unmount();
  });

  it("H2: user app sends SHELL_OPEN_FILE => rejected (onShellOpenFile not called)", async () => {
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-fp5-h2"
        src="/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        isExplorer={false}
        isUserApp={true}
        onShellOpenFile={onShellOpenFile}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const iframe = container.querySelector("iframe");
    const cw = (iframe as HTMLIFrameElement)?.contentWindow;
    if (!cw) {
      throw new Error("contentWindow not available (jsdom)");
    }

    cw.postMessage = vi.fn();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "APP_READY",
            timestamp: Date.now(),
          },
          origin: "null",
          source: cw,
        })
      );
    });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "SHELL_OPEN_FILE",
            payload: {
              path: "/@root/DISK_C/My Documents/image.png",
              playlist: [{ path: "/image.png", url: "http://s3.shell.local/image.png" }],
            },
            timestamp: Date.now(),
          },
          origin: "null",
          source: cw,
        })
      );
    });

    expect(onShellOpenFile).not.toHaveBeenCalled();

    root.unmount();
  });

  it("H5: user app never receives systemToken in SHELL_CAPS", async () => {
    const root = createRoot(container);
    const postMessages: unknown[] = [];
    root.render(
      <AppHost
        windowId="win-fp5-h5"
        src="/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        isExplorer={false}
        isUserApp={true}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const iframe = container.querySelector("iframe");
    const cw = (iframe as HTMLIFrameElement)?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");
    cw.postMessage = vi.fn((data: unknown) => postMessages.push(data));

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "APP_READY", timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    const caps = postMessages.find((m) => (m as { type?: string })?.type === "SHELL_CAPS");
    expect(caps).toBeDefined();
    const payload = (caps as { payload?: Record<string, unknown> })?.payload;
    expect(payload?.systemToken).toBeUndefined();

    root.unmount();
  });

  it("protocol allowlist: user app sends READ_FILE => rejected and logged", async () => {
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-fp5-proto"
        src="/apps/user/?path=%2F%40root%2FDISK_C%2FMyApp%2F"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        isExplorer={false}
        isUserApp={true}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const iframe = container.querySelector("iframe");
    const cw = (iframe as HTMLIFrameElement)?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "APP_READY", timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "READ_FILE", payload: { path: "/secret" }, timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    const rejected = analytics.getBuffer().filter((e) => e.type === "message_rejected");
    expect(
      rejected.some((e) =>
        (e as { reason?: string }).reason?.includes("user_app_privileged:READ_FILE")
      )
    ).toBe(true);

    root.unmount();
  });

  it("non-allowlist: user app sends UNKNOWN_TYPE => rejected and logged", async () => {
    const root = createRoot(container);
    root.render(
      <AppHost
        windowId="win-fp5-unknown"
        src="/apps/user/?path=%2F%40root%2FDISK_C%2FMyApp%2F"
        scale={1}
        theme="DefaultMock"
        onTitleUpdate={onTitleUpdate}
        isExplorer={false}
        isUserApp={true}
      />
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const iframe = container.querySelector("iframe");
    const cw = (iframe as HTMLIFrameElement)?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "APP_READY", timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "UNKNOWN_TYPE", payload: {}, timestamp: Date.now() },
          origin: "null",
          source: cw,
        })
      );
    });

    const rejected = analytics.getBuffer().filter((e) => e.type === "message_rejected");
    expect(
      rejected.some((e) =>
        (e as { reason?: string }).reason?.includes("user_app_unknown:UNKNOWN_TYPE")
      )
    ).toBe(true);

    root.unmount();
  });

  it("sandbox: user app iframe has allow-scripts allow-same-origin (Godot needs sessionStorage)", () => {
    const root = createRoot(container);
    act(() => {
      root.render(
        <AppHost
          windowId="win-fp5-sandbox"
          src="/apps/user/pkg/%2F%40root%2FDISK_C%2FMyApp%2F/"
          scale={1}
          theme="DefaultMock"
          onTitleUpdate={onTitleUpdate}
          isExplorer={false}
          isUserApp={true}
        />
      );
    });
    const iframe = container.querySelector("iframe") as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    const sandbox = iframe?.getAttribute("sandbox") ?? "";
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-same-origin");
    root.unmount();
  });
});
