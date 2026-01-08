import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, vi } from "vitest";
import App from "../../src/App";

describe("Game CSP/sandbox baseline", () => {
  it("requires iframe sandbox attributes and CSP hints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "game-1",
              title: "Cyber Odyssey",
              description_md: "Desc",
              repo_url: "https://example.com/repo",
              cover_url: "https://example.com/cover.png",
              build_url: "https://example.com/build/index.html",
            }),
        } as Response)
      )
    );

    render(
      <MemoryRouter initialEntries={["/games/game-1"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: /play/i }));
    const frame = await screen.findByTitle(/Game build/i);

    expect(frame).toHaveAttribute("sandbox", "allow-scripts allow-forms allow-pointer-lock");
    expect(frame).toHaveAttribute("allow", "fullscreen; autoplay; gamepad");
  });
});
