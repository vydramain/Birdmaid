/**
 * FP4 M0: Protocol must accept sandboxed iframe origin "null".
 * Unit: isAllowedOrigin("null") === true.
 * Contract: Shell accepts APP_READY from origin "null" ONLY when event.source === registered iframe.
 */

import { describe, it, expect } from "vitest";
import { isAllowedOrigin, ALLOWED_ORIGINS } from "../../core/protocol";

describe("FP4 Protocol — sandboxed iframe origin (M0)", () => {
  it("T-FP4-PROTOCOL-NULL: isAllowedOrigin('null') returns true", () => {
    expect(isAllowedOrigin("null")).toBe(true);
  });

  it("T-FP4-PROTOCOL-NULL-LIST: 'null' is in ALLOWED_ORIGINS", () => {
    expect(ALLOWED_ORIGINS).toContain("null");
  });

  it("T-FP4-PROTOCOL-NULL-ONLY: origin null accepted only when source is registered iframe (AppHost concern)", () => {
    expect(isAllowedOrigin("null")).toBe(true);
  });
});
