/**
 * FP7 Auth Login Window Tests
 * 
 * Tests for Login Window flow:
 * 5. Click Log In -> открывается Win95 Login window
 * 6. Click Telegram... -> открывается Browser/IE window (проверяем появление окна типа Browser и что ему передан URL)
 */

import { renderAppRoot, screen, waitFor, within } from "@/test/utils";
import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auth Login Window", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }

    // Mock /api/auth/me to return 401 (no auth)
    if (mockApi && typeof mockApi.get === 'function') {
      mockApi.get('/api/auth/me', () => {
        return fetchMock.json({ message: 'Unauthorized' }, { status: 401 });
      });
    }
  });

  it("5. Click Log In -> открывается Win95 Login window", async () => {
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

    // Click Log In... item
    const startMenu = screen.getByTestId("start-menu");
    const loginItem = within(startMenu).getByTestId("start-menu-item-login");
    expect(loginItem).toBeTruthy();
    fireEvent.click(loginItem);

    // Wait for Login Window to open
    await waitFor(() => {
      const loginWindow = screen.getByTestId("login-window");
      expect(loginWindow).toBeTruthy();
    }, { timeout: 3000 });

    // Check Login Window content
    const loginWindow = screen.getByTestId("login-window");
    
    // Check title
    const title = within(loginWindow).getByTestId("login-window-title");
    expect(title).toBeTruthy();
    expect(title).toHaveTextContent("Welcome to Windows");

    // Check Telegram button
    const telegramButton = within(loginWindow).getByTestId("login-window-telegram-button");
    expect(telegramButton).toBeTruthy();
    expect(telegramButton).toHaveTextContent("Telegram...");

    // Check Cancel button
    const cancelButton = within(loginWindow).getByTestId("login-window-cancel-button");
    expect(cancelButton).toBeTruthy();
    expect(cancelButton).toHaveTextContent("Cancel");
  });

  it("6. Click Telegram... -> открывается Browser/IE window (проверяем появление окна типа Browser и что ему передан URL)", async () => {
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

    // Click Log In... item
    const startMenu = screen.getByTestId("start-menu");
    const loginItem = within(startMenu).getByTestId("start-menu-item-login");
    fireEvent.click(loginItem);

    // Wait for Login Window to open
    await waitFor(() => {
      const loginWindow = screen.getByTestId("login-window");
      expect(loginWindow).toBeTruthy();
    }, { timeout: 3000 });

    // Click Telegram... button
    const loginWindow = screen.getByTestId("login-window");
    const telegramButton = within(loginWindow).getByTestId("login-window-telegram-button");
    expect(telegramButton).toBeTruthy();
    fireEvent.click(telegramButton);

    // Wait for IE window to open
    await waitFor(() => {
      const ieWindow = screen.getByTestId("ie-window");
      expect(ieWindow).toBeTruthy();
    }, { timeout: 3000 });

    // Check IE window content
    const ieWindow = screen.getByTestId("ie-window");
    
    // Check that IE window has iframe with Telegram URL
    const iframe = within(ieWindow).getByTestId("ie-window-iframe");
    expect(iframe).toBeTruthy();
    expect(iframe).toHaveAttribute("src", expect.stringContaining("oauth.telegram.org"));
    expect(iframe).toHaveAttribute("src", expect.stringContaining("bot_id"));
    expect(iframe).toHaveAttribute("src", expect.stringContaining("origin"));

    // Check window title (should be "Internet Explorer" or similar)
    const windowFrame = container.querySelector(`[data-testid="window-${ieWindow.closest('[data-testid^="window-"]')?.getAttribute('data-testid')?.replace('window-', '') || ''}"]`);
    // Alternative: check by window title text
    const windowTitle = screen.getByText(/Internet Explorer/i);
    expect(windowTitle).toBeTruthy();
  });
});
