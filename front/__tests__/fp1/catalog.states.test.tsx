import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi } from "vitest";
import App from "../../src/App";

describe("Catalog states", () => {
  it("shows loading state while fetching games", async () => {
    // Create a promise that never resolves to simulate loading
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    
    render(<App />, { initialEntries: ["/catalog"] });

    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no games", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
          if (url.toString().endsWith("/teams")) {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({ teams: [] })
              } as Response);
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          } as Response);
      })
    );
    
    render(<App />, { initialEntries: ["/catalog"] });

    expect(await screen.findByText(/No games/i)).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("fail"))));
    
    render(<App />, { initialEntries: ["/catalog"] });

    expect(await screen.findByText(/Retry/i)).toBeInTheDocument();
  });
});
