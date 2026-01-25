import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi } from "vitest";
import App from "../../src/App";

describe("Game visibility (public)", () => {
  it("shows not-found state for editing/archived games", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.toString().endsWith("/comments")) return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) } as Response);
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "Game not available" }),
        } as Response)
      })
    );

    render(<App />, { initialEntries: ["/games/2"] });

    expect(await screen.findByText(/Game unavailable/i)).toBeInTheDocument();
  });
});
