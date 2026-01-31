/**
 * FP7 Auth User Panel Test
 * 
 * Validates that User Panel opens as a window and displays user information.
 */

import { renderAppRoot, screen, waitFor, fireEvent } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth User Panel", () => {
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
  });

  it("should open User Panel window when clicking User Icon", async () => {
    
    // Mock authenticated user
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    // Find and click User Icon
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
    });

    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    // Wait for User Panel window to open
    await waitFor(() => {
      const userPanel = screen.getByTestId("user-panel-window");
      expect(userPanel).toBeTruthy();
    });
  });

  it("should display username and role in User Panel", async () => {
    
    // Mock authenticated user with role
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ik9yZ2FuaXplciJ9.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    // Open User Panel
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
    });

    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    // Verify user information is displayed
    await waitFor(() => {
      const username = screen.getByText(/testuser/i);
      expect(username).toBeTruthy();
    });

    await waitFor(() => {
      const role = screen.getByText(/Organizer/i) || screen.getByText(/Guest/i) || screen.getByText(/Participant/i);
      expect(role).toBeTruthy();
    });
  });

  it("should close User Panel window", async () => {
    
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
      const userPanel = screen.getByTestId("user-panel-window");
      expect(userPanel).toBeTruthy();
    });

    // Find User Panel window container (parent of user-panel-window)
    const userPanel = screen.getByTestId("user-panel-window");
    const windowContainer = userPanel.closest('.win-window-base') || userPanel.closest('[class*="win-window"]');
    
    // Find close button within the User Panel window (scoped search)
    await waitFor(() => {
      const closeButtons = screen.getAllByRole('button', { name: /close window/i });
      // Find the one that's in the User Panel window
      const userPanelCloseButton = closeButtons.find(btn => {
        const btnWindow = btn.closest('.win-window-base') || btn.closest('[class*="win-window"]');
        return btnWindow === windowContainer;
      });
      expect(userPanelCloseButton).toBeTruthy();
    });
    
    const closeButtons = screen.getAllByRole('button', { name: /close window/i });
    const userPanelCloseButton = closeButtons.find(btn => {
      const btnWindow = btn.closest('.win-window-base') || btn.closest('[class*="win-window"]');
      return btnWindow === windowContainer;
    });
    
    if (userPanelCloseButton) {
      fireEvent.click(userPanelCloseButton);
    }

    // User Panel should be closed
    // Wait for window to be removed from DOM
    await waitFor(() => {
      const userPanel = screen.queryByTestId("user-panel-window");
      expect(userPanel).toBeNull();
    }, { timeout: 2000 });
  });

  it("should show Management Functions button for Organizer", async () => {
    
    // Mock authenticated user with Organizer role
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ik9yZ2FuaXplciJ9.test";
    localStorage.setItem("birdmaid_token", mockToken);

    renderAppRoot({ platform: "desktop" });

    // Open User Panel
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
    });

    const userIcon = screen.getByTestId("tray-user-icon");
    fireEvent.click(userIcon);

    // Wait for Management Functions button
    await waitFor(() => {
      const managementButton = screen.getByText(/Management Functions/i);
      expect(managementButton).toBeTruthy();
    });
  });

  it("should NOT show Management Functions button for Guest", async () => {
    
    // Mock authenticated user with Guest role
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
      const userPanel = screen.getByTestId("user-panel-window");
      expect(userPanel).toBeTruthy();
    });

    // Management Functions button should NOT be present
    const managementButton = screen.queryByText(/Management Functions/i);
    expect(managementButton).toBeFalsy();
  });
});
