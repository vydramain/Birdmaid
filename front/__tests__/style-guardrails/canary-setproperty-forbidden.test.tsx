/**
 * Canary test: This file should FAIL inline style check
 * Purpose: Verify that setProperty for props other than --cm-x/--cm-y is rejected
 */

import React, { useRef, useEffect } from "react";

export function CanarySetPropertyForbiddenTest() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("--custom-x", "10px");
    }
  }, []);
  return <div ref={ref}>setProperty(--custom-x) should be rejected</div>;
}
