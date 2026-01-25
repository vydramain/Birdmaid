import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { fetchMock } from "@/test/setup";

describe("Admin publish validation", () => {
  beforeEach(() => {
    fetchMock.reset();
    // Create a mock JWT token (base64 encoded JSON payload)
    // Format: header.payload.signature (we only need valid payload)
    const mockPayload = {
      userId: "admin123",
      email: "admin@example.com",
      login: "admin",
      isSuperAdmin: true,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.signature`;
    localStorage.setItem("birdmaid_token", mockToken);
    
    // Mock teams endpoint (required by EditorPage)
    fetchMock.register("GET", "/teams", () => 
      fetchMock.json({ teams: [] })
    );
    // Mock game endpoint
    fetchMock.register("GET", /\/games\/1$/, () => 
      fetchMock.json({
        id: "1",
        title: "Test Game",
        status: "editing",
        description_md: "",
        cover_url: "",
        build_url: null,
      })
    );
  });

  afterEach(() => {
    localStorage.removeItem("birdmaid_token");
  });

  it("shows validation guidance for missing required fields", async () => {
    // Use renderAppRoot which already provides Router - don't wrap App with MemoryRouter
    // Route changed from /admin/games/1 to /editor/games/1 in FP7
    renderAppRoot({ route: "/editor/games/1" });

    // EditorPage requires auth, so wait for it to load
    // The publish button should be disabled when required fields are missing
    await waitFor(() => {
      const publishButton = screen.getByRole("button", { name: /publish/i });
      expect(publishButton).toBeDisabled();
    });
  });
});
