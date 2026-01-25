import { fireEvent, screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, expect } from "vitest";
import App from "../../src/App";

describe("Game CSP/sandbox baseline", () => {
  it("requires iframe sandbox attributes and CSP hints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        const urlStr = url.toString();
        if (urlStr.endsWith("/comments")) {
             return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ comments: [] })
             } as Response);
        }
        return Promise.resolve({
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
        } as Response);
      })
    );

    render(<App />, { initialEntries: ["/games/game-1"] });

    fireEvent.click(await screen.findByRole("button", { name: /play/i }));
    const frame = await screen.findByTitle("Game");

    // Check for critical sandbox flags
    const sandbox = frame.getAttribute("sandbox");
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-forms");
    expect(sandbox).toContain("allow-pointer-lock");
    
    // Check allow attribute
    const allow = frame.getAttribute("allow");
    expect(allow).toContain("fullscreen");
    expect(allow).toContain("autoplay");
    expect(allow).toContain("gamepad");
  });
});
