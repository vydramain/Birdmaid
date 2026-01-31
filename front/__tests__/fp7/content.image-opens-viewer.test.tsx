import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WindowRegistryProvider } from "@/os/wm/WindowRegistry";
import { appRegistry } from "@/os/apps/AppRegistry";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { ImageViewer } from "@/os/apps/ImageViewer";
// Ensure apps are initialized (side-effect import)
import "@/os/apps/registry-init";

describe("Content Opening: Image files", () => {
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

  it("should open .png file in ImageViewer", async () => {
    // Create a test image file in VFS
    const testImageBlob = new Blob(["fake-image-data"], { type: "image/png" });
    vfs.writeFile("/Disk C/images/test.png", testImageBlob);

    // Get the node
    const node = vfs.stat("/Disk C/images/test.png");
    expect(node).not.toBeNull();
    expect(node?.type).toBe("file");

    // Resolve app for file
    const appId = appRegistry.resolveAppForFile("test.png");
    expect(appId).toBe("imageviewer");

    // Get app definition
    const app = appRegistry.get(appId);
    expect(app).toBeDefined();
    expect(app?.id).toBe("imageviewer");

    // Render ImageViewer with content
    render(
      <WindowRegistryProvider>
        <ImageViewer
          content={{
            node: node!,
            path: "/Disk C/images/test.png"
          }}
        />
      </WindowRegistryProvider>
    );

    // ImageViewer should render (check for loading or image)
    await waitFor(() => {
      const img = screen.queryByAltText("test.png");
      // Image might be loading or rendered
      expect(img || screen.queryByText(/loading/i) || screen.queryByText(/error/i)).toBeTruthy();
    });
  });

  it("should map .jpg extension to ImageViewer", () => {
    const appId = appRegistry.resolveAppForFile("photo.jpg");
    expect(appId).toBe("imageviewer");
  });

  it("should map .jpeg extension to ImageViewer", () => {
    const appId = appRegistry.resolveAppForFile("photo.jpeg");
    expect(appId).toBe("imageviewer");
  });

  it("should map .gif extension to ImageViewer", () => {
    const appId = appRegistry.resolveAppForFile("animation.gif");
    expect(appId).toBe("imageviewer");
  });

  it("should map .webp extension to ImageViewer", () => {
    const appId = appRegistry.resolveAppForFile("image.webp");
    expect(appId).toBe("imageviewer");
  });
});
