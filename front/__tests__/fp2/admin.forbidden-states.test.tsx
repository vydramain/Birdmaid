import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin forbidden UI states", () => {
  beforeEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("renders a forbidden banner when access is denied", () => {
    render(
      <MemoryRouter initialEntries={["/admin/games/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });
});
