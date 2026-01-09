import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Team creation", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("creates team with authenticated user as leader and member", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "user123", email: "user@example.com", login: "testuser" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "team123",
            name: "Test Team",
            leader: "user123",
            members: ["user123"],
          }),
      } as Response);
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText(/team name/i);
    const createButton = screen.getByRole("button", { name: /create.*team/i });

    nameInput.setAttribute("value", "Test Team");
    createButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/teams"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("valid-token"),
          }),
        })
      );
    });

    expect(await screen.findByText("Test Team")).toBeInTheDocument();
  });
});

