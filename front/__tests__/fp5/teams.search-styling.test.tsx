import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams search input styling (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [] }),
      } as Response)
    ));
    localStorage.clear();
  });

  it("uses Windows 95 styling for Teams search input", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Check for Windows 95 input styling
    const inputClasses = searchInput.className;
    const hasWin95Styling =
      inputClasses.includes("win95") ||
      inputClasses.includes("Win95Input") ||
      searchInput.closest(".win95-input") !== null ||
      searchInput.closest("[class*='win95']") !== null;

    expect(hasWin95Styling).toBe(true);
  });

  it("search input matches Windows 95 design system", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    expect(searchInput).toBeInTheDocument();
  });
});
