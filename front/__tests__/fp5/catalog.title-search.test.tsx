import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGameSummary } from "@/test/fixtures/game";

describe("Catalog title search (FP5)", () => {
  const allGames = [
    makeGameSummary({ id: "1", title: "Adventure Game", cover_url: "http://example.com/1.jpg", status: "published" }),
    makeGameSummary({ id: "2", title: "Racing Game", cover_url: "http://example.com/2.jpg", status: "published" }),
    makeGameSummary({ id: "3", title: "Puzzle Game", cover_url: "http://example.com/3.jpg", status: "published" }),
  ];

  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Setup dynamic mock for games search with query param support
    mockApi.get("/games", (url, options, params) => {
      // Extract query params from URL
      let searchQuery = "";
      try {
        const urlObj = new URL(url);
        searchQuery = urlObj.searchParams.get("title") || "";
      } catch {
        // If URL parsing fails, try to extract from url string
        const match = url.match(/[?&]title=([^&]*)/);
        if (match) searchQuery = decodeURIComponent(match[1]);
      }
      
      const filtered = searchQuery
        ? allGames.filter((game) => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : allGames;

      return Promise.resolve(new Response(JSON.stringify(filtered), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    });
  });

  it("filters games by title in real-time as user types", async () => {
    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search by title/i);
    
    // Type in search input using fireEvent
    fireEvent.change(searchInput, { target: { value: "Adventure" } });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
      expect(screen.queryByText("Racing Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Puzzle Game")).not.toBeInTheDocument();
    });
  });

  it("performs case-insensitive search", async () => {
    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: "ADVENTURE" } });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });
  });

  it("supports partial matches", async () => {
    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: "vent" } });

    await waitFor(() => {
      expect(screen.getByText("Adventure Game")).toBeInTheDocument();
      expect(screen.queryByText("Racing Game")).not.toBeInTheDocument();
    });
  });
});
