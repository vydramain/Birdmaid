import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach } from "vitest";
import App from "../../src/App";

describe("Admin publish gating", () => {
  beforeEach(() => {
    // Mock authenticated user
    const fakeToken = `header.${btoa(JSON.stringify({
      userId: "user-1",
      email: "user@example.com",
      login: "user1",
      isSuperAdmin: false
    }))}.signature`;
    localStorage.setItem("birdmaid_token", fakeToken);
  });

  it("disables publish until required fields are present", async () => {
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
            description_md: "", // Missing description
            repo_url: "",
            cover_url: "",
            build_url: null,
            status: "editing",
            teamId: "team-1"
          })
        } as Response);
    }));

    render(<App />, { initialEntries: ["/editor/games/1"] });

    const publishBtn = await screen.findByRole("button", { name: /Publish/i });
    expect(publishBtn).toBeDisabled();
  });
});
