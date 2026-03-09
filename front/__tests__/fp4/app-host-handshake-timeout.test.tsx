/**
 * FP4 M0: T-FP4-M0-HANDSHAKE-TIMEOUT — when APP_READY never arrives, placeholder shows "App not responding".
 * Unit: AppHost handshake timeout path.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AppHost from "../../core/AppHost.vue";

const HANDSHAKE_TIMEOUT_MS = 2000;

describe("FP4 AppHost handshake timeout (T-FP4-M0-HANDSHAKE-TIMEOUT)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("T-FP4-M0-HANDSHAKE-TIMEOUT: placeholder shows 'App not responding' when APP_READY never received", async () => {
    const wrapper = mount(AppHost, {
      props: {
        windowId: "win-timeout-test",
        src: "about:blank",
        scale: 1,
        theme: "DefaultMock",
      },
      attachTo: document.body,
    });

    vi.advanceTimersByTime(50);
    await nextTick();

    // Before timeout: placeholder shows "Loading..."
    const placeholderBefore = wrapper.find(".app-host-placeholder");
    expect(placeholderBefore.exists()).toBe(true);
    expect(placeholderBefore.text()).toBe("Loading...");

    // Advance past handshake timeout (AppHost uses 2000ms)
    vi.advanceTimersByTime(HANDSHAKE_TIMEOUT_MS + 100);
    await nextTick();

    // After timeout: placeholder shows "App not responding"
    const placeholderAfter = wrapper.find(".app-host-placeholder");
    expect(placeholderAfter.exists()).toBe(true);
    expect(placeholderAfter.text()).toBe("App not responding");

    wrapper.unmount();
  }, 3000);
});
