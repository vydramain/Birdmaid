/**
 * FP4 handler routing — MIME → ImageViewer | MediaPlayer(mode).
 * TESTS-RED: uses getHandlerForMime (stub throws).
 */

import { describe, it, expect } from "vitest";
import { getHandlerForMime } from "../../lib/fp4/handler";

describe("FP4 handler-routing", () => {
  describe("image types", () => {
    it("image/png → image-viewer", () => {
      expect(getHandlerForMime("image/png")).toEqual({ appId: "image-viewer" });
    });
    it("image/jpeg → image-viewer", () => {
      expect(getHandlerForMime("image/jpeg")).toEqual({ appId: "image-viewer" });
    });
    it("image/webp → image-viewer", () => {
      expect(getHandlerForMime("image/webp")).toEqual({ appId: "image-viewer" });
    });
  });

  describe("audio type", () => {
    it("audio/mpeg → media-player mode=audio", () => {
      expect(getHandlerForMime("audio/mpeg")).toEqual({
        appId: "media-player",
        mode: "audio",
      });
    });
  });

  describe("video types", () => {
    it("video/mp4 → media-player mode=video", () => {
      expect(getHandlerForMime("video/mp4")).toEqual({
        appId: "media-player",
        mode: "video",
      });
    });
    it("video/webm → media-player mode=video", () => {
      expect(getHandlerForMime("video/webm")).toEqual({
        appId: "media-player",
        mode: "video",
      });
    });
  });

  describe("unsupported", () => {
    it("returns null for text/plain", () => {
      expect(getHandlerForMime("text/plain")).toBeNull();
    });
    it("returns null for image/gif", () => {
      expect(getHandlerForMime("image/gif")).toBeNull();
    });
  });
});
