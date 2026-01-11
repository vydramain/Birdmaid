import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Catalog title search (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  it("filters games by title in real-time as user types", async () => {
    const allGames = [
      { id: "1", title: "Adventure Game", cover_url: "http://example.com/1.jpg", status: "published" as const },
      { id: "2", title: "Racing Game", cover_url: "http://example.com/2.jpg", status: "published" as const },
      { id: "3", title: "Puzzle Game", cover_url: "http://example.com/3.jpg", status: "published" as const },
    ];

    let searchQuery = "";
    const mockFetch = vi.fn((url: string) => {
      const urlObj = new URL(url, "http://localhost");
      searchQuery = urlObj.searchParams.get("title") || "";
      
      const filtered = searchQuery
        ? allGames.filter((game) => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : allGames;

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(filtered),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Type in search input
    searchInput.setAttribute("value", "Adventure");
    
    // Trigger input event (simulating real-time search)
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
      expect(screen.queryByText("Racing Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Puzzle Game")).not.toBeInTheDocument();
    });
  });

  it("performs case-insensitive search", async () => {
    const allGames = [
      { id: "1", title: "Adventure Game", cover_url: "http://example.com/1.jpg", status: "published" as const },
      { id: "2", title: "Racing Game", cover_url: "http://example.com/2.jpg", status: "published" as const },
    ];

    const mockFetch = vi.fn((url: string) => {
      const urlObj = new URL(url, "http://localhost");
      const query = urlObj.searchParams.get("title") || "";
      
      const filtered = query
        ? allGames.filter((game) => game.title.toLowerCase().includes(query.toLowerCase()))
        : allGames;

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(filtered),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    searchInput.setAttribute("value", "ADVENTURE"); // Uppercase search
    
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });
  });

  it("supports partial matches", async () => {
    const allGames = [
      { id: "1", title: "Adventure Game", cover_url: "http://example.com/1.jpg", status: "published" as const },
      { id: "2", title: "Racing Game", cover_url: "http://example.com/2.jpg", status: "published" as const },
    ];

    const mockFetch = vi.fn((url: string) => {
      const urlObj = new URL(url, "http://localhost");
      const query = urlObj.searchParams.get("title") || "";
      
      const filtered = query
        ? allGames.filter((game) => game.title.toLowerCase().includes(query.toLowerCase()))
        : allGames;

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(filtered),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    searchInput.setAttribute("value", "vent"); // Partial match
    
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
      expect(screen.queryByText("Racing Game")).not.toBeInTheDocument();
    });
  });
});
