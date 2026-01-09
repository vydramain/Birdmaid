import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin authoring", () => {
  it("allows creating a team", () => {
    render(
      <MemoryRouter initialEntries={["/admin/teams"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /Create team/i });
    expect(createButton).toBeInTheDocument();
  });

  it("allows editing game details", () => {
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Repository/i)).toBeInTheDocument();
    expect(screen.getByText(/Cover/i)).toBeInTheDocument();
  });
});
