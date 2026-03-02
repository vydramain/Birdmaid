/**
 * FP4 ring navigation — next/prev with wrap-around.
 * TESTS-RED: uses nextIndex, prevIndex (stubs throw).
 */

import { describe, it, expect } from "vitest";
import { nextIndex, prevIndex } from "../../lib/fp4/playlist";

describe("FP4 playlist-nav", () => {
  const len = 5;

  describe("nextIndex", () => {
    it("increments within bounds", () => {
      expect(nextIndex(0, len)).toBe(1);
      expect(nextIndex(1, len)).toBe(2);
      expect(nextIndex(3, len)).toBe(4);
    });
    it("wraps from last to first", () => {
      expect(nextIndex(4, len)).toBe(0);
    });
    it("handles single-item playlist", () => {
      expect(nextIndex(0, 1)).toBe(0);
    });
  });

  describe("prevIndex", () => {
    it("decrements within bounds", () => {
      expect(prevIndex(4, len)).toBe(3);
      expect(prevIndex(2, len)).toBe(1);
      expect(prevIndex(1, len)).toBe(0);
    });
    it("wraps from first to last", () => {
      expect(prevIndex(0, len)).toBe(4);
    });
    it("handles single-item playlist", () => {
      expect(prevIndex(0, 1)).toBe(0);
    });
  });
});
