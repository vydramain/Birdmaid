import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/utils";
import { describe, it, beforeEach, expect } from "vitest";

describe("Game comments", () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi.reset();
    mockApi.setupDefaults();
  });

  it("shows comments for published game (visible to all users)", async () => {
    const gameId = "game123";
    
    mockApi.game(gameId, {
      id: gameId,
      title: "Test Game",
      status: "published",
      build_url: null,
      description_md: "Desc",
      team: { name: "Team A", members: [] }
    });

    mockApi.comments(gameId, [
      { id: "1", text: "Great game!", userLogin: "user1", createdAt: "2026-01-09T10:00:00Z", userId: "u1" },
      { id: "2", text: "Love it!", userLogin: "user2", createdAt: "2026-01-09T11:00:00Z", userId: "u2" },
    ]);

    renderAppRoot({ route: `/games/${gameId}` });

    await waitFor(() => {
      expect(screen.getByText("Great game!")).toBeInTheDocument();
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("Love it!")).toBeInTheDocument();
      expect(screen.getByText("user2")).toBeInTheDocument();
    });
  });

  it("allows authenticated user to post comment", async () => {
    localStorage.setItem("birdmaid_token", "valid-token");
    const gameId = "game123";
    
    mockApi.game(gameId, {
      id: gameId,
      title: "Test Game",
      status: "published",
      build_url: null
    });

    // Initial empty comments
    mockApi.comments(gameId, []);

    // Post comment mock - will update comments after POST
    let posted = false;
    mockApi.register("POST", `/games/${gameId}/comments`, async () => {
      posted = true;
      // After post, update comments mock for next GET
      mockApi.comments(gameId, [{
        id: "3",
        text: "New comment",
        userLogin: "testuser",
        createdAt: "2026-01-09T12:00:00Z",
        userId: "u3"
      }]);
      return fetchMock.json({}, 201);
    });

    renderAppRoot({ route: `/games/${gameId}` });

    // Wait for page to load
    await waitFor(() => screen.getByText("Test Game"));

    const commentInput = screen.getByPlaceholderText(/write a comment/i);
    fireEvent.change(commentInput, { target: { value: "New comment" } });

    const postButton = screen.getByRole("button", { name: /post comment/i });
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(posted).toBe(true);
      expect(screen.getByText("New comment")).toBeInTheDocument();
    });
  });
});
