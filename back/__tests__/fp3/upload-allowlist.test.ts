/**
 * FP3.1 M7: upload-file allowlist unit tests.
 */

import { checkUploadAllowlist } from "../../src/upload-allowlist.js";

describe("upload-allowlist", () => {
  it("allows png ext + image/png mime", () => {
    expect(checkUploadAllowlist("photo.png", "image/png")).toEqual({ ok: true });
  });
  it("allows jpg ext + image/jpeg mime", () => {
    expect(checkUploadAllowlist("photo.jpg", "image/jpeg")).toEqual({ ok: true });
  });
  it("allows webp, mp3, mp4, webm", () => {
    expect(checkUploadAllowlist("a.webp", "image/webp")).toEqual({ ok: true });
    expect(checkUploadAllowlist("a.mp3", "audio/mpeg")).toEqual({ ok: true });
    expect(checkUploadAllowlist("a.mp4", "video/mp4")).toEqual({ ok: true });
    expect(checkUploadAllowlist("a.webm", "video/webm")).toEqual({ ok: true });
  });
  it("rejects disallowed ext (.txt) -> 415", () => {
    const r = checkUploadAllowlist("file.txt", "text/plain");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("UNSUPPORTED_MEDIA");
  });
  it("rejects disallowed mime (image/gif)", () => {
    const r = checkUploadAllowlist("file.gif", "image/gif");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("UNSUPPORTED_MEDIA");
  });
});
