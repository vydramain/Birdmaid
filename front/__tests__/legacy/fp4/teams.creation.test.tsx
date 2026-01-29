import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeUser } from "@/test/fixtures/user";
import { makeTeam } from "@/test/fixtures/team";

describe("Team creation", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("creates team with authenticated user as leader and member", async () => {
    const user = makeUser({ id: "user123", email: "user@example.com", login: "testuser" });
    // Set token with proper format for AuthContext
    const mockPayload = {
      userId: user.id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin || false,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.sig`;
    localStorage.setItem("birdmaid_token", mockToken);
    
    mockApi.teams([]);
    
    // Mock POST /teams - update teams list after creation
    mockApi.post("/teams", () => {
      // After POST, update GET /teams to return the new team
      mockApi.teams([{
        id: "team123",
        name: "Test Team",
        leader: "user123",
        leaderLogin: "testuser",
        members: ["user123"],
        memberLogins: ["testuser"],
      }]);
      return Promise.resolve(new Response(JSON.stringify({
        id: "team123",
        name: "Test Team",
        leader: "user123",
        members: ["user123"],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    });

    renderAppRoot({ route: "/teams" });

    // Wait for teams page to load (loading state to finish)
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Click "Create Team" button to open modal
    const createTeamButton = await screen.findByRole("button", { name: /create team/i });
    createTeamButton.click();

    // Wait for modal to open and show the input
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/team name|enter team name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/team name|enter team name/i);
    const createButton = screen.getByRole("button", { name: /^create$/i });

    // Fill in form using fireEvent for proper React state updates
    fireEvent.change(nameInput, { target: { value: "Test Team" } });
    createButton.click();

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });
  });
});

