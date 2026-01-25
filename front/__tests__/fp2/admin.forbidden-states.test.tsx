import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it } from "vitest";
import App from "../../src/App";

describe("Admin forbidden UI states", () => {
  it("redirects to home when access is denied", async () => {
    localStorage.removeItem("birdmaid_token");

    render(<App />, { initialEntries: ["/editor/games/1"] });

    expect(await screen.findByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.queryByText(/Access denied/i)).not.toBeInTheDocument();
  });
});
