import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Password recovery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("requests recovery code and sends email", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Code sent" }),
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

    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    forgotPasswordLink.click();

    const emailInput = screen.getByLabelText(/email/i);
    emailInput.setAttribute("value", "user@example.com");

    const requestButton = screen.getByRole("button", { name: /send|request/i });
    requestButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/recovery/request"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("verifies recovery code and resets password", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Code sent" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            message: "Password reset",
            token: "jwt-token-123",
          }),
      } as Response);
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    const loginButton = screen.getByText(/Login/i);
    loginButton.click();

    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    forgotPasswordLink.click();

    // Request code
    const emailInput = screen.getByLabelText(/email/i);
    emailInput.setAttribute("value", "user@example.com");
    const requestButton = screen.getByRole("button", { name: /send|request/i });
    requestButton.click();

    await waitFor(() => {
      expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    });

    // Verify code
    const codeInput = screen.getByLabelText(/code/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    codeInput.setAttribute("value", "123456");
    newPasswordInput.setAttribute("value", "newpassword123");

    const verifyButton = screen.getByRole("button", { name: /verify|reset/i });
    verifyButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/recovery/verify"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
  });
});

