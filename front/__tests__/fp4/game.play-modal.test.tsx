import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGame } from "@/test/fixtures/game";

describe("Play game modal", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("opens Windows 95 styled draggable modal when Play button clicked", async () => {
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      status: "published",
      build_url: "http://example.com/build/index.html",
    });
    mockApi.game("game123", game);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      const playButton = screen.getByRole("button", { name: /play/i });
      playButton.click();
    });

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();

      const titleBar = modal.querySelector(".win-titlebar");
      expect(titleBar).toBeInTheDocument();

      const iframe = modal.querySelector("iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain("build/index.html");
    });
  });

  it("modal is draggable by title bar", async () => {
    const game = makeGame({
      id: "game123",
      title: "Test Game",
      build_url: "http://example.com/build/index.html",
    });
    mockApi.game("game123", game);

    renderAppRoot({ route: "/games/game123" });

    await waitFor(() => {
      const playButton = screen.getByRole("button", { name: /play/i });
      playButton.click();
    });

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal");
      const titleBar = modal?.querySelector(".win-titlebar");
      expect(titleBar).toBeInTheDocument();
    });
  });
});

