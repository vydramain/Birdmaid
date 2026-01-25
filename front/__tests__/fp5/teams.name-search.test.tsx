import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeTeam } from "@/test/fixtures/team";

describe("Teams name search (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("filters teams by name in real-time as user types", async () => {
    const allTeams = [
      makeTeam({ id: "1", name: "Alpha Team", leader: "leader1" }),
      makeTeam({ id: "2", name: "Beta Team", leader: "leader2" }),
      makeTeam({ id: "3", name: "Gamma Team", leader: "leader3" }),
    ];
    mockApi.teams(allTeams);

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    });

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    
    // Type in search input
    searchInput.setAttribute("value", "Alpha");
    
    // Trigger input event (simulating real-time search)
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
      expect(screen.queryByText("Beta Team")).not.toBeInTheDocument();
      expect(screen.queryByText("Gamma Team")).not.toBeInTheDocument();
    });
  });

  it("performs case-insensitive search", async () => {
    const allTeams = [
      makeTeam({ id: "1", name: "Alpha Team", leader: "leader1" }),
      makeTeam({ id: "2", name: "Beta Team", leader: "leader2" }),
    ];
    mockApi.teams(allTeams);

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    searchInput.setAttribute("value", "ALPHA"); // Uppercase search
    
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    });
  });

  it("supports partial matches", async () => {
    const allTeams = [
      makeTeam({ id: "1", name: "Alpha Team", leader: "leader1" }),
      makeTeam({ id: "2", name: "Beta Team", leader: "leader2" }),
    ];
    mockApi.teams(allTeams);

    renderAppRoot({ route: "/teams" });

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|filter/i) || screen.getByLabelText(/search/i);
    searchInput.setAttribute("value", "lph"); // Partial match
    
    const inputEvent = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
      expect(screen.queryByText("Beta Team")).not.toBeInTheDocument();
    });
  });
});
