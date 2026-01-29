import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { describe, it, beforeEach, expect } from "vitest";

describe("Admin guard", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("redirects to home when access is denied (unauthenticated)", async () => {
    // Ensure no token
    localStorage.removeItem("birdmaid_token");

    renderAppRoot({ route: "/editor/games/1" });

    // In FP7, unauthenticated users are redirected to "/" which shows DesktopPage (ShellRoot)
    // Check that editor fields are NOT present
    expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    
    // Verify DesktopPage is rendered - it has a teal background (#008080)
    // We can check for the desktop container or WindowManager presence
    await waitFor(() => {
      // DesktopPage should be present (has desktop background or icons)
      const hasDesktop = document.body.innerHTML.includes('008080') || 
                         document.querySelector('[class*="desktop"]') ||
                         document.querySelector('[class*="window"]');
      expect(hasDesktop).toBeTruthy();
    });
  });
});
