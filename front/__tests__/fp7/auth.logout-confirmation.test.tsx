/**
 * FP7 Auth Logout Confirmation Tests
 * 
 * Tests for Logout Confirmation flow:
 * 7. Click Log Out -> появляется confirm dialog; Confirm -> token wiped + guest
 */

import { renderAppRoot, screen, waitFor, within } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth Logout Confirmation", () => {
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

  it("7. Click Log Out -> появляется confirm dialog; Confirm -> token wiped + guest", async () => {
    // Set token in localStorage (authenticated state)
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);
    expect(localStorage.getItem("birdmaid_token")).toBe(mockToken);
    // mockApi.authMe() already set up in beforeEach - will decode token from localStorage

    const { container } = renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      const desktop = container.querySelector('[data-testid="desktop-shell"]') || 
                      container.querySelector('.desktop-background');
      expect(desktop).toBeTruthy();
    });

    // Wait for user to be loaded
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toHaveAttribute("title", expect.stringContaining("Logged in"));
    }, { timeout: 3000 });

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

    // Click Log Out... item
    const startMenu = screen.getByTestId("start-menu");
    const menuItem = within(startMenu).getByTestId("start-menu-item");
    expect(menuItem).toBeTruthy();
    expect(menuItem).not.toBeDisabled();
    expect(menuItem).toHaveTextContent("Log Out...");
    fireEvent.click(menuItem);

    // Wait for Logout Confirmation Dialog to appear
    await waitFor(() => {
      const logoutDialog = screen.getByTestId("logout-confirmation-dialog");
      expect(logoutDialog).toBeTruthy();
    }, { timeout: 3000 });

    // Check dialog content
    const logoutDialog = screen.getByTestId("logout-confirmation-dialog");
    
    // Check dialog message (text is visible in the dialog)
    const dialogMessage = logoutDialog.querySelector('.logout-dialog-message');
    expect(dialogMessage).toBeTruthy();
    if (dialogMessage) {
      expect(dialogMessage).toHaveTextContent(/log.*out/i);
    }

    // Check Yes button
    const yesButton = within(logoutDialog).getByTestId("logout-dialog-yes");
    expect(yesButton).toBeTruthy();
    expect(yesButton).toHaveTextContent(/yes/i);

    // Check No button
    const noButton = within(logoutDialog).getByTestId("logout-dialog-no");
    expect(noButton).toBeTruthy();
    expect(noButton).toHaveTextContent(/no/i);

    // Click Yes to confirm logout
    fireEvent.click(yesButton);

    // Wait for token to be wiped
    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBeNull();
    }, { timeout: 3000 });

    // Wait for dialog to close
    await waitFor(() => {
      const logoutDialogAfter = screen.queryByTestId("logout-confirmation-dialog");
      expect(logoutDialogAfter).toBeFalsy();
    }, { timeout: 3000 });

    // Check guest state: tray user icon shows "Not logged in"
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toHaveAttribute("title", "Not logged in");
    });

    // Check Start menu: only Log In... exists (guest)
    const startButton2 = screen.getByTestId("start-button");
    fireEvent.click(startButton2);

    await waitFor(() => {
      const startMenu2 = screen.getByTestId("start-menu");
      expect(startMenu2).toBeTruthy();
    });

    const startMenu2 = screen.getByTestId("start-menu");
    const menuItemAfterLogout = within(startMenu2).getByTestId("start-menu-item");
    expect(menuItemAfterLogout).toHaveTextContent("Log In...");
    expect(within(startMenu2).queryByText("Log Out...")).toBeNull();
  });
});
