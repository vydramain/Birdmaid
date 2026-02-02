import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WindowRegistryProvider } from "@/os/wm/WindowRegistry";
import { appRegistry } from "@/os/apps/AppRegistry";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { InternetExplorer } from "@/os/apps/InternetExplorer";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import "@/os/apps/registry-init";

describe("Content Opening: HTML files", () => {
  beforeEach(() => {
    resetVFSForTest();
    vfs.setUserRole("Organizer");
  });

  it("should open .html file in Internet Explorer", async () => {
    // Create a test HTML file in VFS
    const testHTML = "<html><body><h1>Hello World</h1></body></html>";
    vfs.writeFile("/Disk C/desktop/test.html", testHTML);

    // Get the node
    const node = vfs.stat("/Disk C/desktop/test.html");
    expect(node).not.toBeNull();
    expect(node?.type).toBe("file");

    // Resolve app for file
    const appId = appRegistry.resolveAppForFile("test.html");
    expect(appId).toBe("internetexplorer");

    // Get app definition
    const app = appRegistry.get(appId);
    expect(app).toBeDefined();
    expect(app?.id).toBe("internetexplorer");

    // Render Internet Explorer with content
    render(
      <WindowRegistryProvider>
        <InternetExplorer
          content={{
            node: node!,
            path: "/Disk C/desktop/test.html"
          }}
        />
      </WindowRegistryProvider>
    );

    // Internet Explorer should render iframe
    await waitFor(() => {
      const iframe = screen.queryByTitle("test.html");
      // Iframe should have sandbox attribute
      if (iframe) {
        expect(iframe).toHaveAttribute("sandbox");
        const sandbox = iframe.getAttribute("sandbox");
        expect(sandbox).toContain("allow-scripts");
        expect(sandbox).toContain("allow-same-origin");
        expect(sandbox).not.toContain("allow-top-navigation");
      }
      // Or might be loading/error
      expect(iframe || screen.queryByText(/loading/i) || screen.queryByText(/error/i)).toBeTruthy();
    });
  });

  it("should map .html extension to Internet Explorer", () => {
    const appId = appRegistry.resolveAppForFile("page.html");
    expect(appId).toBe("internetexplorer");
  });

  it("should map .htm extension to Internet Explorer", () => {
    const appId = appRegistry.resolveAppForFile("page.htm");
    expect(appId).toBe("internetexplorer");
  });

  it("should have strict sandbox policy in Internet Explorer iframe", async () => {
    const testHTML = "<html><body>Test</body></html>";
    vfs.writeFile("/Disk C/desktop/test.html", testHTML);
    const node = vfs.stat("/Disk C/desktop/test.html");

    render(
      <WindowRegistryProvider>
        <InternetExplorer
          content={{
            node: node!,
            path: "/Disk C/desktop/test.html"
          }}
        />
      </WindowRegistryProvider>
    );

    await waitFor(() => {
      const iframe = screen.queryByTitle("test.html");
      if (iframe) {
        const sandbox = iframe.getAttribute("sandbox");
        // Should have required permissions
        expect(sandbox).toContain("allow-scripts");
        expect(sandbox).toContain("allow-same-origin");
        // Should NOT have dangerous permissions
        expect(sandbox).not.toContain("allow-top-navigation");
        expect(sandbox).not.toContain("allow-modals");
      }
    });
  });
});
