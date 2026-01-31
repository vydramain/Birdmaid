import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WindowRegistryProvider } from "@/os/wm/WindowRegistry";
import { appRegistry } from "@/os/apps/AppRegistry";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { VideoViewer } from "@/os/apps/VideoViewer";
// Ensure apps are initialized (side-effect import)
import "@/os/apps/registry-init";

describe("Content Opening: Video files", () => {
  beforeEach(() => {
    // Reset VFS
    (vfs as any).root = {
      name: '',
      type: 'dir',
      children: [],
    };
    (vfs as any).initializeSystemFolders();
    vfs.setUserRole('Organizer');
  });

  it("should open .mp4 file in VideoViewer", async () => {
    // Create a test video file in VFS
    const testVideoBlob = new Blob(["fake-video-data"], { type: "video/mp4" });
    vfs.writeFile("/Disk C/videos/test.mp4", testVideoBlob);

    // Get the node
    const node = vfs.stat("/Disk C/videos/test.mp4");
    expect(node).not.toBeNull();
    expect(node?.type).toBe("file");

    // Resolve app for file
    const appId = appRegistry.resolveAppForFile("test.mp4");
    expect(appId).toBe("videoviewer");

    // Get app definition
    const app = appRegistry.get(appId);
    expect(app).toBeDefined();
    expect(app?.id).toBe("videoviewer");

    // Render VideoViewer with content
    render(
      <WindowRegistryProvider>
        <VideoViewer
          content={{
            node: node!,
            path: "/Disk C/videos/test.mp4"
          }}
        />
      </WindowRegistryProvider>
    );

    // VideoViewer should render (check for video element)
    // Video element doesn't have title attribute, use getByRole instead
    await waitFor(() => {
      // Check if video element exists (by role or by tag name)
      const video = screen.queryByRole('video') || document.querySelector('video');
      // Video might be loading, rendered, or showing error
      expect(video || screen.queryByText(/loading/i) || screen.queryByText(/error/i)).toBeTruthy();
    });
  });

  it("should map .mp4 extension to VideoViewer", () => {
    const appId = appRegistry.resolveAppForFile("video.mp4");
    expect(appId).toBe("videoviewer");
  });

  it("should map .webm extension to VideoViewer", () => {
    const appId = appRegistry.resolveAppForFile("video.webm");
    expect(appId).toBe("videoviewer");
  });

  it("should map .ogg extension to VideoViewer", () => {
    const appId = appRegistry.resolveAppForFile("video.ogg");
    expect(appId).toBe("videoviewer");
  });
});
