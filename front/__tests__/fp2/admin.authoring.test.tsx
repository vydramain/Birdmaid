import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach } from "vitest";
import App from "../../src/App";

describe("Admin authoring", () => {
  beforeEach(() => {
    // Mock authenticated superadmin
    const fakeToken = `header.${btoa(JSON.stringify({
      userId: "admin-1",
      email: "admin@example.com",
      login: "admin",
      isSuperAdmin: true
    }))}.signature`;
    localStorage.setItem("birdmaid_token", fakeToken);
  });

  it("allows creating a team", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ teams: [] })
    } as Response)));

    render(<App />, { initialEntries: ["/teams"] });

    expect(await screen.findByText(/Create team/i)).toBeInTheDocument();
  });

  it("allows editing game details", async () => {
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
            repo_url: "http://repo",
            cover_url: "http://cover",
            status: "editing",
            tags_user: [],
            tags_system: [],
            teamId: "team-1"
          })
        } as Response);
    }));

    render(<App />, { initialEntries: ["/editor/games/1"] });

    expect(await screen.findByText(/Description/i)).toBeInTheDocument();
    expect(await screen.findByText(/Repository/i)).toBeInTheDocument();
    expect(await screen.findByText(/Cover/i)).toBeInTheDocument();
  });
});
