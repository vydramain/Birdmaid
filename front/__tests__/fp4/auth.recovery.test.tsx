import { fireEvent, screen, waitFor, within } from "@/test/utils";
import { renderShell } from "../../src/test/utils/render";
import { mockApi } from "@/test/mocks/mockApi";
import { makeUser } from "@/test/fixtures/user";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("Password recovery", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("requests recovery code and sends email", async () => {
    mockApi.authRecoveryRequest();
    mockApi.games([]);

    renderShell(<App />, { route: "/catalog" });

    // Find button that's NOT inside a modal (the main UI button)
    const loginButtons = await screen.findAllByRole("button", { name: /login/i });
    const loginButton = loginButtons.find(btn => {
      const modal = btn.closest('[role="dialog"], .win95-modal');
      return !modal;
    }) || loginButtons[0];
    fireEvent.click(loginButton);

    // Wait for modal and find forgot password link
    await waitFor(() => {
      expect(screen.getByText(/forgot|recovery/i)).toBeInTheDocument();
    });
    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    fireEvent.click(forgotPasswordLink);

    // Use within modal to avoid ambiguous selectors
    const modal = document.querySelector('[role="dialog"], .win95-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal as HTMLElement);

    const emailInput = modalScope.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });

    const requestButton = modalScope.getByRole("button", { name: /send code/i });
    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(modalScope.getByLabelText(/recovery code/i)).toBeInTheDocument();
    });
  });

  it("verifies recovery code and resets password", async () => {
    const mockUser = makeUser({ id: "user123", email: "user@example.com", login: "testuser" });
    mockApi.authRecoveryRequest();
    mockApi.authRecoveryVerify(mockUser, "jwt-token-123");
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
      expect(screen.getByText(/forgot|recovery/i)).toBeInTheDocument();
    });
    const forgotPasswordLink = screen.getByText(/forgot|recovery/i);
    fireEvent.click(forgotPasswordLink);

    // Use within modal to avoid ambiguous selectors
    const modal = document.querySelector('[role="dialog"], .win95-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal as HTMLElement);

    // Request code
    const emailInput = modalScope.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    
    const requestButton = modalScope.getByRole("button", { name: /send code/i });
    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(modalScope.getByLabelText(/recovery code/i)).toBeInTheDocument();
    });

    // Verify code
    const codeInput = modalScope.getByLabelText(/recovery code/i);
    const newPasswordInput = modalScope.getByLabelText(/new password/i);
    
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "newpassword123" } });

    const verifyButton = modalScope.getByRole("button", { name: /reset password/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    });
  });
});
