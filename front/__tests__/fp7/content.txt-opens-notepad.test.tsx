import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WindowRegistryProvider } from "@/os/wm/WindowRegistry";
import { appRegistry } from "@/os/apps/AppRegistry";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { Notepad } from "@/os/apps/Notepad";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import "@/os/apps/registry-init";

describe("Content Opening: Text files", () => {
  beforeEach(() => {
    resetVFSForTest();
  });

  it("should open .txt file in Notepad", async () => {
    // Set role to Organizer for write operations
    vfs.setUserRole("Organizer");
    // Create a test text file in VFS
    const testText = "Hello, World!\nThis is a test file.";
    vfs.writeFile("/Disk C/documents/test.txt", testText);
    // Set role back to Guest for read-only testing
    vfs.setUserRole("Guest");

    // Get the node
    const node = vfs.stat("/Disk C/documents/test.txt");
    expect(node).not.toBeNull();
    expect(node?.type).toBe("file");

    // Resolve app for file
    const appId = appRegistry.resolveAppForFile("test.txt");
    expect(appId).toBe("notepad");

    // Get app definition
    const app = appRegistry.get(appId);
    expect(app).toBeDefined();
    expect(app?.id).toBe("notepad");

    // Render Notepad with content
    render(
      <WindowRegistryProvider>
        <Notepad
          content={{
            node: node!,
            path: "/Disk C/documents/test.txt"
          }}
        />
      </WindowRegistryProvider>
    );

    // Notepad should render text content
    // Wait for loading to complete (Notepad shows HourglassLoader initially)
    await waitFor(() => {
      // Check if textarea exists with the content
      const textarea = screen.queryByDisplayValue(testText);
      if (textarea) {
        expect(textarea).toBeInTheDocument();
      } else {
        // Fallback: check if textarea exists at all (might be read-only)
        const anyTextarea = screen.queryByRole('textbox');
        if (anyTextarea) {
          expect((anyTextarea as HTMLTextAreaElement).value).toContain('Hello, World');
        } else {
          // Last resort: check if text appears anywhere
          expect(screen.getByText(/Hello, World/i)).toBeInTheDocument();
        }
      }
    }, { timeout: 3000 });
  });

  it("should open .md file in Notepad", async () => {
    // Set role to Organizer for write operations
    vfs.setUserRole("Organizer");
    // Create a test markdown file in VFS
    const testMarkdown = "# Title\n\nThis is **bold** text.";
    vfs.writeFile("/Disk C/documents/test.md", testMarkdown);
    // Set role back to Guest for read-only testing
    vfs.setUserRole("Guest");

    // Get the node
    const node = vfs.stat("/Disk C/documents/test.md");
    expect(node).not.toBeNull();

    // Resolve app for file
    const appId = appRegistry.resolveAppForFile("test.md");
    expect(appId).toBe("notepad");

    // Render Notepad with content
    render(
      <WindowRegistryProvider>
        <Notepad
          content={{
            node: node!,
            path: "/Disk C/documents/test.md"
          }}
        />
      </WindowRegistryProvider>
    );

    // Notepad should render markdown (as HTML preview for read-only)
    await waitFor(() => {
      // Should render markdown content
      expect(screen.queryByText(/Title/i) || screen.queryByText(testMarkdown)).toBeTruthy();
    });
  });

  it("should map .txt extension to Notepad", () => {
    const appId = appRegistry.resolveAppForFile("file.txt");
    expect(appId).toBe("notepad");
  });

  it("should map .md extension to Notepad", () => {
    const appId = appRegistry.resolveAppForFile("file.md");
    expect(appId).toBe("notepad");
  });
});
