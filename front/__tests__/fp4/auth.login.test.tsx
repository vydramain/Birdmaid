import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("User login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("logs in user with email and password", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false },
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

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const identifierInput = screen.getByLabelText(/email|login|username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    identifierInput.setAttribute("value", "user@example.com");
    passwordInput.setAttribute("value", "password123");

    const submitButton = screen.getByRole("button", { name: /login|sign in/i });
    submitButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
  });

  it("logs in user with login (username) and password", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false },
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

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const identifierInput = screen.getByLabelText(/email|login|username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    identifierInput.setAttribute("value", "testuser");
    passwordInput.setAttribute("value", "password123");

    const submitButton = screen.getByRole("button", { name: /login|sign in/i });
    submitButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
  });
});

