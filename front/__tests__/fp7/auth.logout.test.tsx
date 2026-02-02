/**
 * FP7 Auth Logout Test
 * 
 * Validates that Logout works and clears token.
 */

import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth Logout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Mock API endpoints
    if (mockApi && typeof mockApi.get === 'function') {
      mockApi.get('/jam/current', () => fetchMock.json(null));
    }
    
    // Mock /api/auth/me - will decode token from localStorage
    if (mockApi && typeof mockApi.authMe === 'function') {
      mockApi.authMe();
    }
  });

  it("should clear token when logging out", async () => {
    
    // Mock authenticated user
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);

    expect(localStorage.getItem("birdmaid_token")).toBe(mockToken);

    renderAppRoot({ platform: "desktop" });

    // Open User Panel
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
    });

    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    // Wait for User Panel to open
    await waitFor(() => {
      const logoutButton = screen.getByTestId("user-logout");
      expect(logoutButton).toBeTruthy();
    });

    // Click Logout button
    const logoutButton = screen.getByTestId("user-logout");
    fireEvent.click(logoutButton);

    // Token should be cleared
    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBeNull();
    });
  });

  it("should close User Panel after logout", async () => {
    
    // Mock authenticated user
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    // Open User Panel
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
    });

    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    // Wait for User Panel to open
    await waitFor(() => {
      const logoutButton = screen.getByTestId("user-logout");
      expect(logoutButton).toBeTruthy();
    });

    // Click Logout button
    const logoutButton = screen.getByTestId("user-logout");
    fireEvent.click(logoutButton);

    // User Panel should be closed
    await waitFor(() => {
      const userPanel = screen.queryByTestId("user-panel-window");
      expect(userPanel).toBeFalsy();
    }, { timeout: 2000 });
  });

  it("should update User Icon status after logout", async () => {
    
    // Mock authenticated user
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    // Verify User Icon shows logged-in status
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
      expect(userIcon).toHaveAttribute("title", expect.stringContaining("Logged in"));
    });

    // Open User Panel and logout
    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    await waitFor(() => {
      const logoutButton = screen.getByTestId("user-logout");
      expect(logoutButton).toBeTruthy();
    });

    const logoutButton = screen.getByTestId("user-logout");
    fireEvent.click(logoutButton);

    // User Icon should show not-logged-in status
    await waitFor(() => {
      const userIconAfterLogout = screen.getByTestId("tray-user-icon");
      expect(userIconAfterLogout).toHaveAttribute("title", "Not logged in");
    }, { timeout: 2000 });
  });
});
