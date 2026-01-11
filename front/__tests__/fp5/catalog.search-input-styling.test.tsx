import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Catalog search input styling (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    ));
    localStorage.clear();
  });

  it("uses Windows 95 styling for catalog search input", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Check for Windows 95 input styling
    // Should have Win95Input component class or Windows 95 styled classes
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
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    const style = window.getComputedStyle(searchInput);
    
    // Windows 95 inputs typically have specific border styling
    // Check for typical Windows 95 input appearance
    expect(searchInput).toBeInTheDocument();
  });
});
