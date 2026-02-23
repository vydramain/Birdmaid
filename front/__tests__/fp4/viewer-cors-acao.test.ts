/**
 * FP4 M1: T-FP4-M1-CORS-ACAO — Regression: viewer assets must get ACAO for opaque-origin.
 * Sandbox allow-scripts iframe has origin "null"; module scripts require CORS.
 * Vite dev middleware adds Access-Control-Allow-Origin: * for viewer paths.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const VITE_CONFIG = resolve(__dirname, "../../../vite.config.ts");

describe("FP4 Viewer CORS ACAO (T-FP4-M1-CORS-ACAO)", () => {
  it("T-FP4-M1-CORS-ACAO: vite config sets ACAO for viewer paths (image-viewer, media-player, @vite, @id, node_modules)", () => {
    const config = readFileSync(VITE_CONFIG, "utf-8");
    // M1 Option C: viewer assets need ACAO for opaque-origin iframe
    expect(config).toContain("Access-Control-Allow-Origin");
    expect(config).toContain('"*"');
    expect(config).toContain("image-viewer");
    expect(config).toContain("media-player");
    // Vite injects @vite/client and @id/ into viewer HTML in dev
    expect(config).toMatch(/@vite|@id/);
    expect(config).toContain("node_modules");
  });
});
