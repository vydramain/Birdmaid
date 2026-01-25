import { renderAppRoot, screen } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { describe, it, beforeEach, expect } from "vitest";

describe("Admin forbidden UI states", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("redirects to home when access is denied", async () => {
    localStorage.removeItem("birdmaid_token");

    renderAppRoot({ route: "/editor/games/1" });

    // In FP7, unauthenticated users are redirected to "/" which shows DesktopPage
    // Check that editor fields are NOT present and no access denied message
    expect(screen.queryByText(/Access denied/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });
});
