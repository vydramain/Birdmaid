/**
 * FP4 unsupported MIME — log only, no crash, no handler.
 * TESTS-RED: getHandlerForMime returns null for unsupported.
 */

import { describe, it, expect } from "vitest";
import { getHandlerForMime, getMimeForPath } from "../../lib/fp4/handler";

describe("FP4 unsupported-mime", () => {
  it("getHandlerForMime returns null for unsupported", () => {
    expect(getHandlerForMime("application/pdf")).toBeNull();
    expect(getHandlerForMime("image/gif")).toBeNull();
  });
  it("getMimeForPath returns null for unsupported ext", () => {
    expect(getMimeForPath("doc.pdf")).toBeNull();
    expect(getMimeForPath("script.exe")).toBeNull();
  });
});
