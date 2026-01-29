import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGame } from "@/test/fixtures/game";
import { makeTeam } from "@/test/fixtures/team";

describe("Edit button on game page (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("displays Edit button for team members on game page", async () => {
    const currentUserId = "member123";
    const currentUserLogin = "alice";
    // GamePage checks game.team.members.includes(auth.user.login)
    // So team.members must contain logins, not IDs
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      teamId: "team123",
      team: {
        name: "Test Team",
        members: [currentUserLogin], // Use login, not ID
      },
      status: "published",
    });
    mockApi.game("game123", game);
    mockApi.comments("game123", []);

    // Token must include login for Edit button check
    const mockPayload = { userId: currentUserId, login: currentUserLogin, email: "alice@example.com" };
    localStorage.setItem("birdmaid_token", `mock.${btoa(JSON.stringify(mockPayload))}.sig`);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should be visible for team members
    const editButton = await screen.findByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it("navigates to /editor/games/{gameId} when Edit button clicked", async () => {
    const currentUserId = "member123";
    const currentUserLogin = "alice";
    // GamePage checks game.team.members.includes(auth.user.login)
    // So team.members must contain logins, not IDs
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      teamId: "team123",
      team: {
        name: "Test Team",
        members: [currentUserLogin], // Use login, not ID
      },
      status: "published",
    });
    mockApi.game("game123", game);
    mockApi.comments("game123", []);

    const mockPayload = { userId: currentUserId, login: currentUserLogin, email: "alice@example.com" };
    localStorage.setItem("birdmaid_token", `mock.${btoa(JSON.stringify(mockPayload))}.sig`);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const editButton = await screen.findByRole("button", { name: /edit/i });
    editButton.click();

    // In test environment, Link navigation might not update window.location.pathname
    // Instead, check that the Link has the correct href
    const link = editButton.closest("a");
    expect(link).toHaveAttribute("href", "/editor/games/game123");
  });

  it("hides Edit button for non-team members", async () => {
    const currentUserId = "otheruser123";
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
      members: ["member123"],
      memberLogins: ["alice"],
    });
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      teamId: "team123",
      team: team,
      status: "published",
    });
    mockApi.game("game123", game);
    mockApi.comments("game123", []);

    const mockPayload = { userId: currentUserId };
    localStorage.setItem("birdmaid_token", `mock.${btoa(JSON.stringify(mockPayload))}.sig`);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should not be visible for non-team members
    const editButton = screen.queryByRole("button", { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it("shows Edit button for super admin", async () => {
    const currentUserId = "admin123";
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
      members: ["member123"],
      memberLogins: ["alice"],
    });
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      teamId: "team123",
      team: team,
      status: "published",
    });
    mockApi.game("game123", game);
    mockApi.comments("game123", []);

    const mockPayload = { userId: currentUserId, isSuperAdmin: true };
    localStorage.setItem("birdmaid_token", `mock.${btoa(JSON.stringify(mockPayload))}.sig`);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should be visible for super admin
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it("uses Windows 95 styling for Edit button", async () => {
    const currentUserId = "member123";
    const currentUserLogin = "alice";
    // GamePage checks game.team.members.includes(auth.user.login)
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      teamId: "team123",
      team: {
        name: "Test Team",
        members: [currentUserLogin], // Use login, not ID
      },
      status: "published",
    });
    mockApi.game("game123", game);
    mockApi.comments("game123", []);

    const mockPayload = { userId: currentUserId, login: currentUserLogin, email: "alice@example.com" };
    localStorage.setItem("birdmaid_token", `mock.${btoa(JSON.stringify(mockPayload))}.sig`);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const editButton = await screen.findByRole("button", { name: /edit/i });
    const buttonClasses = editButton.className;
    
    // Win95Button adds "win-btn" class
    const hasWin95Styling =
      buttonClasses.includes("win-btn") ||
      buttonClasses.includes("win95") ||
      editButton.closest(".win-btn") !== null ||
      editButton.closest("[class*='win']") !== null;

    expect(hasWin95Styling).toBe(true);
  });
});
