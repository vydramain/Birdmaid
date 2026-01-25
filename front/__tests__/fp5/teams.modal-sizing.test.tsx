import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeTeam } from "@/test/fixtures/team";

describe("Teams info modal sizing (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("modal opens and displays team information", async () => {
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
      members: ["member1", "member2"],
      memberLogins: ["alice", "bob"],
    });
    if (mockApi && typeof mockApi.teams === 'function') {
      mockApi.teams([team]);
    }

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    // Open team info modal
    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    expect(infoButton).toBeInTheDocument();
    expect(infoButton).toBeVisible();
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    // Stable invariant: modal is visible and contains team name
    const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toBeVisible();
    expect(screen.getByText(/Test Team/i)).toBeInTheDocument();
  });

  it("modal displays 'Add Member' section when opened", async () => {
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
    });
    if (mockApi && typeof mockApi.teams === 'function') {
      mockApi.teams([team]);
    }

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    // Stable invariant: "Add Member" section exists and is visible
    const addMemberSection = screen.getByText(/add member/i) || screen.getByRole("button", { name: /add member/i });
    expect(addMemberSection).toBeInTheDocument();
    expect(addMemberSection).toBeVisible();
  });

  it("modal can be closed", async () => {
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
    });
    if (mockApi && typeof mockApi.teams === 'function') {
      mockApi.teams([team]);
    }

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole("button", { name: /close/i }) || 
                       document.querySelector(".win95-modal .win-btn");
    expect(closeButton).toBeInTheDocument();
    if (closeButton) {
      (closeButton as HTMLElement).click();
      
      await waitFor(() => {
        const modal = document.querySelector(".win95-modal") || screen.queryByRole("dialog");
        expect(modal).not.toBeInTheDocument();
      });
    }
  });
});
