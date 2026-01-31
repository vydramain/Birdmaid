/**
 * Canary test: This file should FAIL inline style check for absolute units
 * Purpose: Verify that pre-commit hook blocks absolute units in inline styles
 */

import React from "react";

export function CanaryInlineAbsoluteUnitsTest() {
  // These inline styles should cause the check to fail (absolute units)
  return (
    <>
      {/* px - forbidden */}
      <div style={{ width: "10px" }}>px forbidden</div>

      {/* pt - forbidden */}
      <div style={{ height: "2pt" }}>pt forbidden</div>

      {/* Even with allow-tag, absolute units are forbidden */}
      {/* inline-style: allowed (reason: drag/resize) */}
      <div style={{ transform: `translate3d(10px, 20px, 0)` }}>px in transform - forbidden</div>
    </>
  );
}
