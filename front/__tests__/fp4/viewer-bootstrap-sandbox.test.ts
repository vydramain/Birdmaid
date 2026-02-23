/**
 * FP4 M0: T-FP4-M0-BOOT — Viewer bundle bootstrap in sandbox context.
 * Regression: viewer must use targetOrigin "*" for APP_READY (not window.location.origin).
 * Using "null" or window.location.origin causes postMessage delivery failure → handshake timeout → "App not responding".
 *
 * RED: Asserts viewer does NOT use window.location.origin. Will pass after fix.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const IMAGE_VIEWER_HTML = resolve(__dirname, "../../apps/image-viewer/index.html");

describe("FP4 Viewer bootstrap in sandbox (T-FP4-M0-BOOT)", () => {
  it("T-FP4-M0-BOOT: viewer APP_READY postMessage uses targetOrigin * (not window.location.origin)", () => {
    const html = readFileSync(IMAGE_VIEWER_HTML, "utf-8");
    // Regression: viewer must use "*" so message delivers to shell.local parent.
    // Using window.location.origin causes handshake timeout in sandboxed iframe (origin "null").
    const usesWindowLocationOrigin = html.includes("window.location.origin");
    expect(usesWindowLocationOrigin).toBe(false);
  });

  it("T-FP4-M0-BOOT-MODULE: viewer uses module script (requires ACAO for opaque-origin)", () => {
    const html = readFileSync(IMAGE_VIEWER_HTML, "utf-8");
    // Module scripts in sandbox (opaque origin) require CORS. Vite middleware adds ACAO: *.
    expect(html).toContain('type="module"');
    expect(html).toMatch(/src="\.\/main\.ts"/);
  });
});
