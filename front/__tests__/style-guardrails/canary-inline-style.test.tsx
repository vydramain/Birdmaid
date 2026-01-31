/**
 * Canary test: This file should FAIL inline style check
 * Purpose: Verify that pre-commit hook blocks inline styles without allow-tag with reason
 */

import React from "react";

export function CanaryInlineStyleTest() {
  // This inline style should cause the check to fail
  // Missing: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
  return (
    <div style={{ padding: "8px", color: "red" }}>
      This should fail the style guardrails check (no allow-tag with reason)
    </div>
  );
}
