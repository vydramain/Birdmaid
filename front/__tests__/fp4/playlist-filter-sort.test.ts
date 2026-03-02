/**
 * FP4 playlist builder — filter by ext, sort localeCompare.
 * TESTS-RED: uses filterMediaItems, sortByLocaleCompare (stubs throw).
 */

import { describe, it, expect } from "vitest";
import {
  filterMediaItems,
  sortByLocaleCompare,
  getExtensionsForMedia,
  type FsItem,
} from "../../lib/fp4/playlist";

describe("FP4 playlist-filter-sort", () => {
  const sampleItems: FsItem[] = [
    { path: "/dir/c.png", name: "c.png", kind: "file" },
    { path: "/dir/a.jpg", name: "a.jpg", kind: "file" },
    { path: "/dir/b.webp", name: "b.webp", kind: "file" },
    { path: "/dir/readme.txt", name: "readme.txt", kind: "file" },
    { path: "/dir/z.mp3", name: "z.mp3", kind: "file" },
  ];

  describe("getExtensionsForMedia", () => {
    it("returns image exts for image", () => {
      const ext = getExtensionsForMedia("image");
      expect(ext).toContain(".png");
      expect(ext).toContain(".jpg");
      expect(ext).toContain(".jpeg");
      expect(ext).toContain(".webp");
    });
    it("returns .mp3 for audio", () => {
      expect(getExtensionsForMedia("audio")).toContain(".mp3");
    });
    it("returns .mp4 and .webm for video", () => {
      const ext = getExtensionsForMedia("video");
      expect(ext).toContain(".mp4");
      expect(ext).toContain(".webm");
    });
  });

  describe("filterMediaItems", () => {
    it("filters by image ext", () => {
      const ext = getExtensionsForMedia("image");
      const filtered = filterMediaItems(sampleItems, ext);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((i) => i.name).sort()).toEqual(["a.jpg", "b.webp", "c.png"]);
    });
    it("filters by audio ext", () => {
      const ext = getExtensionsForMedia("audio");
      const filtered = filterMediaItems(sampleItems, ext);
      expect(filtered.map((i) => i.name)).toEqual(["z.mp3"]);
    });
    it("excludes non-matching ext", () => {
      const ext = getExtensionsForMedia("image");
      const filtered = filterMediaItems(sampleItems, ext);
      expect(filtered).not.toContainEqual(expect.objectContaining({ name: "readme.txt" }));
    });
  });

  describe("sortByLocaleCompare", () => {
    it("sorts items by name (localeCompare)", () => {
      const items: FsItem[] = [
        { path: "/d/c.png", name: "c.png", kind: "file" },
        { path: "/d/a.jpg", name: "a.jpg", kind: "file" },
        { path: "/d/b.webp", name: "b.webp", kind: "file" },
      ];
      const sorted = sortByLocaleCompare(items);
      expect(sorted.map((i) => i.name)).toEqual(["a.jpg", "b.webp", "c.png"]);
    });
  });
});
