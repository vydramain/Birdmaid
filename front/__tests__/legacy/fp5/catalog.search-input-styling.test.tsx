import { renderAppRoot, screen } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";

describe("Catalog search input styling (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("search input exists and is visible", () => {
    renderAppRoot({ route: "/catalog" });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Stable invariant: input exists and is visible
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();
  });

  it("search input uses Windows 95 styling classes", () => {
    renderAppRoot({ route: "/catalog" });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Stable invariant: input has win95 styling class (win-inset from Win95Input component)
    // Win95Input component adds "win95-input win-inset" classes
    const inputClasses = searchInput.className;
    expect(inputClasses.includes("win-inset") || inputClasses.includes("win95-input")).toBe(true);
  });

  it("search input is enabled and interactive", () => {
    renderAppRoot({ route: "/catalog" });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Stable invariant: input is enabled and can receive focus
    expect(searchInput).not.toBeDisabled();
    expect(searchInput).toBeVisible();
  });
});
