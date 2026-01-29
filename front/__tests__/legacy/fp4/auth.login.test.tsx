import { renderShell, screen, waitFor, fireEvent, fetchMock, within } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeUser } from "@/test/fixtures/user";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("User login", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("logs in user with email and password", async () => {
    const mockUser = makeUser({ id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false });
    
    // Mock login endpoint with validation
    mockApi.post("/auth/login", async (url, options) => {
      const body = JSON.parse(options?.body as string);
      if (body.identifier === "user@example.com" && body.password === "password123") {
        return fetchMock.json({
          user: mockUser,
          token: "jwt-token-123",
        });
      }
      return fetchMock.json({ message: "Invalid credentials" }, 401);
    });

    renderShell(<App />, { route: "/catalog" });

    // Open modal - find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    const identifierInput = await screen.findByLabelText(/email|login|username/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(identifierInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit button - use within modal to avoid ambiguous selector
    const modal = await waitFor(() => {
      const found = document.querySelector('[role="dialog"], .win95-modal') as HTMLElement;
      if (!found) throw new Error("Modal not found");
      return found;
    });
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal);
    const submitButtons = modalScope.getAllByRole("button", { name: /login/i });
    // Find the submit button (not the "Forgot Password" button)
    const submitButton = submitButtons.find(btn => !btn.textContent?.includes("Forgot")) || submitButtons[0];
    
    // Submit the form - trigger submit event on form, not just button click
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    }, { timeout: 3000 });
  });

  it("logs in user with login (username) and password", async () => {
    const mockUser = makeUser({ id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false });
    
    // Mock login endpoint - accept any credentials for this test
    mockApi.post("/auth/login", async (url, options) => {
      const body = JSON.parse(options?.body as string);
      if (body.identifier === "testuser" && body.password === "password123") {
        return fetchMock.json({
          user: mockUser,
          token: "jwt-token-123",
        });
      }
      return fetchMock.json({ message: "Invalid credentials" }, 401);
    });

    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    const identifierInput = await screen.findByLabelText(/email|login|username/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit button - use within modal to avoid ambiguous selector
    const modal = await waitFor(() => {
      const found = document.querySelector('[role="dialog"], .win95-modal') as HTMLElement;
      if (!found) throw new Error("Modal not found");
      return found;
    });
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal);
    const submitButtons = modalScope.getAllByRole("button", { name: /login/i });
    // Find the submit button (not the "Forgot Password" button)
    const submitButton = submitButtons.find(btn => !btn.textContent?.includes("Forgot")) || submitButtons[0];
    
    // Submit the form - trigger submit event on form, not just button click
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    }, { timeout: 3000 });
  });
});
