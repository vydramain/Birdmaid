import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams name search (FP5)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  it("filters teams by name in real-time as user types", async () => {
    const allTeams = [
      { id: "1", name: "Alpha Team", leader: "leader1", members: [] },
      { id: "2", name: "Beta Team", leader: "leader2", members: [] },
      { id: "3", name: "Gamma Team", leader: "leader3", members: [] },
    ];

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: allTeams }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

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
      { id: "1", name: "Alpha Team", leader: "leader1", members: [] },
      { id: "2", name: "Beta Team", leader: "leader2", members: [] },
    ];

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: allTeams }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

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
      { id: "1", name: "Alpha Team", leader: "leader1", members: [] },
      { id: "2", name: "Beta Team", leader: "leader2", members: [] },
    ];

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: allTeams }),
      } as Response)
    );
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

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
