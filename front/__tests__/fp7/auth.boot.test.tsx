/**
 * FP7 Auth Boot Tests
 * 
 * Tests for boot scenarios:
 * 1. Boot guest: нет токена -> "Not logged in", нет Log Out, есть Log In
 * 2. Boot authed: есть токен, /api/auth/me=200 -> user виден, есть Log Out
 * 3. Boot 401: есть токен, /api/auth/me=401 -> токен очищен, guest state
 */

import { renderAppRoot, screen, waitFor, within } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth Boot", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Mock /api/auth/me - will decode token from localStorage
    // Can be overridden in individual tests if needed
    if (mockApi && typeof mockApi.authMe === 'function') {
      mockApi.authMe();
    }
  });

  it("1. Boot guest: нет токена -> 'Not logged in', нет Log Out, есть Log In", async () => {
    // No token in localStorage
    expect(localStorage.getItem("birdmaid_token")).toBeNull();
    // mockApi.authMe() already set up in beforeEach - will return 401 when no token

    const { container } = renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      const desktop = container.querySelector('[data-testid="desktop-shell"]') || 
                      container.querySelector('.desktop-background');
      expect(desktop).toBeTruthy();
    });

    // Check tray user icon shows "Not logged in"
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toBeTruthy();
      expect(userIcon).toHaveAttribute("title", "Not logged in");
    });

    // Check Start menu: should have Log In... enabled, Log Out... disabled
    // First, find Start button and click it
    const startButton = screen.getByTestId("start-button");
    expect(startButton).toBeTruthy();
    
    // Click Start button to open menu
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    // Wait for Start menu to appear
    await waitFor(() => {
      const startMenu = screen.getByTestId("start-menu");
      expect(startMenu).toBeTruthy();
    });

    // Check menu items within start-menu container
    const startMenu = screen.getByTestId("start-menu");
    const loginItem = within(startMenu).getByTestId("start-menu-item-login");
    const logoutItem = within(startMenu).getByTestId("start-menu-item-logout");

    // Log In... should be enabled
    expect(loginItem).toBeTruthy();
    expect(loginItem).not.toBeDisabled();
    expect(loginItem).toHaveTextContent("Log In...");

    // Log Out... should be disabled
    expect(logoutItem).toBeTruthy();
    expect(logoutItem).toBeDisabled();
    expect(logoutItem).toHaveTextContent("Log Out...");
  });

  it("2. Boot authed: есть токен, /api/auth/me=200 -> user виден, есть Log Out", async () => {
    // Set token in localStorage
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.test";
    localStorage.setItem("birdmaid_token", mockToken);
    // mockApi.authMe() already set up in beforeEach - will decode token from localStorage

    const { container } = renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      const desktop = container.querySelector('[data-testid="desktop-shell"]') || 
                      container.querySelector('.desktop-background');
      expect(desktop).toBeTruthy();
    });

    // Wait for /api/auth/me to be called and user to be loaded
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toHaveAttribute("title", expect.stringContaining("Logged in"));
    }, { timeout: 3000 });

    // Check tray user icon shows logged in status
    const userIcon = screen.getByTestId("tray-user-icon");
    expect(userIcon).toHaveAttribute("title", expect.stringContaining("testuser"));

    // Check Start menu: should have Log In... disabled, Log Out... enabled
    const startButton = screen.getByTestId("start-button");
    expect(startButton).toBeTruthy();
    
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    // Wait for Start menu to appear
    await waitFor(() => {
      const startMenu = screen.getByTestId("start-menu");
      expect(startMenu).toBeTruthy();
    });

    // Check menu items within start-menu container
    const startMenu = screen.getByTestId("start-menu");
    const loginItem = within(startMenu).getByTestId("start-menu-item-login");
    const logoutItem = within(startMenu).getByTestId("start-menu-item-logout");

    // Log In... should be disabled
    expect(loginItem).toBeTruthy();
    expect(loginItem).toBeDisabled();
    expect(loginItem).toHaveTextContent("Log In...");

    // Log Out... should be enabled
    expect(logoutItem).toBeTruthy();
    expect(logoutItem).not.toBeDisabled();
    expect(logoutItem).toHaveTextContent("Log Out...");
  });

  it("3. Boot 401: есть токен, /api/auth/me=401 -> токен очищен, guest state", async () => {
    // Set token in localStorage (invalid/expired - not a valid JWT format)
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJsb2dpbiI6InRlc3R1c2VyIiwicm9sZSI6Ikd1ZXN0In0.expired";
    localStorage.setItem("birdmaid_token", mockToken);
    expect(localStorage.getItem("birdmaid_token")).toBe(mockToken);
    // mockApi.authMe() will try to decode token, fail, and return 401

    const { container } = renderAppRoot({ platform: "desktop" });

    // Wait for desktop to render
    await waitFor(() => {
      const desktop = container.querySelector('[data-testid="desktop-shell"]') || 
                      container.querySelector('.desktop-background');
      expect(desktop).toBeTruthy();
    });

    // Wait for /api/auth/me to be called and token to be cleared
    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBeNull();
    }, { timeout: 3000 });

    // Check tray user icon shows "Not logged in"
    await waitFor(() => {
      const userIcon = screen.getByTestId("tray-user-icon");
      expect(userIcon).toHaveAttribute("title", "Not logged in");
    });

    // Check Start menu: should have Log In... enabled, Log Out... disabled (guest state)
    const startButton = screen.getByTestId("start-button");
    expect(startButton).toBeTruthy();
    
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(startButton);

    // Wait for Start menu to appear
    await waitFor(() => {
      const startMenu = screen.getByTestId("start-menu");
      expect(startMenu).toBeTruthy();
    });

    // Check menu items within start-menu container
    const startMenu = screen.getByTestId("start-menu");
    const loginItem = within(startMenu).getByTestId("start-menu-item-login");
    const logoutItem = within(startMenu).getByTestId("start-menu-item-logout");

    // Log In... should be enabled (guest state)
    expect(loginItem).toBeTruthy();
    expect(loginItem).not.toBeDisabled();
    expect(loginItem).toHaveTextContent("Log In...");

    // Log Out... should be disabled (guest state)
    expect(logoutItem).toBeTruthy();
    expect(logoutItem).toBeDisabled();
    expect(logoutItem).toHaveTextContent("Log Out...");
  });
});
