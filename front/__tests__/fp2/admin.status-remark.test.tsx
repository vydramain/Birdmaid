import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach } from "vitest";
import App from "../../src/App";

describe("Admin status + remark", () => {
  beforeEach(() => {
    const fakeToken = `header.${btoa(JSON.stringify({
      userId: "admin-1",
      email: "admin@example.com",
      login: "admin",
      isSuperAdmin: true
    }))}.signature`;
    localStorage.setItem("birdmaid_token", fakeToken);
  });

  it("shows remark field for superadmin", async () => {
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
            status: "published",
            teamId: "team-1"
          })
        } as Response);
    }));

    render(<App />, { initialEntries: ["/editor/games/1"] });

    expect(await screen.findByText(/Remark/i)).toBeInTheDocument();
  });
});
