/**
 * Canary test: This file should FAIL inline style check
 * Purpose: Verify that inline with constant literals + layout-calc allow-tag is rejected
 */

import React from "react";

export function CanaryInlineStyleConstantsTest() {
  // inline-style: allowed (reason: layout-calc; why: viewport; revisit: FP7)
  // Violation: all values are literals, no runtime measurement
  return (
    <div style={{ width: "200px", height: "100px" }}>
      This should fail (constant literals with layout-calc)
    </div>
  );
}
