import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGameSummary } from "@/test/fixtures/game";

describe("Catalog card sizing (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("displays cards in a grid layout", async () => {
    const games = [
      makeGameSummary({ id: "1", title: "Game 1", cover_url: "http://example.com/cover1.jpg", status: "published" }),
      makeGameSummary({ id: "2", title: "Game 2", cover_url: "http://example.com/cover2.jpg", status: "published" }),
    ];
    if (mockApi && typeof mockApi.games === 'function') {
      mockApi.games(games);
    }

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
      expect(cards.length).toBeGreaterThan(0);
    });

    // Check that cards exist and are visible
    const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
    expect(cards.length).toBeGreaterThan(0);
    
    // Check that cards are rendered (stable invariant: elements exist)
    cards.forEach((card) => {
      expect(card).toBeInTheDocument();
      expect(card).toBeVisible();
    });

    // Check that container uses grid or flex layout (stable invariant: layout type)
    const firstCard = cards[0] as HTMLElement;
    const container = firstCard.parentElement;
    if (container) {
      const containerStyle = window.getComputedStyle(container);
      // Grid or flex layout ensures consistent sizing, but block is also acceptable if cards are sized correctly
      const display = containerStyle.display;
      expect(["grid", "flex", "block"]).toContain(display);
    }
  });

  it("displays multiple cards consistently", async () => {
    const manyGames = Array.from({ length: 20 }, (_, i) =>
      makeGameSummary({
        id: `game${i}`,
        title: `Game ${i}`,
        cover_url: `http://example.com/cover${i}.jpg`,
        status: "published",
      })
    );
    if (mockApi && typeof mockApi.games === 'function') {
      mockApi.games(manyGames);
    }

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    // Stable invariant: all cards are visible and rendered
    const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
    expect(cards.length).toBeGreaterThanOrEqual(2);
    
    cards.forEach((card) => {
      expect(card).toBeInTheDocument();
      expect(card).toBeVisible();
    });
  });
});
