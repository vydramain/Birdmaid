import { fireEvent, screen, waitFor } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("Password recovery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)));
  });

  it("requests recovery code and sends email", async () => {
    const mockFetch = vi.fn((url) => {
        if (url.toString().includes("/auth/recovery/request")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Code sent" }) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    fireEvent.click(forgotPasswordLink);

    const emailInput = await screen.findByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });

    const requestButton = screen.getByRole("button", { name: /send|request/i });
    fireEvent.click(requestButton);

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
    const mockFetch = vi.fn((url) => {
        if (url.toString().includes("/auth/recovery/request")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Code sent" }) } as Response);
        }
        if (url.toString().includes("/auth/recovery/verify")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    message: "Password reset",
                    token: "jwt-token-123",
                }),
            } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    fireEvent.click(forgotPasswordLink);

    // Request code
    const emailInput = await screen.findByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    
    const requestButton = screen.getByRole("button", { name: /send|request/i });
    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    });

    // Verify code
    const codeInput = screen.getByLabelText(/code/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "newpassword123" } });

    const verifyButton = screen.getByRole("button", { name: /verify|reset/i });
    fireEvent.click(verifyButton);

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
