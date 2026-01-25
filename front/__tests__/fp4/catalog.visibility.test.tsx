import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGameSummary } from "@/test/fixtures/game";
import { describe, it, beforeEach, expect } from "vitest";

describe("Catalog visibility", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("shows only published games for unauthenticated users (backend filtering simulation)", async () => {
    // Simulate backend returning only published games for public
    mockApi.games([
      makeGameSummary({ id: "1", title: "Published Game", status: "published" })
    ]);

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Published Game")).toBeInTheDocument();
      expect(screen.queryByText("Editing Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Archived Game")).not.toBeInTheDocument();
    });
  });

  it("hides Editor and Settings tabs for unauthenticated users", () => {
    mockApi.games([]);
    
    renderAppRoot({ route: "/catalog" });

    // Look for links in the navigation
    // Note: In Shell/App, "New Game" (Editor) and "Settings" are conditionally rendered.
    expect(screen.queryByText(/New Game/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Settings/i)).not.toBeInTheDocument();
  });

  it("shows all games (including editing/archived for user's teams) for authenticated users", async () => {
    // Create mock token for authenticated user
    const mockPayload = {
      userId: "user1",
      email: "user@example.com",
      login: "testuser",
      isSuperAdmin: false,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.sig`;
    localStorage.setItem("birdmaid_token", mockToken);
    
    // Simulate backend returning user's games too
    mockApi.games([
      makeGameSummary({ id: "1", title: "Published Game", status: "published" }),
      makeGameSummary({ id: "2", title: "My Team's Game", status: "editing", teamId: "myteam" }),
    ]);

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Published Game")).toBeInTheDocument();
      expect(screen.getByText("My Team's Game")).toBeInTheDocument();
    });
  });
});

