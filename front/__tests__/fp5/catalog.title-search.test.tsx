import { renderShell, screen, waitFor, fireEvent } from "@/test/utils";
import { fetchMock } from "@/test/setup";
import App from "../../src/App";

describe("Catalog title search (FP5)", () => {
  const allGames = [
    { id: "1", title: "Adventure Game", cover_url: "http://example.com/1.jpg", status: "published" as const },
    { id: "2", title: "Racing Game", cover_url: "http://example.com/2.jpg", status: "published" as const },
    { id: "3", title: "Puzzle Game", cover_url: "http://example.com/3.jpg", status: "published" as const },
  ];

  beforeEach(() => {
    localStorage.clear();
    fetchMock.reset();
    
    // Setup dynamic mock for games search
    fetchMock.register("GET", "games", (url) => {
      // Use a dummy base for relative URLs if needed, though fetch receives full URL usually
      // fetchMock passes full URL string.
      const urlObj = new URL(url);
      const searchQuery = urlObj.searchParams.get("title") || "";
      
      const filtered = searchQuery
        ? allGames.filter((game) => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : allGames;

      return fetchMock.json(filtered);
    });

    // Mock teams (required for catalog load)
    fetchMock.register("GET", "/teams", () => fetchMock.json({ teams: [] }));
  });

  it("filters games by title in real-time as user types", async () => {
    renderShell(<App />, { route: "/catalog" });

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
    renderShell(<App />, { route: "/catalog" });

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
    renderShell(<App />, { route: "/catalog" });

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
