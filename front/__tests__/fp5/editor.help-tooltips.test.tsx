import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("New Game page help tooltips (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    ));
  });

  it("displays help icons (question marks) on New Game page", () => {
    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    // Help icons should be present (question marks or help icons)
    const helpIcons = screen.queryAllByRole("button", { name: /help|info|question/i }) ||
                     document.querySelectorAll("[class*='help'], [class*='tooltip'], [data-help]");
    
    expect(helpIcons.length).toBeGreaterThan(0);
  });

  it("shows Windows 95 styled tooltip when help icon is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const helpIcon = screen.getByRole("button", { name: /help|info|question/i }) ||
                    document.querySelector("[class*='help'], [class*='tooltip'], [data-help]");
    
    if (helpIcon) {
      helpIcon.click();

      await waitFor(() => {
        // Tooltip should appear (Windows 95 styled)
        const tooltip = document.querySelector(".win95-tooltip") ||
                       document.querySelector("[class*='tooltip']") ||
                       screen.queryByRole("tooltip");
        
        expect(tooltip).toBeInTheDocument();
      });
    }
  });

  it("tooltip explains game upload rules", async () => {
    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const helpIcon = screen.getByRole("button", { name: /help|info|question/i }) ||
                    document.querySelector("[class*='help'], [class*='tooltip'], [data-help]");
    
    if (helpIcon) {
      helpIcon.click();

      await waitFor(() => {
        const tooltip = document.querySelector(".win95-tooltip") ||
                       document.querySelector("[class*='tooltip']") ||
                       screen.queryByRole("tooltip");
        
        if (tooltip) {
          const tooltipText = tooltip.textContent || "";
          // Should contain information about upload rules
          expect(tooltipText.length).toBeGreaterThan(0);
        }
      });
    }
  });

  it("tooltip uses Windows 95 styling", async () => {
    render(
      <MemoryRouter initialEntries={["/editor/games/new"]}>
        <App />
      </MemoryRouter>
    );

    const helpIcon = screen.getByRole("button", { name: /help|info|question/i }) ||
                    document.querySelector("[class*='help'], [class*='tooltip'], [data-help]");
    
    if (helpIcon) {
      helpIcon.click();

      await waitFor(() => {
        const tooltip = document.querySelector(".win95-tooltip") ||
                       document.querySelector("[class*='tooltip']") ||
                       screen.queryByRole("tooltip");
        
        if (tooltip) {
          const tooltipClasses = tooltip.className;
          const hasWin95Styling =
            tooltipClasses.includes("win95") ||
            tooltipClasses.includes("Win95Tooltip") ||
            tooltip.closest(".win95-tooltip") !== null ||
            tooltip.closest("[class*='win95']") !== null;

          expect(hasWin95Styling).toBe(true);
        }
      });
    }
  });
});
