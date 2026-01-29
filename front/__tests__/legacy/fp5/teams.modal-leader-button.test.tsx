import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeTeam } from "@/test/fixtures/team";
import { describe, it, beforeEach, expect, vi } from "vitest";

describe("Teams info modal Make Leader button (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("hides 'Make Leader' button for current team leader", async () => {
    const currentUserId = "leader123";
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
      members: ["leader123", "member1"],
      memberLogins: ["leader", "alice"],
    });
    mockApi.teams([team]);

    // Mock current user as leader
    const mockToken = JSON.stringify({ userId: currentUserId });
    localStorage.setItem("birdmaid_token", mockToken);

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

    // "Make Leader" button should not be shown for the leader
    const makeLeaderButtons = screen.queryAllByRole("button", { name: /make leader/i });
    
    // Check that leader's row does not have "Make Leader" button
    // If buttons exist, they should only be for non-leader members
    makeLeaderButtons.forEach((button) => {
      const row = button.closest("tr") || button.closest("div");
      const rowText = row?.textContent || "";
      // Should not be in the leader's row
      expect(rowText).not.toContain("leader");
    });
  });

  it("shows 'Make Leader' button for non-leader members when current user is leader", async () => {
    const currentUserId = "leader123";
    const team = makeTeam({
      id: "team123",
      name: "Test Team",
      leader: "leader123",
      leaderLogin: "leader",
      members: ["leader123", "member1"],
      memberLogins: ["leader", "alice"],
    });
    mockApi.teams([team]);

    // Mock current user as leader
    const mockToken = JSON.stringify({ userId: currentUserId });
    localStorage.setItem("birdmaid_token", mockToken);

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

    // "Make Leader" button should exist for non-leader members
    const makeLeaderButtons = screen.queryAllByRole("button", { name: /make leader/i });
    
    // Should have at least one "Make Leader" button for non-leader members
    expect(makeLeaderButtons.length).toBeGreaterThan(0);
  });
});
