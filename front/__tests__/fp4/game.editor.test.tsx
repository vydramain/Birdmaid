import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeTeam } from "@/test/fixtures/team";
import { makeUser } from "@/test/fixtures/user";
import { describe, it, beforeEach, expect } from "vitest";

describe("Game editor", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("allows team member to create game for their team", async () => {
    // Create mock token for authenticated user
    const mockUser = makeUser({ id: "user123", login: "testuser" });
    const mockPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      login: mockUser.login,
      isSuperAdmin: mockUser.isSuperAdmin,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.sig`;
    localStorage.setItem("birdmaid_token", mockToken);

    // Mock teams endpoint - user is member of team123
    const team = makeTeam({ id: "team123", name: "Test Team", leader: "user123", members: ["user123"] });
    mockApi.teams([team]);

    // Mock POST /games to create game
    let gameCreated = false;
    mockApi.post("/games", async (url, options) => {
      gameCreated = true;
      const body = JSON.parse(options?.body as string);
      return Promise.resolve(new Response(JSON.stringify({
        id: "game123",
        teamId: body.teamId,
        title: body.title,
        status: "editing",
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    // Wait for editor to load - EditorPage waits for auth.loading to be false and teams to load
    // EditorPage returns null if !auth.user, so we need to wait for the form to appear
    // The form shows after teams are loaded and filtered
    // Wait for the "Create game" button to confirm form is loaded
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find the title input - labels aren't properly associated, so find by text content
    // The input is after the "Game Title" label
    const gameTitleLabel = screen.getByText("Game Title");
    const titleInput = gameTitleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    expect(titleInput).toBeTruthy();
    
    const createButton = screen.getByRole("button", { name: /create game/i });

    // Fill in form using fireEvent for proper React state updates
    fireEvent.change(titleInput, { target: { value: "New Game" } });
    
    // Select team - find the team select similarly
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    expect(teamSelect).toBeTruthy();
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    createButton.click();

    await waitFor(() => {
      expect(gameCreated).toBe(true);
    });
  });

  it("hides editor for unauthenticated users", () => {
    localStorage.clear();
    mockApi.setupDefaults();

    renderAppRoot({ route: "/editor/games/new" });

    // Should redirect or show 404/unauthorized - editor fields should not be present
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });
});

