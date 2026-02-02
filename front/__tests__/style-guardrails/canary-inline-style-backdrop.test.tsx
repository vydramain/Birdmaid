/**
 * Canary test: This file should FAIL inline style check
 * Purpose: Verify that fixed fullscreen backdrop with allow-tag is rejected
 */

import React from "react";

export function CanaryInlineStyleBackdropTest() {
  // inline-style: allowed (reason: layout-calc; why: fullscreen overlay; revisit: FP7)
  // Violation: disallowed pattern - fixed fullscreen backdrop
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
      }}
    >
      This should fail (disallowed backdrop pattern)
    </div>
  );
}
