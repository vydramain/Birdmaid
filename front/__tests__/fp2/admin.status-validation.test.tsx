import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Admin status validation", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "admin-token");
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("shows validation error when status update fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: "Invalid status" }),
        } as Response)
      )
    );
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Update status/i }));
    expect(await screen.findByText(/Invalid status/i)).toBeInTheDocument();
  });
});
