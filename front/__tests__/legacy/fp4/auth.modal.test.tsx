import { fireEvent, screen, within } from "@/test/utils";
import { renderShell } from "../../src/test/utils/render";
import { mockApi } from "@/test/mocks/mockApi";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("Auth modal (Windows 95 style)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("opens Windows 95 styled draggable modal when Login button clicked", async () => {
    mockApi.games([]);
    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    const modal = document.querySelector(".win95-modal");
    expect(modal).toBeInTheDocument();

    const titleBar = modal?.querySelector(".win-titlebar");
    expect(titleBar).toBeInTheDocument();
  });

  it("modal is draggable by title bar", async () => {
    mockApi.games([]);
    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    const modal = document.querySelector(".win95-modal");
    const titleBar = modal?.querySelector(".win-titlebar");

    expect(titleBar).toBeInTheDocument();
  });

  it("modal contains login and registration forms", async () => {
    mockApi.games([]);
    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    // Use within modal to avoid ambiguous selectors
    const modal = document.querySelector('[role="dialog"], .win95-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal as HTMLElement);

    expect(modalScope.getByLabelText(/email|login|username/i)).toBeInTheDocument();
    expect(modalScope.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
