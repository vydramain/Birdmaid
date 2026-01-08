import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin status + remark", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "admin-token");
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("shows remark field when moving to editing", () => {
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Remark/i)).toBeInTheDocument();
  });
});
