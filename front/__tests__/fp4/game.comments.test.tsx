import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Game comments", () => {
  it("shows comments for published game (visible to all users)", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            status: "published",
            comments: [
              { id: "1", text: "Great game!", userLogin: "user1", createdAt: "2026-01-09T10:00:00Z" },
              { id: "2", text: "Love it!", userLogin: "user2", createdAt: "2026-01-09T11:00:00Z" },
            ],
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Great game!")).toBeInTheDocument();
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("Love it!")).toBeInTheDocument();
      expect(screen.getByText("user2")).toBeInTheDocument();
    });
  });

  it("allows authenticated user to post comment", async () => {
    localStorage.setItem("birdmaid_token", "valid-token");
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            status: "published",
            comments: [],
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "3",
            text: "New comment",
            userLogin: "testuser",
            createdAt: "2026-01-09T12:00:00Z",
          }),
      } as Response);
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText(/comment|write/i);
      commentInput.setAttribute("value", "New comment");

      const postButton = screen.getByRole("button", { name: /post|submit/i });
      postButton.click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/games/game123/comments"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});

