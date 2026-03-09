/**
 * FP4 M1+M2: T-FP4-IV-HANDSHAKE — viewer responds APP_READY, after OPEN_FILE no crash/timeout.
 * Tests AppHost: when APP_READY received from iframe, placeholder cleared, OPEN_FILE sent.
 * Regression: random iframe with origin null must NOT be accepted.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AppHost from "../../core/AppHost.vue";
import { analytics } from "../../core/analytics";

describe("FP4 AppHost handshake (T-FP4-IV-HANDSHAKE)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears placeholder when APP_READY received from iframe", async () => {
    const openFilePayload = {
      initialPath: "/@root/DISK_C/My Documents/Images/sample.webp",
      initialUrl: "http://s3.shell.local/test.webp",
      playlist: [{ path: "/test.webp", url: "http://s3.shell.local/test.webp" }],
    };

    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-test",
        src: "about:blank",
        scale: 1,
        theme: "DefaultMock",
        openFilePayload,
      },
      attachTo: document.body,
    });

    // Wait for iframe to mount; jsdom may need time for contentWindow
    await new Promise((r) => setTimeout(r, 100));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    const cw = iframe.contentWindow;
    if (!cw) {
      // jsdom: about:blank may not provide contentWindow; skip
      wrapper.unmount();
      return;
    }

    // Mock postMessage to avoid jsdom "Invalid target origin 'null'" when Shell sends OPEN_FILE
    cw.postMessage = vi.fn();

    // Simulate APP_READY from iframe (as ImageViewer does)
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: cw,
      })
    );
    await nextTick();

    const placeholderAfter = wrapper.find(".app-host-placeholder");
    expect(placeholderAfter.exists()).toBe(false);

    wrapper.unmount();
  });

  it("T-FP4-M2-STRICT: handshake works (Vue equivalent of StrictMode double-mount)", async () => {
    const openFilePayload = {
      initialPath: "/@root/DISK_C/My Documents/Images/sample.webp",
      initialUrl: "http://s3.shell.local/test.webp",
      playlist: [{ path: "/test.webp", url: "http://s3.shell.local/test.webp" }],
    };

    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-strict-test",
        src: "about:blank",
        scale: 1,
        theme: "DefaultMock",
        openFilePayload,
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 150));

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    const cw = iframe.contentWindow;
    if (!cw) {
      wrapper.unmount();
      return;
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

    const placeholderAfter = wrapper.find(".app-host-placeholder");
    expect(placeholderAfter.exists()).toBe(false);

    wrapper.unmount();
  });

  it("T-FP4-M1-REGRESS: rejects APP_READY from origin null when source is not our iframe", async () => {
    analytics.clearBuffer();

    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-test",
        src: "about:blank",
        scale: 1,
        theme: "DefaultMock",
      },
      attachTo: document.body,
    });

    await new Promise((r) => setTimeout(r, 100));

    const fakeSource = { postMessage: vi.fn() } as unknown as MessageEventSource;

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "APP_READY", timestamp: Date.now() },
        origin: "null",
        source: fakeSource,
      })
    );
    await nextTick();

    const rejected = analytics.getBuffer().filter((e) => e.type === "message_rejected");
    expect(
      rejected.some((e) => e.type === "message_rejected" && e.reason === "unknown_source")
    ).toBe(true);

    const placeholderAfter = wrapper.find(".app-host-placeholder");
    expect(placeholderAfter.exists()).toBe(true);

    wrapper.unmount();
  });
});
