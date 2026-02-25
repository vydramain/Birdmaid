#!/usr/bin/env node

/**
 * REPO M1: Grep test — fails if front/index.css defines min-size base vars.
 * After SSOT (M2), these vars are injected from TS; CSS must not define them.
 *
 * Usage: node scripts/check-min-size-ssot.cjs
 * Exit: 0 if OK (no base vars in CSS), 1 if FAIL (base vars found).
 */

const fs = require("fs");
const path = require("path");

const CSS_PATH = path.join(__dirname, "../front/index.css");
const FORBIDDEN = ["--wm-window-min-width-base", "--wm-window-min-height-base"];

const content = fs.readFileSync(CSS_PATH, "utf-8");
const found = FORBIDDEN.filter((p) => content.includes(p));

if (found.length > 0) {
  console.error(
    `[check-min-size-ssot] FAIL: front/index.css contains forbidden vars (SSOT not implemented):\n  ${found.join("\n  ")}`
  );
  process.exit(1);
}

console.log("[check-min-size-ssot] OK: no min-size base vars in CSS");
process.exit(0);
