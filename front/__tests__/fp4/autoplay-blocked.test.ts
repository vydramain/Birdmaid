/**
 * FP4 autoplay blocked → "Press Play" shown.
 * TESTS-RED: uses shouldShowPressPlay (stub throws).
 */

import { describe, it, expect } from "vitest";
import { shouldShowPressPlay } from "../../lib/fp4/autoplay";

describe("FP4 autoplay-blocked", () => {
  it("returns true when autoplay blocked", () => {
    expect(shouldShowPressPlay(true)).toBe(true);
  });
  it("returns false when autoplay succeeded", () => {
    expect(shouldShowPressPlay(false)).toBe(false);
  });
});
