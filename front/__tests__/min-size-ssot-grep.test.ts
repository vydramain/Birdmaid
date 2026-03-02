/**
 * REPO M1 RED: Grep test — fails if front/index.css defines min-size base vars.
 * After SSOT (M2), these vars are injected from TS; CSS must not define them.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const CSS_PATH = join(process.cwd(), "front/index.css");
const FORBIDDEN = ["--wm-window-min-width-base", "--wm-window-min-height-base"];

describe("REPO M1 SSOT: grep test (no min-size base vars in CSS)", () => {
  it("T-SSOT-GREP: front/index.css must not contain --wm-window-min-*-base", () => {
    const content = readFileSync(CSS_PATH, "utf-8");
    const found = FORBIDDEN.filter((p) => content.includes(p));
    expect(
      found,
      `front/index.css contains forbidden vars (SSOT not implemented): ${found.join(", ")}`
    ).toEqual([]);
  });
});
