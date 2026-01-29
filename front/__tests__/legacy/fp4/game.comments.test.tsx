import { renderAppRoot, screen, waitFor, fireEvent, fetchMock } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGame } from "@/test/fixtures/game";
import { makeComment } from "@/test/fixtures/comment";
import { describe, it, beforeEach, expect } from "vitest";

describe("Game comments", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("shows comments for published game (visible to all users)", async () => {
    const gameId = "game123";
    
    mockApi.game(gameId, makeGame({
      id: gameId,
      title: "Test Game",
      status: "published",
      build_url: null,
      description_md: "Desc",
      team: { name: "Team A", members: [] }
    }));

    mockApi.comments(gameId, [
      makeComment({ id: "1", text: "Great game!", userLogin: "user1", createdAt: "2026-01-09T10:00:00Z", userId: "u1" }),
      makeComment({ id: "2", text: "Love it!", userLogin: "user2", createdAt: "2026-01-09T11:00:00Z", userId: "u2" }),
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
    // Create mock token for authenticated user
    const mockPayload = {
      userId: "u3",
      email: "testuser@example.com",
      login: "testuser",
      isSuperAdmin: false,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.sig`;
    localStorage.setItem("birdmaid_token", mockToken);
    
    const gameId = "game123";
    
    mockApi.game(gameId, makeGame({
      id: gameId,
      title: "Test Game",
      status: "published",
      build_url: null
    }));

    // Initial empty comments
    mockApi.comments(gameId, []);

    // Post comment mock - will update comments after POST
    let posted = false;
    mockApi.post(`/games/${gameId}/comments`, async () => {
      posted = true;
      // After post, update comments mock for next GET
      mockApi.comments(gameId, [
        makeComment({ id: "3", text: "New comment", userLogin: "testuser", createdAt: "2026-01-09T12:00:00Z", userId: "u3" })
      ]);
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
