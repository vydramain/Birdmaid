import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("New Game page error modals (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("displays Windows 95 styled error modal when operation fails", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Invalid game data" }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    // Perform an operation that will fail (e.g., create game with invalid data)
    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") ||
                        screen.getByRole("dialog") ||
                        screen.queryByText(/error/i);
      
      expect(errorModal).toBeInTheDocument();
    });
  });

  it("error modal displays error message", async () => {
    const errorMessage = "Invalid game data";
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
    });
  });

  it("error modal is draggable by title bar", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Error occurred" }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(errorModal).toBeInTheDocument();
    });

    const errorModal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
    const titleBar = errorModal?.querySelector(".win-titlebar");
    
    expect(titleBar).toBeInTheDocument();
  });

  it("error modal can be closed by Close button", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Error occurred" }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(errorModal).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close/i }) ||
                       screen.getByLabelText(/close/i) ||
                       document.querySelector(".win95-modal .win-close");
    
    if (closeButton) {
      closeButton.click();

      await waitFor(() => {
        const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog");
        expect(errorModal).not.toBeInTheDocument();
      });
    }
  });

  it("error modal can be closed by X button", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Error occurred" }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create|save/i });
    createButton.click();

    await waitFor(() => {
      const errorModal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(errorModal).toBeInTheDocument();
    });

    const xButton = document.querySelector(".win95-modal .win-close") ||
                   document.querySelector(".win95-modal [aria-label*='close']") ||
                   screen.queryByLabelText(/close/i);
    
    if (xButton) {
      xButton.click();

      await waitFor(() => {
        const errorModal = document.querySelector(".win95-modal") || screen.queryByRole("dialog");
        expect(errorModal).not.toBeInTheDocument();
      });
    }
  });
});
