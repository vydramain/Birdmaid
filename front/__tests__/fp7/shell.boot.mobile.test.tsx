/**
 * FP7 Shell Boot Mobile Test
 * 
 * Validates that ShellRoot determines Mobile on boot and fixes the mode for the session.
 */

import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Shell Boot Mobile", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Mock API endpoints
    if (mockApi && typeof mockApi.get === 'function') {
      mockApi.get('/jam/current', () => fetchMock.json(null));
    }
  });

  it("should determine Mobile on boot", async () => {
    renderAppRoot({ platform: "mobile" });

    // Wait for mobile to render
    await waitFor(() => {
      // MobileShell should be present (placeholder is acceptable)
      const mobileView = screen.queryByText(/Mobile/i) || 
                        screen.queryByText(/Coming Soon/i);
      expect(mobileView).toBeTruthy();
    });
  });

  it("should fix Mobile mode for the session (no resize switching)", async () => {
    renderAppRoot({ platform: "mobile" });

    // Verify mobile is rendered
    await waitFor(() => {
      const mobileView = screen.queryByText(/Mobile/i) || 
                        screen.queryByText(/Coming Soon/i);
      expect(mobileView).toBeTruthy();
    });

    // Simulate window resize (should NOT switch to desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920, // Desktop width
    });
    window.dispatchEvent(new Event('resize'));

    // Wait a bit to ensure no re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mobile should still be rendered (mode fixed for session)
    const mobileView = screen.queryByText(/Mobile/i) || 
                      screen.queryByText(/Coming Soon/i);
    expect(mobileView).toBeTruthy();
  });

  it("should render MobileShell stub", async () => {
    renderAppRoot({ platform: "mobile" });

    // Wait for mobile shell to render
    await waitFor(() => {
      // MobileShell should be present (black background or placeholder)
      const mobileView = screen.queryByText(/Mobile/i) || 
                        screen.queryByText(/Coming Soon/i);
      expect(mobileView).toBeTruthy();
    });
  });
});
