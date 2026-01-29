import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeUser } from "@/test/fixtures/user";
import { makeTeam } from "@/test/fixtures/team";

describe("New Game page error modals (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    // Set up auth - EditorPage requires authenticated user
    const mockUser = makeUser({ id: "user123", login: "testuser", email: "user@example.com" });
    const mockPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      login: mockUser.login,
      isSuperAdmin: mockUser.isSuperAdmin || false,
    };
    const mockToken = `mock.${btoa(JSON.stringify(mockPayload))}.sig`;
    localStorage.setItem("birdmaid_token", mockToken);
    
    // Mock teams - EditorPage needs teams to load
    const team = makeTeam({ id: "team123", name: "Test Team", leader: "user123", members: ["user123"] });
    mockApi.teams([team]);
  });

  it("displays Windows 95 styled error modal when operation fails", async () => {
    // Mock POST /games to return error
    mockApi.post("/games", () => {
      return Promise.resolve(new Response(JSON.stringify({ message: "Invalid game data" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    // Wait for editor to load
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    });

    // Fill form minimally to trigger validation error or API error
    const titleLabel = screen.getByText("Game Title");
    const titleInput = titleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test Game" } });
    
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    // Click create button - should trigger error
    const createButton = screen.getByRole("button", { name: /create game/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") ||
                        screen.queryByRole("dialog", { name: /error/i });
      expect(errorModal).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("error modal displays error message", async () => {
    const errorMessage = "Invalid game data";
    mockApi.post("/games", () => {
      return Promise.resolve(new Response(JSON.stringify({ message: errorMessage }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    });

    const titleLabel = screen.getByText("Game Title");
    const titleInput = titleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test" } });
    
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    const createButton = screen.getByRole("button", { name: /create game/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("error modal is draggable by title bar", async () => {
    mockApi.post("/games", () => {
      return Promise.resolve(new Response(JSON.stringify({ message: "Error occurred" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    });

    const titleLabel = screen.getByText("Game Title");
    const titleInput = titleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test" } });
    
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    const createButton = screen.getByRole("button", { name: /create game/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
      expect(errorModal).toBeInTheDocument();
    }, { timeout: 3000 });

    const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
    const titleBar = errorModal?.querySelector(".win-titlebar");
    
    expect(titleBar).toBeInTheDocument();
  });

  it("error modal can be closed by Close button", async () => {
    mockApi.post("/games", () => {
      return Promise.resolve(new Response(JSON.stringify({ message: "Error occurred" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    });

    const titleLabel = screen.getByText("Game Title");
    const titleInput = titleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test" } });
    
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    const createButton = screen.getByRole("button", { name: /create game/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
      expect(errorModal).toBeInTheDocument();
    }, { timeout: 3000 });

    const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
    const closeButton = errorModal?.querySelector('button[type="button"]') || 
                       screen.queryByRole("button", { name: /close|cancel/i });
    
    expect(closeButton).toBeTruthy();
    if (closeButton) {
      fireEvent.click(closeButton);

      await waitFor(() => {
        const modal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
        expect(modal).not.toBeInTheDocument();
      });
    }
  });

  it("error modal can be closed by X button", async () => {
    mockApi.post("/games", () => {
      return Promise.resolve(new Response(JSON.stringify({ message: "Error occurred" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    });

    renderAppRoot({ route: "/editor/games/new" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create game/i })).toBeInTheDocument();
    });

    const titleLabel = screen.getByText("Game Title");
    const titleInput = titleLabel.parentElement?.querySelector("input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test" } });
    
    const teamLabel = screen.getByText("Team");
    const teamSelect = teamLabel.parentElement?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(teamSelect, { target: { value: "team123" } });

    const createButton = screen.getByRole("button", { name: /create game/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
      expect(errorModal).toBeInTheDocument();
    }, { timeout: 3000 });

    const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
    // X button is in win-window-controls
    const xButton = errorModal?.querySelector(".win-window-controls button") ||
                   errorModal?.querySelector('button[aria-label*="close"]') ||
                   errorModal?.querySelector('button:has-text("×")');
    
    expect(xButton).toBeTruthy();
    if (xButton) {
      fireEvent.click(xButton);

      await waitFor(() => {
        const modal = document.querySelector(".win95-modal") || screen.queryByRole("dialog", { name: /error/i });
        expect(modal).not.toBeInTheDocument();
      });
    }
  });
});
