import { screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi } from "vitest";
import App from "../../src/App";

describe("Admin guard", () => {
  it("redirects to home when access is denied (unauthenticated)", async () => {
    // Ensure no token
    localStorage.removeItem("birdmaid_token");

    render(<App />, { initialEntries: ["/editor/games/1"] });

    // Expect to see Desktop/Welcome window (Shell) instead of Editor
    expect(await screen.findByText(/Welcome/i)).toBeInTheDocument();
    // Or check that "Description" (editor field) is NOT present
    expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
  });
});
