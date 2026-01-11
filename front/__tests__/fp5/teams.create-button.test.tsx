import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams Create Team button (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [] }),
      } as Response)
    ));
  });

  it("displays button text in single line", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create team/i });
    
    // Button text should be in single line (no line breaks)
    const buttonText = createButton.textContent || "";
    expect(buttonText).not.toContain("\n");
    
    // Check computed style for line breaks
    const style = window.getComputedStyle(createButton);
    expect(style.whiteSpace).not.toBe("pre-wrap");
    expect(style.whiteSpace).not.toBe("pre");
  });

  it("button width is adaptive (fits content, not full width)", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create team/i });
    const style = window.getComputedStyle(createButton);
    
    // Button should not be full width
    expect(style.width).not.toBe("100%");
    
    // Should fit content (auto or specific width)
    const parent = createButton.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      // Button should not stretch to parent width
      expect(style.width).not.toBe(parentStyle.width);
    }
  });

  it("button uses Windows 95 styling", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", { name: /create team/i });
    const buttonClasses = createButton.className;
    
    // Check for Windows 95 button styling
    const hasWin95Styling =
      buttonClasses.includes("win95") ||
      buttonClasses.includes("Win95Button") ||
      createButton.closest(".win95-button") !== null ||
      createButton.closest("[class*='win95']") !== null;

    expect(hasWin95Styling).toBe(true);
  });
});
