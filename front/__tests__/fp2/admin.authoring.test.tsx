import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin authoring", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "admin-token");
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("allows creating a team", () => {
    render(
      <MemoryRouter initialEntries={["/admin/teams"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Create team/i })).toBeInTheDocument();
  });

  it("allows editing game details", () => {
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover/i)).toBeInTheDocument();
  });
});
