/**
 * FP4 M4: Explorer postMessage targetOrigin.
 * Explorer MUST use targetOrigin "*" so SHELL_OPEN_FILE is delivered when parent
 * is in embedded contexts (Cursor Simple Browser, Electron webview, etc).
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("FP4 Explorer — postMessage targetOrigin (M4)", () => {
  it("T-FP4-M4-EXPLORER-TARGET: Explorer send() uses targetOrigin '*' not window.location.origin", () => {
    const source = readFileSync(join(process.cwd(), "front/apps/explorer/main.ts"), "utf-8");
    // Must use "*" for postMessage so messages reach parent in webview/embedded contexts
    expect(source).toMatch(/postMessage[^;]*["']\*["']\s*\)/);
    expect(source).not.toMatch(/postMessage[^;]*window\.location\.origin\s*\)/);
  });

  it("T-FP4-M3-PLAYLIST-LIMIT: Explorer uses PLAYLIST_LIMIT = 100", () => {
    const source = readFileSync(join(process.cwd(), "front/apps/explorer/main.ts"), "utf-8");
    expect(source).toContain("PLAYLIST_LIMIT = 100");
    expect(source).toMatch(/slice\(0,\s*PLAYLIST_LIMIT\)/);
  });
});
