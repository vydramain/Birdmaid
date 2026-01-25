import { fireEvent, screen, waitFor } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("User registration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)));
  });

  it("creates account with valid email, unique login, and password (min 6 chars)", async () => {
    const mockFetch = vi.fn((url) => {
        if (url.toString().includes("/auth/register")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: "user123", email: "test@example.com", login: "testuser" },
                    token: "jwt-token-123",
                }),
            } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<App />, { initialEntries: ["/catalog"] });

    // Open auth modal
    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    // Switch to registration mode
    const registerTab = screen.getByText(/Register/i);
    fireEvent.click(registerTab);

    // Fill form
    const emailInput = await screen.findByLabelText(/email/i);
    const loginInput = await screen.findByLabelText(/login|username/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(loginInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit
    const submitButton = screen.getByRole("button", { name: /register|submit/i });
    fireEvent.click(submitButton);

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
    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    const registerTab = screen.getByText(/Register/i);
    fireEvent.click(registerTab);

    const passwordInput = await screen.findByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: "12345" } });

    const submitButton = screen.getByRole("button", { name: /register|submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password.*6/i)).toBeInTheDocument();
    });
  });
});
