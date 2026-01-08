import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";

describe("Admin guard", () => {
  it("renders forbidden state for admin routes without token", () => {
    render(
      <MemoryRouter initialEntries={["/admin/teams"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Forbidden/i)).toBeInTheDocument();
  });
});
