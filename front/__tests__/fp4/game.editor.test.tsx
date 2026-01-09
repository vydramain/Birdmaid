import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Game editor", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("allows team member to create game for their team", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            teamId: "team123",
            title: "New Game",
            status: "editing",
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/title/i);
    titleInput.setAttribute("value", "New Game");

    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/games"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("hides editor for unauthenticated users", () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    // Should redirect or show 404/unauthorized
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });
});

