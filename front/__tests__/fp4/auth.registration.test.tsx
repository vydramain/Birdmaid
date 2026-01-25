import { fireEvent, screen, waitFor, within } from "@/test/utils";
import { renderShell } from "../../src/test/utils/render";
import { mockApi } from "@/test/mocks/mockApi";
import { makeUser } from "@/test/fixtures/user";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("User registration", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("creates account with valid email, unique login, and password (min 6 chars)", async () => {
    const mockUser = makeUser({ id: "user123", email: "test@example.com", login: "testuser" });
    mockApi.authRegister(mockUser, "jwt-token-123");
    mockApi.games([]);

    renderShell(<App />, { route: "/catalog" });

    // Open auth modal - find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    // Wait for modal to open and switch to registration mode
    await waitFor(() => {
      expect(screen.getByText(/Register/i)).toBeInTheDocument();
    });
    const registerTab = screen.getByText(/Register/i);
    fireEvent.click(registerTab);

    // Fill form - use within modal to avoid ambiguous selectors
    const modal = document.querySelector('[role="dialog"], .win95-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal as HTMLElement);

    const emailInput = modalScope.getByLabelText(/email/i);
    const loginInput = modalScope.getByLabelText(/username/i);
    const passwordInput = modalScope.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(loginInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit
    // Submit - find submit button (type="submit") not the tab
    const submitButtons = modalScope.getAllByRole("button", { name: /register/i });
    const submitButton = submitButtons.find(btn => btn.getAttribute("type") === "submit") || submitButtons[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    });
  });

  it("rejects registration with password shorter than 6 characters", async () => {
    mockApi.games([]);
    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Register/i)).toBeInTheDocument();
    });
    const registerTab = screen.getByText(/Register/i);
    fireEvent.click(registerTab);

    const modal = document.querySelector('[role="dialog"], .win95-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal as HTMLElement);

    const passwordInput = modalScope.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: "12345" } });

    // Submit - find submit button (type="submit") not the tab
    const submitButtons = modalScope.getAllByRole("button", { name: /register/i });
    const submitButton = submitButtons.find(btn => btn.getAttribute("type") === "submit") || submitButtons[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(modalScope.getByText(/password.*6/i)).toBeInTheDocument();
    });
  });
});
