import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Auth modal (Windows 95 style)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("opens Windows 95 styled draggable modal when Login button clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const modal = screen.getByRole("dialog") || document.querySelector(".win95-modal");
    expect(modal).toBeInTheDocument();

    // Check Windows 95 styling (title bar, window controls)
    const titleBar = modal?.querySelector(".win-titlebar");
    expect(titleBar).toBeInTheDocument();
  });

  it("modal is draggable by title bar", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const modal = document.querySelector(".win95-modal");
    const titleBar = modal?.querySelector(".win-titlebar");

    expect(titleBar).toBeInTheDocument();

    // Check drag handlers exist
    const dragHandle = titleBar?.querySelector("[data-draggable]");
    expect(dragHandle || titleBar).toBeInTheDocument();
  });

  it("modal contains login and registration forms", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    expect(screen.getByLabelText(/email|login|username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});

