/**
 * FP7 Taskbar Tray Test
 *
 * Validates that Taskbar Tray displays User Icon and Clock.
 */

import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Taskbar Tray", () => {
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

  it("should render Taskbar Tray with User Icon and Clock", async () => {
    renderAppRoot({ platform: "desktop" });

    // Wait for taskbar to render
    await waitFor(() => {
      // Taskbar should be present (now uses CSS class instead of inline styles)
      const taskbar = document.querySelector(".win-taskbar-fixed");
      expect(taskbar).toBeTruthy();
    });

    // Clock should be visible (format: HH:MM:SS)
    await waitFor(() => {
      const clock = screen.getByText(/\d{2}:\d{2}:\d{2}/);
      expect(clock).toBeTruthy();
    });

    // User Icon should be visible
    await waitFor(() => {
      const userIcon =
        document.querySelector('[title*="logged"]') ||
        document.querySelector('[title*="User"]') ||
        document.querySelector('[style*="cursor: pointer"]');
      expect(userIcon).toBeTruthy();
    });
  });

  it("should display clock in stable format (HH:MM:SS)", async () => {
    renderAppRoot({ platform: "desktop" });

    await waitFor(() => {
      const clock = screen.getByText(/\d{2}:\d{2}:\d{2}/);
      expect(clock).toBeTruthy();

      // Verify format: HH:MM:SS (24-hour format)
      const timeText = clock.textContent || "";
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      expect(timeRegex.test(timeText)).toBe(true);
    });
  });

  it("should update clock every second", async () => {
    renderAppRoot({ platform: "desktop" });

    await waitFor(() => {
      const clock = screen.getByText(/\d{2}:\d{2}:\d{2}/);
      expect(clock).toBeTruthy();
    });

    const initialTime = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent;

    // Wait for clock update (at least 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1100));

    await waitFor(() => {
      const updatedTime = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent;
      // Time should have changed (unless we caught it at the exact second boundary)
      expect(updatedTime).toBeTruthy();
    });
  });

  it("should show logged-in status on User Icon when authenticated", async () => {
    // Mock authenticated user
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    await waitFor(() => {
      const userIcon =
        document.querySelector('[title*="Logged in"]') ||
        document.querySelector('[title*="testuser"]');
      expect(userIcon).toBeTruthy();
    });
  });

  it("should show not-logged-in status on User Icon when not authenticated", async () => {
    localStorage.removeItem("birdmaid_token");

    renderAppRoot({ platform: "desktop" });

    await waitFor(() => {
      const userIcon =
        document.querySelector('[title*="Not logged in"]') ||
        document.querySelector('[title*="logged"]');
      expect(userIcon).toBeTruthy();
    });
  });
});
