import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";
import App from "../../src/App";

describe("Admin tags UI", () => {
  it("renders tag inputs and save action", () => {
    localStorage.setItem("adminToken", "admin-token");

    render(
      <MemoryRouter initialEntries={["/admin/games/demo"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/User tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/System tags/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save tags/i })).toBeInTheDocument();

    localStorage.removeItem("adminToken");
  });
});
