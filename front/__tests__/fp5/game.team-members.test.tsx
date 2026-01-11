import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Game page team members display (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  it("displays team member logins (usernames) instead of user IDs", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            description_md: "Test description",
            team: {
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "teamleader",
              members: ["member1", "member2", "member3"],
              memberLogins: ["alice", "bob", "charlie"],
            },
            status: "published",
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

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
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            team: {
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "teamleader",
              members: [],
              memberLogins: [],
            },
            status: "published",
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Should display leader login
    expect(screen.getByText(/teamleader/i)).toBeInTheDocument();
    
    // Should not display leader ID
    expect(screen.queryByText(/leader123/i)).not.toBeInTheDocument();
  });
});
