import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Catalog states", () => {
  it("shows loading state while fetching games", () => {
    const pending = new Promise(() => undefined);
    vi.stubGlobal("fetch", vi.fn(() => pending as unknown as Promise<Response>));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no games", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      )
    );
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No games/i)).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("fail"))));
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Retry/i)).toBeInTheDocument();
  });
});
