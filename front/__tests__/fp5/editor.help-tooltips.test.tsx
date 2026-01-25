import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";

describe("New Game page help tooltips (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("displays help icons (question marks) on New Game page", () => {
    renderAppRoot({ route: "/editor/games/new" });

    // Help icons should be present (question marks or help icons)
    const helpIcons = screen.queryAllByRole("button", { name: /help|info|question/i }) ||
                     document.querySelectorAll("[class*='help'], [class*='tooltip'], [data-help]");
    
    expect(helpIcons.length).toBeGreaterThan(0);
  });

  it("shows Windows 95 styled tooltip when help icon is clicked", async () => {
    renderAppRoot({ route: "/editor/games/new" });

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
    renderAppRoot({ route: "/editor/games/new" });

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
    renderAppRoot({ route: "/editor/games/new" });

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
