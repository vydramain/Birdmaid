/**
 * REPO M1 RED: SSOT min-size CSS vars on window element.
 * Fails until --wm-window-min-width-px and --wm-window-min-height-px are set from TS.
 */

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Shell from "../../Shell.vue";
import "../../index.css";

const EXPECTED_MIN_WIDTH_PX = 640;
const EXPECTED_MIN_HEIGHT_PX = 400;

describe("REPO M1 SSOT: min-size CSS vars on window", () => {
  it("T-SSOT-CSS-VARS: window element has --wm-window-min-width-px and --wm-window-min-height-px set and match expected", async () => {
    const wrapper = mount(Shell, { attachTo: document.body });

    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const myComputerBtn = wrapper.find('[data-testid="desktop-icon-my-computer"]');
    expect(myComputerBtn.exists()).toBe(true);
    await myComputerBtn.trigger("dblclick");

    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const windowEl = wrapper.find(".wm-window").element as HTMLElement;
    expect(windowEl).toBeTruthy();

    const styles = getComputedStyle(windowEl);
    const minWidthPx = styles.getPropertyValue("--wm-window-min-width-px").trim();
    const minHeightPx = styles.getPropertyValue("--wm-window-min-height-px").trim();

    expect(minWidthPx).not.toBe("");
    expect(minHeightPx).not.toBe("");

    const widthVal = parseInt(minWidthPx.replace(/px$/, ""), 10);
    const heightVal = parseInt(minHeightPx.replace(/px$/, ""), 10);

    expect(widthVal).toBe(EXPECTED_MIN_WIDTH_PX);
    expect(heightVal).toBe(EXPECTED_MIN_HEIGHT_PX);

    wrapper.unmount();
  });
});
