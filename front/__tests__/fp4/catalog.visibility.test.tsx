import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Catalog visibility", () => {
  it("shows only published games for unauthenticated users", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: "1", title: "Published Game", status: "published" },
            { id: "2", title: "Editing Game", status: "editing" },
            { id: "3", title: "Archived Game", status: "archived" },
          ]),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Published Game")).toBeInTheDocument();
      expect(screen.queryByText("Editing Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Archived Game")).not.toBeInTheDocument();
    });
  });

  it("hides Editor and Settings tabs for unauthenticated users", () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Editor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Settings/i)).not.toBeInTheDocument();
  });

  it("shows all games (including editing/archived for user's teams) for authenticated users", async () => {
    localStorage.setItem("birdmaid_token", "valid-token");
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: "1", title: "Published Game", status: "published" },
            { id: "2", title: "My Team's Game", status: "editing", teamId: "myteam" },
          ]),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Published Game")).toBeInTheDocument();
      expect(screen.getByText("My Team's Game")).toBeInTheDocument();
    });
  });
});

