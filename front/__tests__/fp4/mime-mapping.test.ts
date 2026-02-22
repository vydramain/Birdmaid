/**
 * FP4 MIME mapping — mime.getType for allowlist ext → correct MIME.
 * TESTS-RED: uses getMimeForPath (stub throws).
 */

import { describe, it, expect } from "vitest";
import { getMimeForPath, isAllowedMime } from "../../lib/fp4/handler";

describe("FP4 mime-mapping", () => {
  describe("getMimeForPath", () => {
    it("returns image/png for .png", () => {
      expect(getMimeForPath("/@root/DISK_C/Images/photo.png")).toBe("image/png");
    });
    it("returns image/jpeg for .jpg and .jpeg", () => {
      expect(getMimeForPath("photo.jpg")).toBe("image/jpeg");
      expect(getMimeForPath("photo.jpeg")).toBe("image/jpeg");
    });
    it("returns image/webp for .webp", () => {
      expect(getMimeForPath("img.webp")).toBe("image/webp");
    });
    it("returns audio/mpeg for .mp3", () => {
      expect(getMimeForPath("track.mp3")).toBe("audio/mpeg");
    });
    it("returns video/mp4 for .mp4", () => {
      expect(getMimeForPath("video.mp4")).toBe("video/mp4");
    });
    it("returns video/webm for .webm", () => {
      expect(getMimeForPath("video.webm")).toBe("video/webm");
    });
    it("returns null for unsupported ext", () => {
      expect(getMimeForPath("file.txt")).toBeNull();
      expect(getMimeForPath("file.exe")).toBeNull();
      expect(getMimeForPath("file.gif")).toBeNull();
    });
  });

  describe("isAllowedMime", () => {
    it("allows image/png, image/jpeg, image/webp", () => {
      expect(isAllowedMime("image/png")).toBe(true);
      expect(isAllowedMime("image/jpeg")).toBe(true);
      expect(isAllowedMime("image/webp")).toBe(true);
    });
    it("allows audio/mpeg, video/mp4, video/webm", () => {
      expect(isAllowedMime("audio/mpeg")).toBe(true);
      expect(isAllowedMime("video/mp4")).toBe(true);
      expect(isAllowedMime("video/webm")).toBe(true);
    });
    it("rejects unsupported mime", () => {
      expect(isAllowedMime("text/plain")).toBe(false);
      expect(isAllowedMime("image/gif")).toBe(false);
      expect(isAllowedMime("application/octet-stream")).toBe(false);
    });
  });
});
