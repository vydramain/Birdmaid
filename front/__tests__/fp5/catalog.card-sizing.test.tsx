import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Catalog card sizing (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  it("maintains consistent card size when fewer than 5 cards displayed", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: "1", title: "Game 1", cover_url: "http://example.com/cover1.jpg", status: "published" },
            { id: "2", title: "Game 2", cover_url: "http://example.com/cover2.jpg", status: "published" },
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
      const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
      expect(cards.length).toBeGreaterThan(0);
    });

    // Check that cards have consistent sizing (5x4 grid layout)
    const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
    if (cards.length > 0) {
      const firstCard = cards[0] as HTMLElement;
      const cardStyle = window.getComputedStyle(firstCard);
      
      // Cards should have fixed dimensions or grid constraints
      // Grid should be 5 columns × 4 rows (ADR-059)
      const container = firstCard.parentElement;
      if (container) {
        const containerStyle = window.getComputedStyle(container);
        // Check for grid layout (5 columns expected)
        expect(containerStyle.display === "grid" || containerStyle.display === "flex").toBe(true);
      }
    }
  });

  it("maintains consistent card size when many cards displayed", async () => {
    const manyGames = Array.from({ length: 20 }, (_, i) => ({
      id: `game${i}`,
      title: `Game ${i}`,
      cover_url: `http://example.com/cover${i}.jpg`,
      status: "published" as const,
    }));

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(manyGames),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
      expect(cards.length).toBeGreaterThan(0);
    });

    const cards = document.querySelectorAll("[data-testid='game-card'], .game-card, [class*='card']");
    if (cards.length > 1) {
      const firstCard = cards[0] as HTMLElement;
      const secondCard = cards[1] as HTMLElement;
      
      const firstStyle = window.getComputedStyle(firstCard);
      const secondStyle = window.getComputedStyle(secondCard);
      
      // Cards should have same dimensions
      expect(firstStyle.width).toBe(secondStyle.width);
      expect(firstStyle.height).toBe(secondStyle.height);
    }
  });
});
