/**
 * Vitest setup: URL.createObjectURL polyfill for jsdom.
 * jsdom does not implement createObjectURL/revokeObjectURL.
 */

import { vi } from "vitest";

if (typeof URL !== "undefined") {
  (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = vi.fn(
    () => "blob:test-" + Math.random().toString(36)
  );
  (URL as unknown as { revokeObjectURL: (u: string) => void }).revokeObjectURL = vi.fn();
}
