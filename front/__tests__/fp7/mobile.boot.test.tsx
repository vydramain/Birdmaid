import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MobileApp } from "../../apps/mobile/MobileApp";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { initVFS } from "@/os/fs/vfs-init";
import { initApps } from "@/os/apps/registry-init";

// Initialize VFS and apps for tests
beforeEach(() => {
  initApps();
  initVFS();
  vfs.setUserRole('Guest');
});

describe("Mobile App Boot", () => {
  it("should boot mobile app and show launcher", async () => {
    render(
      <PlatformProvider initialPlatform="mobile">
        <AuthProvider>
          <MobileApp />
        </AuthProvider>
      </PlatformProvider>
    );

    // Wait for launcher to render
    await waitFor(() => {
      const header = screen.getByText(/Programs/i);
      expect(header).toBeInTheDocument();
    });
  });

  it("should display apps from Desktop folder", async () => {
    render(
      <PlatformProvider initialPlatform="mobile">
        <AuthProvider>
          <MobileApp />
        </AuthProvider>
      </PlatformProvider>
    );

    // Wait for apps to load
    await waitFor(() => {
      // Should show at least one app (from vfs-init)
      // Use exact text match to avoid matching "admin_help"
      const helpApp = screen.getByText('help');
      expect(helpApp).toBeInTheDocument();
    });
  });

  it("should open content item when clicked", async () => {
    render(
      <PlatformProvider initialPlatform="mobile">
        <AuthProvider>
          <MobileApp />
        </AuthProvider>
      </PlatformProvider>
    );

    // Wait for launcher
    await waitFor(() => {
      expect(screen.getByText(/Programs/i)).toBeInTheDocument();
    });

    // Find and click on help.txt (use exact text to avoid matching "admin_help")
    const helpApp = await screen.findByText('help');
    expect(helpApp).toBeInTheDocument();
    
    // Click on the app
    helpApp.click();

    // Should switch to viewer
    await waitFor(() => {
      // Viewer should show content
      const viewer = screen.getByText(/Birdmaid Help/i);
      expect(viewer).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
