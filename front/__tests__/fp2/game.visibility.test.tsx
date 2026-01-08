import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Game visibility (public)", () => {
  it("shows not-found state for editing/archived games", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "Game not available" }),
        } as Response)
      )
    );

    render(
      <MemoryRouter initialEntries={["/games/2"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Game unavailable/i)).toBeInTheDocument();
  });
});
