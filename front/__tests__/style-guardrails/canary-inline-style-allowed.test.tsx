/**
 * Canary test: This file should PASS inline style check
 * Purpose: Verify that allow-tag comment with reason works correctly
 */

import React from "react";

export function CanaryInlineStyleAllowedTest() {
  // inline-style: allowed (reason: drag/resize)
  // This is a whitelist case (drag/resize positioning)
  return (
    <div style={{ transform: "translate3d(10px, 20px, 0)", zIndex: 100 }}>
      This should pass the style guardrails check (has allow-tag with reason)
    </div>
  );
}
