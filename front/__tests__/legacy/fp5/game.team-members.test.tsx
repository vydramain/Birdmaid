import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGame } from "@/test/fixtures/game";
import { makeTeam } from "@/test/fixtures/team";

describe("Game page team members display (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("displays team member logins (usernames) instead of user IDs", async () => {
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "teamleader",
      members: ["member1", "member2", "member3"],
      memberLogins: ["alice", "bob", "charlie"],
    });
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      description_md: "Test description",
      team: team,
      status: "published",
    });
    mockApi.game("game123", game);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Check that member logins are displayed (not IDs)
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/charlie/i)).toBeInTheDocument();

    // Should not display user IDs
    expect(screen.queryByText(/member1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/member2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/member3/i)).not.toBeInTheDocument();
  });

  it("displays leader login instead of leader ID", async () => {
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "teamleader",
    });
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      team: team,
      status: "published",
    });
    mockApi.game("game123", game);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Should display leader login
    expect(screen.getByText(/teamleader/i)).toBeInTheDocument();
    
    // Should not display leader ID
    expect(screen.queryByText(/leader123/i)).not.toBeInTheDocument();
  });
});
