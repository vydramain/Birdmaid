import { fireEvent, screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("Admin status validation", () => {
  beforeEach(() => {
    // Mock authenticated SUPER ADMIN
    const fakeToken = `header.${btoa(JSON.stringify({
      userId: "admin-1",
      email: "admin@example.com",
      login: "admin",
      isSuperAdmin: true
    }))}.signature`;
    localStorage.setItem("birdmaid_token", fakeToken);
  });

  it("shows validation error when status update fails", async () => {
    vi.stubGlobal("fetch", vi.fn((url) => {
        if (url.toString().endsWith("/teams")) {
             return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ teams: [] })
             } as Response);
        }
        if (url.toString().includes("/games/1/status")) {
            return Promise.resolve({
                ok: false,
                status: 400,
                // apiClient throws on !ok, so we don't need body here strictly if we rely on throw
                // But let's provide error body
                json: () => Promise.resolve({ message: "Invalid status" }),
            } as Response);
        }
        // Initial game load
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: "1",
            title: "Test Game",
            description_md: "Desc",
            status: "editing",
            teamId: "team-1"
          })
        } as Response);
    }));

    render(<App />, { initialEntries: ["/editor/games/1"] });

    // Click update status
    const btn = await screen.findByRole("button", { name: /Force Status Change/i });
    fireEvent.click(btn);

    // Expect error modal
    // "Failed to update status" is the fallback message in App.tsx if error isn't parsed cleanly
    // apiClient throws "API Error: 400" or similar depending on implementation.
    // Let's expect the modal to appear.
    expect(await screen.findByText(/Error/i)).toBeInTheDocument();
  });
});
