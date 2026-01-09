import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Team member management", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("allows team leader to add members", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "team123",
            name: "Test Team",
            leader: "leader123",
            members: ["leader123"],
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "team123",
            name: "Test Team",
            leader: "leader123",
            members: ["leader123", "newmember123"],
          }),
      } as Response);
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams/team123"]}>
        <App />
      </MemoryRouter>
    );

    const userIdInput = screen.getByPlaceholderText(/user.*id|add.*member/i);
    const addButton = screen.getByRole("button", { name: /add.*member/i });

    userIdInput.setAttribute("value", "newmember123");
    addButton.click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/teams/team123/members"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});

