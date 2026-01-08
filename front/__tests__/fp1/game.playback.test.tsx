import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Game playback", () => {
  it("renders play iframe when build is available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game-1",
              title: "Demo",
              description_md: "Demo",
              repo_url: "https://example.com/repo",
              cover_url: "https://example.com/cover.png",
              status: "published",
              build_url: "https://example.com/build/index.html",
            }),
        } as Response)
      )
    );
    render(
      <MemoryRouter initialEntries={["/games/1"]}>
        <App />
      </MemoryRouter>
    );

    const playButton = await screen.findByText(/Play/i);
    fireEvent.click(playButton);
    expect(screen.getByTitle(/Game build/i)).toBeInTheDocument();
  });

  it("shows fallback when iframe fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game-1",
              title: "Demo",
              description_md: "Demo",
              repo_url: "https://example.com/repo",
              cover_url: "https://example.com/cover.png",
              status: "published",
              build_url: null,
            }),
        } as Response)
      )
    );
    render(
      <MemoryRouter initialEntries={["/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Unable to load build/i)).toBeInTheDocument();
  });
});
