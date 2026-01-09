import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("User registration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("creates account with valid email, unique login, and password (min 6 chars)", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "user123", email: "test@example.com", login: "testuser" },
            token: "jwt-token-123",
          }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Open auth modal (click Login button)
    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    // Switch to registration mode
    const registerTab = screen.getByText(/Register/i);
    registerTab.click();

    // Fill form
    const emailInput = screen.getByLabelText(/email/i);
    const loginInput = screen.getByLabelText(/login|username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    emailInput.setAttribute("value", "test@example.com");
    loginInput.setAttribute("value", "testuser");
    passwordInput.setAttribute("value", "password123");

    // Submit
    const submitButton = screen.getByRole("button", { name: /register|submit/i });
    submitButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("test@example.com"),
        })
      );
    });

    // Check token stored
    expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
  });

  it("rejects registration with password shorter than 6 characters", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const registerTab = screen.getByText(/Register/i);
    registerTab.click();

    const passwordInput = screen.getByLabelText(/password/i);
    passwordInput.setAttribute("value", "12345");

    const submitButton = screen.getByRole("button", { name: /register|submit/i });
    submitButton.click();

    await waitFor(() => {
      expect(screen.getByText(/password.*6/i)).toBeInTheDocument();
    });
  });
});

