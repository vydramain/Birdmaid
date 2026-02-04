/**
 * FP7 Auth Start Menu Tests
 * 
 * Tests for Start Menu auth items:
 * 4. Start menu: в guest есть пункт Log In..., в authed есть Log Out...
 */

import { renderAppRoot, screen, waitFor, within } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth Start Menu", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Mock /api/auth/me - will decode token from localStorage
    if (mockApi && typeof mockApi.authMe === 'function') {
      mockApi.authMe();
    }
  });

  it("4a. Start menu: в guest есть только пункт Log In...", async () => {
    // Test guest state
    expect(localStorage.getItem("birdmaid_token")).toBeNull();
    // mockApi.authMe() already set up in beforeEach - will return 401 when no token

    const { container } = renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      const desktop = container.querySelector('[data-testid="desktop-shell"]') || 
                      container.querySelector('.desktop-background');
      expect(desktop).toBeTruthy();
    });

    // Open Start menu
    const startButton = screen.getByTestId("start-button");
    expect(startButton).toBeTruthy();
    
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    // Wait for Start menu to appear
    await waitFor(() => {
      const startMenu = screen.getByTestId("start-menu");
      expect(startMenu).toBeTruthy();
    });

    // Check guest state: only Log In... exists, no Log Out
    const startMenu = screen.getByTestId("start-menu");
    const menuItem = within(startMenu).getByTestId("start-menu-item");
    expect(menuItem).toBeTruthy();
    expect(menuItem).not.toBeDisabled();
    expect(menuItem).toHaveTextContent("Log In...");
    expect(within(startMenu).queryByText("Log Out...")).toBeNull();
  });

  it("4b. Start menu: в authed есть только пункт Log Out...", async () => {
    // Test authed state
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);
    // mockApi.authMe() already set up in beforeEach - will decode token from localStorage

    renderAppRoot({ platform: "desktop" });

    // Wait for user to be loaded - AuthContext will bootstrap and call /api/auth/me
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      const title = userIcon.getAttribute("title");
      expect(title).toBeTruthy();
      expect(title).toContain("Logged in");
    }, { timeout: 5000 });

    // Open Start menu
    const startButton = screen.getByTestId("start-button");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    // Wait for Start menu to appear
    await waitFor(() => {
      const startMenu = screen.getByTestId("start-menu");
      expect(startMenu).toBeTruthy();
    });

    // Check authed state: only Log Out... exists, no Log In
    const startMenu = screen.getByTestId("start-menu");
    const menuItem = within(startMenu).getByTestId("start-menu-item");
    expect(menuItem).toBeTruthy();
    expect(menuItem).not.toBeDisabled();
    expect(menuItem).toHaveTextContent("Log Out...");
    expect(within(startMenu).queryByText("Log In...")).toBeNull();
  });
});
