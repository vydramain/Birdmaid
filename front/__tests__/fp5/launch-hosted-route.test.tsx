/**
 * FP5 M1: Launch tests (L1, L3).
 * L1: double click user app => Shell creates window with hosted route src
 * L3: broken package (no index.html) => controlled error state, Shell stable
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AppHost from "../../core/AppHost.vue";

const HANDSHAKE_TIMEOUT_MS = 2000;

describe("FP5 Launch (L1, L3)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("L1: user app window MUST use hosted route src (/apps/user/pkg/), not open-url signed URL", async () => {
    const userAppSrc =
      "/apps/user/pkg/" + encodeURIComponent("/@root/DISK_C/My Documents/sample-app/") + "/";
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-l1",
        src: userAppSrc,
        scale: 1,
        theme: "DefaultMock",
      },
      attachTo: document.body,
    });

    await nextTick();

    const iframe = wrapper.find("iframe").element as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    const src = iframe.getAttribute("src");
    expect(src).toContain("/apps/user/");
    expect(src).toContain("/pkg/");

    wrapper.unmount();
  });

  it("L3: broken package (missing index.html) => controlled error state after timeout", async () => {
    vi.useFakeTimers();

    const brokenUserAppSrc =
      "/apps/user/pkg/" + encodeURIComponent("/@root/DISK_C/My Documents/nonexistent/") + "/";
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-fp5-l3",
        src: brokenUserAppSrc,
        scale: 1,
        theme: "DefaultMock",
      },
      attachTo: document.body,
    });

    vi.advanceTimersByTime(50);
    await nextTick();

    expect(wrapper.find(".app-host-placeholder").text()).toBe("Loading...");

    vi.advanceTimersByTime(HANDSHAKE_TIMEOUT_MS + 100);
    await nextTick();

    const placeholder = wrapper.find(".app-host-placeholder");
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.text()).toMatch(/not responding|invalid|error/i);

    wrapper.unmount();
    vi.useRealTimers();
  }, 5000);
});
