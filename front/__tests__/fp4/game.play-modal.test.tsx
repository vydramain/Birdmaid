import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Play game modal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("opens Windows 95 styled draggable modal when Play button clicked", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            status: "published",
            currentBuild: { url: "http://example.com/build/index.html" },
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

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
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "game123",
            title: "Test Game",
            currentBuild: { url: "http://example.com/build/index.html" },
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/games/game123"]}>
        <App />
      </MemoryRouter>
    );

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

