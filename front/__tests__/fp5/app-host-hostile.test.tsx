/**
 * FP5 M3: Hostile app + security tests (H1, H2, H5, protocol allowlist, sandbox).
 * H1: user app sends SHELL_OPEN => rejected
 * H2: user app sends SHELL_OPEN_FILE => rejected
 * H5: user app never receives systemToken in SHELL_CAPS
 * Protocol: unknown/privileged types from user app => message_rejected
 * Sandbox: user app iframe allow-scripts only, no allow-same-origin
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AppHost from "../../core/AppHost.vue";
import { analytics } from "../../core/analytics";

describe("FP5 Hostile App (H1, H2, H5, protocol, sandbox)", () => {
  beforeEach(() => {
    analytics.clearBuffer();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("H1: user app sends SHELL_OPEN => rejected (onShellOpen not called)", async () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-h1",
        src: "/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    const cw = iframe?.contentWindow;
    if (!cw) {
      throw new Error("contentWindow not available (jsdom)");
    }

    cw.postMessage = vi.fn();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

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
    await nextTick();

    expect(wrapper.emitted("shellOpen")).toBeUndefined();

    wrapper.unmount();
  });

  it("H2: user app sends SHELL_OPEN_FILE => rejected (onShellOpenFile not called)", async () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-h2",
        src: "/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    const cw = iframe?.contentWindow;
    if (!cw) {
      throw new Error("contentWindow not available (jsdom)");
    }

    cw.postMessage = vi.fn();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

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
    await nextTick();

    expect(wrapper.emitted("shellOpenFile")).toBeUndefined();

    wrapper.unmount();
  });

  it("H5: user app never receives systemToken in SHELL_CAPS", async () => {
    const postMessages: unknown[] = [];
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-h5",
        src: "/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    const cw = iframe?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");
    cw.postMessage = vi.fn((data: unknown) => postMessages.push(data));

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    const caps = postMessages.find((m) => (m as { type?: string })?.type === "SHELL_CAPS");
    expect(caps).toBeDefined();
    const payload = (caps as { payload?: Record<string, unknown> })?.payload;
    expect(payload?.systemToken).toBeUndefined();

    wrapper.unmount();
  });

  it("protocol allowlist: user app sends READ_FILE => rejected and logged", async () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-proto",
        src: "/apps/user/?path=%2F%40root%2FDISK_C%2FMyApp%2F",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    const cw = iframe?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "READ_FILE", payload: { path: "/secret" }, timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    const rejected = analytics.getBuffer().filter((e) => e.type === "message_rejected");
    expect(
      rejected.some((e) =>
        (e as { reason?: string }).reason?.includes("user_app_privileged:READ_FILE")
      )
    ).toBe(true);

    wrapper.unmount();
  });

  it("non-allowlist: user app sends UNKNOWN_TYPE => rejected and logged", async () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-unknown",
        src: "/apps/user/?path=%2F%40root%2FDISK_C%2FMyApp%2F",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    const cw = iframe?.contentWindow;
    if (!cw) throw new Error("contentWindow not available");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "UNKNOWN_TYPE", payload: {}, timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    const rejected = analytics.getBuffer().filter((e) => e.type === "message_rejected");
    expect(
      rejected.some((e) =>
        (e as { reason?: string }).reason?.includes("user_app_unknown:UNKNOWN_TYPE")
      )
    ).toBe(true);

    wrapper.unmount();
  });

  it("sandbox: user app iframe has allow-scripts allow-same-origin (Godot needs sessionStorage)", () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-sandbox",
        src: "/apps/user/pkg/%2F%40root%2FDISK_C%2FMyApp%2F/",
        scale: 1,
        theme: "DefaultMock",
        isExplorer: false,
        isUserApp: true,
      },
      attachTo: document.body,
    });
    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    const sandbox = iframe?.getAttribute("sandbox") ?? "";
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-same-origin");
    wrapper.unmount();
  });
});
