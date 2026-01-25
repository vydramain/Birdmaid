import { renderAppRoot, screen } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";

describe("Teams Create Team button (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("displays button with text content", () => {
    renderAppRoot({ route: "/teams" });

    const createButton = screen.getByRole("button", { name: /create team/i });
    
    // Stable invariant: button exists, is visible, and has text
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeVisible();
    expect(createButton.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("button is enabled and clickable", () => {
    renderAppRoot({ route: "/teams" });

    const createButton = screen.getByRole("button", { name: /create team/i });
    
    // Stable invariant: button is enabled and interactive
    expect(createButton).not.toBeDisabled();
    expect(createButton).toBeVisible();
  });

  it("button uses Windows 95 styling classes", () => {
    renderAppRoot({ route: "/teams" });

    const createButton = screen.getByRole("button", { name: /create team/i });
    const buttonClasses = createButton.className;
    
    // Stable invariant: button has win95 styling class (win-btn from Win95Button component)
    // Win95Button component adds "win-btn" class
    expect(buttonClasses.includes("win-btn") || buttonClasses.includes("win95")).toBe(true);
  });
});
