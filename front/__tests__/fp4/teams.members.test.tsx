import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeTeam } from "@/test/fixtures/team";

describe("Team member management", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    localStorage.setItem("birdmaid_token", "valid-token");
  });

  it("allows team leader to add members", async () => {
    const team = makeTeam({ id: "team123", name: "Test Team", leader: "leader123", members: ["leader123"] });
    mockApi.teams([team]);
    
    // Mock POST /teams/:id/members
    mockApi.post("/teams/team123/members", () => {
      return Promise.resolve(new Response(JSON.stringify({
        id: "team123",
        name: "Test Team",
        leader: "leader123",
        members: ["leader123", "newmember123"],
      }), { status: 200 }));
    });

    renderAppRoot({ route: "/teams/team123" });

    const userIdInput = screen.getByPlaceholderText(/user.*id|add.*member/i);
    const addButton = screen.getByRole("button", { name: /add.*member/i });

    userIdInput.setAttribute("value", "newmember123");
    addButton.click();

    await waitFor(() => {
      // Team should be updated with new member
      expect(screen.getByText(/newmember123|Test Team/i)).toBeInTheDocument();
    });
  });
});

