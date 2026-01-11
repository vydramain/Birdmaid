import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Edit button on game page (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("displays Edit button for team members on game page", async () => {
    const currentUserId = "member123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/games/game123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game123",
              title: "Test Game",
              teamId: "team123",
              team: {
                id: "team123",
                name: "Test Team",
                leader: "leader123",
                leaderLogin: "leader",
                members: ["member123", "member456"],
                memberLogins: ["alice", "bob"],
              },
              status: "published",
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    localStorage.setItem("birdmaid_token", JSON.stringify({ userId: currentUserId }));

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should be visible for team members
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it("navigates to /editor/games/{gameId} when Edit button clicked", async () => {
    const currentUserId = "member123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/games/game123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game123",
              title: "Test Game",
              teamId: "team123",
              team: {
                id: "team123",
                name: "Test Team",
                leader: "leader123",
                leaderLogin: "leader",
                members: ["member123"],
                memberLogins: ["alice"],
              },
              status: "published",
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    localStorage.setItem("birdmaid_token", JSON.stringify({ userId: currentUserId }));

    const { container } = render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /edit/i });
    editButton.click();

    await waitFor(() => {
      // Should navigate to editor page
      expect(window.location.pathname).toBe("/editor/games/game123");
    });
  });

  it("hides Edit button for non-team members", async () => {
    const currentUserId = "otheruser123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/games/game123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game123",
              title: "Test Game",
              teamId: "team123",
              team: {
                id: "team123",
                name: "Test Team",
                leader: "leader123",
                leaderLogin: "leader",
                members: ["member123"],
                memberLogins: ["alice"],
              },
              status: "published",
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    localStorage.setItem("birdmaid_token", JSON.stringify({ userId: currentUserId }));

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should not be visible for non-team members
    const editButton = screen.queryByRole("button", { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it("shows Edit button for super admin", async () => {
    const currentUserId = "admin123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/games/game123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game123",
              title: "Test Game",
              teamId: "team123",
              team: {
                id: "team123",
                name: "Test Team",
                leader: "leader123",
                leaderLogin: "leader",
                members: ["member123"],
                memberLogins: ["alice"],
              },
              status: "published",
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    localStorage.setItem("birdmaid_token", JSON.stringify({ userId: currentUserId, isSuperAdmin: true }));

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Edit button should be visible for super admin
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it("uses Windows 95 styling for Edit button", async () => {
    const currentUserId = "member123";
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/games/game123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game123",
              title: "Test Game",
              teamId: "team123",
              team: {
                id: "team123",
                name: "Test Team",
                leader: "leader123",
                leaderLogin: "leader",
                members: ["member123"],
                memberLogins: ["alice"],
              },
              status: "published",
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    localStorage.setItem("birdmaid_token", JSON.stringify({ userId: currentUserId }));

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /edit/i });
    const buttonClasses = editButton.className;
    
    const hasWin95Styling =
      buttonClasses.includes("win95") ||
      buttonClasses.includes("Win95Button") ||
      editButton.closest(".win95-button") !== null ||
      editButton.closest("[class*='win95']") !== null;

    expect(hasWin95Styling).toBe(true);
  });
});
