/**
 * Canary test: This file should FAIL inline style check
 * Purpose: Verify that inline style is rejected when file is not in allowlist (even with allow-tag)
 */

import React from "react";

export function CanaryInlineStyleNotAllowlistTest() {
  const x = 10;
  const y = 20;
  // inline-style: allowed (reason: drag/resize; why: mouse position; revisit: FP7)
  return (
    <div style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}>
      Should fail: not in allowlist (only WindowFrame.tsx permitted)
    </div>
  );
}
