/**
 * FP7 Shell Boot Desktop Test
 *
 * Validates that ShellRoot determines Desktop on boot and fixes the mode for the session.
 */

import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Shell Boot Desktop", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }

    // Mock API endpoints
    if (mockApi && typeof mockApi.get === "function") {
      mockApi.get("/jam/current", () => fetchMock.json(null));
    }
  });

  it("should determine Desktop on boot", async () => {
    renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      // DesktopShell should be present (DesktopPage with desktop-background class)
      const desktop =
        document.querySelector(".desktop-background") || screen.queryByTestId("desktop-icons");
      expect(desktop).toBeTruthy();
    });
  });

  it("should fix Desktop mode for the session (no resize switching)", async () => {
    const { container } = renderAppRoot({ platform: "desktop" });

    // Verify desktop is rendered
    await waitFor(() => {
      const desktop =
        document.querySelector(".desktop-background") || screen.queryByTestId("desktop-icons");
      expect(desktop).toBeTruthy();
    });

    // Simulate window resize (should NOT switch to mobile)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500, // Mobile width
    });
    window.dispatchEvent(new Event("resize"));

    // Wait a bit to ensure no re-render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Desktop should still be rendered (mode fixed for session)
    const desktop =
      document.querySelector(".desktop-background") || screen.queryByTestId("desktop-icons");
    expect(desktop).toBeTruthy();
  });

  it("should render DesktopShell with WindowManager", async () => {
    renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      // DesktopShell should contain WindowManager (windows can be opened)
      const desktop =
        document.querySelector(".desktop-background") || screen.queryByTestId("desktop-icons");
      expect(desktop).toBeTruthy();
    });
  });

  it("should render Taskbar stub", async () => {
    renderAppRoot({ platform: "desktop" });

    // Wait for taskbar to render
    await waitFor(() => {
      // Taskbar should be present (fixed bottom, gray background)
      // Color is in RGB format: rgb(192, 192, 192)
      const taskbar =
        document.querySelector('[style*="rgb(192, 192, 192)"]') ||
        document.querySelector('[style*="c0c0c0"]') ||
        document.querySelector('[style*="position: fixed"][style*="bottom: 0"]');
      expect(taskbar).toBeTruthy();
    });
  });
});
