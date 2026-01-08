import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin build limit settings", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "admin-token");
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("renders max build size controls", () => {
    render(
      <MemoryRouter initialEntries={["/admin/settings"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Max build size/i })).toBeInTheDocument();
  });
});
