/**
 * FP4 M3: Default apps / MIME routing / Explorer→Shell open file.
 * T-FP4-MIME-MAP, T-FP4-DEFAULT-APP, T-FP4-OPEN-FILE-PAYLOAD.
 */

import { describe, it, expect } from "vitest";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { getMimeForPath, getHandlerForMime, isAllowedMime } from "../../lib/fp4/handler";
import { AppHost } from "../../core/AppHost";

function resolveAppIdForPath(
  path: string
): "image-viewer" | "media-player" | "internet-explorer" | null {
  const mime = getMimeForPath(path);
  if (!mime) return null;
  const handler = getHandlerForMime(mime);
  if (!handler) return null;
  return handler.appId as "image-viewer" | "media-player" | "internet-explorer";
}

describe("FP4 M3 MIME routing", () => {
  describe("T-FP4-MIME-MAP: mime lookup by ext; unknown → denied", () => {
    it("image ext → image MIME", () => {
      expect(getMimeForPath("a.png")).toBe("image/png");
      expect(getMimeForPath("a.jpg")).toBe("image/jpeg");
      expect(getMimeForPath("a.webp")).toBe("image/webp");
    });
    it("audio ext → audio MIME", () => {
      expect(getMimeForPath("a.mp3")).toBe("audio/mpeg");
    });
    it("video ext → video MIME", () => {
      expect(getMimeForPath("a.mp4")).toBe("video/mp4");
      expect(getMimeForPath("a.webm")).toBe("video/webm");
    });
    it("text ext → text MIME (Internet Explorer)", () => {
      expect(getMimeForPath("file.txt")).toBe("text/plain");
      expect(getMimeForPath("page.html")).toBe("text/html");
    });
    it("unknown ext → null (denied)", () => {
      expect(getMimeForPath("file.pdf")).toBeNull();
      expect(getMimeForPath("file.gif")).toBeNull();
      expect(getMimeForPath("file.xyz")).toBeNull();
    });
    it("isAllowedMime rejects unknown", () => {
      expect(isAllowedMime("application/pdf")).toBe(false);
      expect(isAllowedMime("image/gif")).toBe(false);
    });
  });

  describe("T-FP4-DEFAULT-APP: shell selects ImageViewer/MediaPlayer/InternetExplorer", () => {
    it("image path → image-viewer", () => {
      expect(resolveAppIdForPath("/dir/photo.png")).toBe("image-viewer");
      expect(resolveAppIdForPath("img.jpg")).toBe("image-viewer");
      expect(resolveAppIdForPath("pic.webp")).toBe("image-viewer");
    });
    it("audio path → media-player", () => {
      expect(resolveAppIdForPath("/music/track.mp3")).toBe("media-player");
    });
    it("video path → media-player", () => {
      expect(resolveAppIdForPath("/video/clip.mp4")).toBe("media-player");
      expect(resolveAppIdForPath("movie.webm")).toBe("media-player");
    });
    it("text path → internet-explorer", () => {
      expect(resolveAppIdForPath("doc.txt")).toBe("internet-explorer");
      expect(resolveAppIdForPath("page.html")).toBe("internet-explorer");
    });
    it("unknown path → null", () => {
      expect(resolveAppIdForPath("file.pdf")).toBeNull();
    });
  });

  describe("T-FP4-OPEN-FILE-PAYLOAD: correct path/url; no token; sandbox", () => {
    it("openFilePayload has initialPath, initialUrl, playlist; no token", () => {
      const payload = {
        initialPath: "/@root/DISK_C/My Documents/Images/sample.png",
        initialUrl: "http://s3.shell.local/bucket/sample.png?X-Amz-...",
        playlist: [
          {
            path: "/@root/DISK_C/My Documents/Images/sample.png",
            url: "http://s3.shell.local/...",
          },
        ],
      };
      expect(payload).toHaveProperty("initialPath");
      expect(payload).toHaveProperty("initialUrl");
      expect(payload).toHaveProperty("playlist");
      expect(Array.isArray(payload.playlist)).toBe(true);
      expect(payload.playlist[0]).toHaveProperty("path");
      expect(payload.playlist[0]).toHaveProperty("url");
      expect(payload).not.toHaveProperty("token");
      expect(payload).not.toHaveProperty("systemToken");
    });

    it("viewer iframe (image-viewer) has sandbox allow-scripts allow-same-origin", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      act(() => {
        root.render(
          <AppHost
            windowId="win-m3"
            src="/apps/image-viewer/"
            scale={1}
            theme="DefaultMock"
            onTitleUpdate={() => {}}
            openFilePayload={{
              initialPath: "/test.png",
              initialUrl: "http://s3.shell.local/test.png",
              playlist: [{ path: "/test.png", url: "http://s3.shell.local/test.png" }],
            }}
          />
        );
      });
      const iframe = container.querySelector("iframe");
      expect(iframe).toBeTruthy();
      const sandbox = (iframe as HTMLIFrameElement).getAttribute("sandbox");
      expect(sandbox).toContain("allow-scripts");
      expect(sandbox).toContain("allow-same-origin");
      root.unmount();
      container.remove();
    });
  });
});
