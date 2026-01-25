import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi } from "vitest";
import App from "../../src/App";

describe("Admin tags UI", () => {
  it("renders tag inputs and save action", async () => {
    // Mock authenticated SUPER ADMIN (needed for System tags)
    const fakeToken = `header.${btoa(JSON.stringify({
      userId: "admin-1",
      email: "admin@example.com",
      login: "admin",
      isSuperAdmin: true
    }))}.signature`;
    localStorage.setItem("birdmaid_token", fakeToken);

    vi.stubGlobal("fetch", vi.fn((url) => {
        if (url.toString().endsWith("/teams")) {
             return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ teams: [] })
             } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: "1",
            title: "Test Game",
            description_md: "Desc",
            repo_url: "",
            cover_url: "",
            status: "editing",
            tags_user: [],
            tags_system: [],
            teamId: "team-1"
          })
        } as Response);
    }));

    render(<App />, { initialEntries: ["/editor/games/1"] });

    expect(await screen.findByText(/User tags/i)).toBeInTheDocument();
    expect(await screen.findByText(/System tags/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Save tags/i })).toBeInTheDocument();
  });
});
