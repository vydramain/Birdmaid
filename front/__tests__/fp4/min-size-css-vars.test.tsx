/**
 * REPO M1 RED: SSOT min-size CSS vars on window element.
 * Fails until --wm-window-min-width-px and --wm-window-min-height-px are set from TS.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Shell } from "../../Shell";
import "../../index.css";

const EXPECTED_MIN_WIDTH_PX = 640;
const EXPECTED_MIN_HEIGHT_PX = 400;

describe("REPO M1 SSOT: min-size CSS vars on window", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("T-SSOT-CSS-VARS: window element has --wm-window-min-width-px and --wm-window-min-height-px set and match expected", async () => {
    const root = createRoot(container);
    root.render(<Shell />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const myComputerBtn = container.querySelector(
      '[data-testid="desktop-icon-my-computer"]'
    ) as HTMLElement;
    expect(myComputerBtn).toBeTruthy();
    await act(async () => {
      myComputerBtn.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const windowEl = container.querySelector(".wm-window") as HTMLElement;
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

    root.unmount();
  });
});
