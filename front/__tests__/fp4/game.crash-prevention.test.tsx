import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/utils";
import { describe, it, expect, beforeEach } from "vitest";

describe("GamePage crash prevention", () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi.reset();
    mockApi.setupDefaults();
  });

  it("renders safely when comments endpoint returns invalid data", async () => {
    const gameId = "game123";
    
    // Mock game endpoint
    mockApi.game(gameId, {
      id: gameId,
      title: "Test Game",
      status: "published",
      build_url: null,
      description_md: "Test description",
    });

    // Mock comments endpoint returning invalid data (not an array)
    mockApi.register("GET", `/games/${gameId}/comments`, () => 
      fetchMock.json({
        comments: null, // Invalid: should be array
      })
    );

    renderAppRoot({ route: `/games/${gameId}` });

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // Comments section should show loading or empty state, not crash
    expect(() => screen.getByText(/comments/i)).not.toThrow();
  });

  it("renders safely when comments endpoint returns undefined", async () => {
    const gameId = "game456";
    
    mockApi.game(gameId, {
      id: gameId,
      title: "Test Game 2",
      status: "published",
    });

    // Mock comments endpoint returning undefined
    mockApi.register("GET", `/games/${gameId}/comments`, () => 
      fetchMock.json({}) // No comments field
    );

    renderAppRoot({ route: `/games/${gameId}` });

    await waitFor(() => {
      expect(screen.getByText("Test Game 2")).toBeInTheDocument();
    });

    // Should not crash
    expect(() => screen.getByText(/comments/i)).not.toThrow();
  });
});
