/**
 * FP4 M0: T-FP4-M0-HANDSHAKE — Viewer OPEN_FILE handshake protocol.
 * Unit: payload schema and viewer state transition.
 *
 * RED: Asserts OpenFilePayload includes expiresAt for signed URL audit trail.
 * Current payload: { initialPath, initialUrl, playlist }. Will pass after fix.
 */

import { describe, it, expect } from "vitest";

// OpenFilePayload schema from AppHost / WindowManager
interface OpenFilePayload {
  initialPath: string;
  initialUrl: string;
  playlist: Array<{ path: string; url: string }>;
  expiresAt?: number;
}

function createPayload(
  path: string,
  url: string,
  playlist: Array<{ path: string; url: string }>,
  expiresAt?: number
): OpenFilePayload {
  const p: OpenFilePayload = {
    initialPath: path,
    initialUrl: url,
    playlist,
  };
  if (expiresAt !== undefined) p.expiresAt = expiresAt;
  return p;
}

describe("FP4 Viewer OPEN_FILE handshake (T-FP4-M0-PAYLOAD-SCHEMA)", () => {
  it("T-FP4-M0-PAYLOAD-SCHEMA: OpenFilePayload schema includes expiresAt for signed URL audit", () => {
    const payload = createPayload(
      "/@root/DISK_C/My Documents/Images/sample.webp",
      "http://s3.shell.local/birdmaid-dev/roots/...",
      [{ path: "/@root/DISK_C/My Documents/Images/sample.webp", url: "http://s3.shell.local/..." }]
    );
    // RED: Payload must include expiresAt when URL is presigned (audit trail).
    expect(payload).toHaveProperty("expiresAt");
    expect(typeof payload.expiresAt).toBe("number");
  });
});
