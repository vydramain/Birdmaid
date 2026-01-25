import { renderShell, screen, waitFor, fireEvent } from "@/test/utils";
import { fetchMock } from "@/test/setup";
import { describe, it, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("User login", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.reset();
    // Default mocks
    fetchMock.register("GET", "/teams", () => fetchMock.json({ teams: [] }));
    fetchMock.register("GET", "/games", () => fetchMock.json([]));
  });

  it("logs in user with email and password", async () => {
    fetchMock.register("POST", "/auth/login", async (url, options) => {
      // Basic validation
      const body = JSON.parse(options?.body as string);
      if (body.identifier === "user@example.com" && body.password === "password123") {
        return fetchMock.json({
          user: { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false },
          token: "jwt-token-123",
        });
      }
      return fetchMock.json({ message: "Invalid credentials" }, 401);
    });

    renderShell(<App />, { route: "/catalog" });

    // Open modal
    const loginButton = await screen.findByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    const identifierInput = await screen.findByLabelText(/email|login|username/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(identifierInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit button
    const submitButton = screen.getByRole("button", { name: /login/i, hidden: true }); 
    // Note: modal might be separate, check semantics.
    // Usually "Login" button inside modal.
    // If multiple "Login" buttons exist (one in header, one in modal), we need to distinguish.
    // The header button is likely "Login" (text). The modal button is likely "Login" (text).
    // Better to target the modal one specifically or use within().
    // For now, let's assume the header one is replaced by "Logout" or we target by location.
    // Actually, simple click on "Login" text might work if the header one is not clickable anymore or hidden?
    // No, header is still there.
    
    // Let's use getByRole inside the modal if possible.
    // But since I can't see the modal structure easily, I'll rely on "Login" text in button.
    // The first one was clicked to open modal.
    // The second one submits.
    
    const buttons = screen.getAllByRole("button", { name: /login/i });
    const modalButton = buttons[buttons.length - 1]; // Assuming modal is rendered last
    fireEvent.click(modalButton);

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    });
  });

  it("logs in user with login (username) and password", async () => {
    fetchMock.register("POST", "/auth/login", () => 
      fetchMock.json({
        user: { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false },
        token: "jwt-token-123",
      })
    );

    renderShell(<App />, { route: "/catalog" });

    const loginButton = await screen.findByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    const identifierInput = await screen.findByLabelText(/email|login|username/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const buttons = screen.getAllByRole("button", { name: /login/i });
    const modalButton = buttons[buttons.length - 1];
    fireEvent.click(modalButton);

    await waitFor(() => {
      expect(localStorage.getItem("birdmaid_token")).toBe("jwt-token-123");
    });
  });
});
