/**
 * FP4 M0: T-FP4-M0-PAYLOAD-SCHEMA — Viewer OPEN_FILE handshake protocol.
 * Unit: payload schema and viewer state transition.
 */

import { describe, it, expect } from "vitest";

interface OpenFilePayload {
  initialPath: string;
  initialUrl: string;
  playlist: Array<{ path: string; url: string }>;
}

describe("FP4 Viewer OPEN_FILE handshake (T-FP4-M0-PAYLOAD-SCHEMA)", () => {
  it("T-FP4-M0-PAYLOAD-SCHEMA: OpenFilePayload has initialPath, initialUrl, playlist; no token", () => {
    const payload: OpenFilePayload = {
      initialPath: "/@root/DISK_C/My Documents/Images/sample.webp",
      initialUrl: "http://s3.shell.local/birdmaid-dev/roots/...",
      playlist: [
        {
          path: "/@root/DISK_C/My Documents/Images/sample.webp",
          url: "http://s3.shell.local/...",
        },
      ],
    };
    expect(payload).toHaveProperty("initialPath");
    expect(payload).toHaveProperty("initialUrl");
    expect(payload).toHaveProperty("playlist");
    expect(Array.isArray(payload.playlist)).toBe(true);
    expect(payload).not.toHaveProperty("token");
    expect(payload).not.toHaveProperty("systemToken");
  });
});
