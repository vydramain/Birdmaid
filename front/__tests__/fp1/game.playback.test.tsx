import { fireEvent, screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, expect } from "vitest";
import App from "../../src/App";

describe("Game playback", () => {
  it("renders play iframe when build is available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.toString().endsWith("/comments")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) } as Response);
        return Promise.resolve({
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
      })
    );
    render(<App />, { initialEntries: ["/games/1"] });

    const playButton = await screen.findByRole("button", { name: /Play/i });
    expect(playButton).toBeEnabled();
    fireEvent.click(playButton);
    
    expect(await screen.findByTitle("Game")).toBeInTheDocument();
  });

  it("disables play button when build is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.toString().endsWith("/comments")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) } as Response);
        return Promise.resolve({
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
      })
    );
    render(<App />, { initialEntries: ["/games/1"] });

    const playButton = await screen.findByRole("button", { name: /Play/i });
    expect(playButton).toBeDisabled();
  });
});
