import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams info modal Make Leader button (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("hides 'Make Leader' button for current team leader", async () => {
    const currentUserId = "leader123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/teams/team123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: ["leader123", "member1"],
              memberLogins: ["leader", "alice"],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [{ id: "team123", name: "Test Team" }] }),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    // Mock current user as leader
    const mockToken = JSON.stringify({ userId: currentUserId });
    localStorage.setItem("birdmaid_token", mockToken);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

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
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/teams/team123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: ["leader123", "member1"],
              memberLogins: ["leader", "alice"],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [{ id: "team123", name: "Test Team" }] }),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    const mockToken = JSON.stringify({ userId: currentUserId });
    localStorage.setItem("birdmaid_token", mockToken);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

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
