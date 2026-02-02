/**
 * Canary test: This file should PASS inline style check
 * Purpose: Verify that allow-tag v2 with reason, why, revisit + runtime values works correctly
 */

import React from "react";

export function CanaryInlineStyleAllowedTest() {
  const x = 10;
  const y = 20;
  // inline-style: allowed (reason: drag/resize; why: mouse position during drag; revisit: FP7)
  return (
    <div style={{ transform: `translate3d(${x}px, ${y}px, 0)`, zIndex: 100 }}>
      This should pass the style guardrails check (has allow-tag v2 + runtime values)
    </div>
  );
}
