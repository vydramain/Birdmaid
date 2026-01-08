import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin publish validation", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "admin-token");
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("shows validation guidance for missing required fields", () => {
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Publish requires cover, description, and build/i)).toBeInTheDocument();
  });
});
