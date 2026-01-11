import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams info modal user search (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("allows searching for users by login", async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/users?login=")) {
        const urlObj = new URL(url, "http://localhost");
        const loginQuery = urlObj.searchParams.get("login") || "";
        
        const users = [
          { id: "user1", login: "alice" },
          { id: "user2", login: "alice_smith" },
        ].filter((u) => u.login.toLowerCase().includes(loginQuery.toLowerCase()));

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ users }),
        } as Response);
      }
      if (url.includes("/teams/team123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: [],
              memberLogins: [],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [{ id: "team123", name: "Test Team" }] }),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    // Find user search input
    const userSearchInput = screen.getByPlaceholderText(/search.*user|user.*search/i) || 
                           screen.getByLabelText(/user.*login|search.*user/i);
    
    userSearchInput.setAttribute("value", "alice");
    
    const inputEvent = new Event("input", { bubbles: true });
    userSearchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      // Should show search results
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users?login=alice"),
        expect.any(Object)
      );
    });
  });

  it("uses Windows 95 styling for user search input", async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("/teams/team123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: [],
              memberLogins: [],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [{ id: "team123", name: "Test Team" }] }),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    const userSearchInput = screen.getByPlaceholderText(/search.*user|user.*search/i) || 
                           screen.getByLabelText(/user.*login|search.*user/i);
    
    const inputClasses = userSearchInput.className;
    const hasWin95Styling =
      inputClasses.includes("win95") ||
      inputClasses.includes("Win95Input") ||
      userSearchInput.closest(".win95-input") !== null ||
      userSearchInput.closest("[class*='win95']") !== null;

    expect(hasWin95Styling).toBe(true);
  });

  it("adds user to team when 'Add Member' is clicked with valid login", async () => {
    const mockFetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/users?login=")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ users: [{ id: "user1", login: "alice" }] }),
        } as Response);
      }
      if (url.includes("/teams/team123/members") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: ["user1"],
              memberLogins: ["alice"],
            }),
        } as Response);
      }
      if (url.includes("/teams/team123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "team123",
              name: "Test Team",
              leader: "leader123",
              leaderLogin: "leader",
              members: [],
              memberLogins: [],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ teams: [{ id: "team123", name: "Test Team" }] }),
      } as Response);
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    const userSearchInput = screen.getByPlaceholderText(/search.*user|user.*search/i) || 
                           screen.getByLabelText(/user.*login|search.*user/i);
    userSearchInput.setAttribute("value", "alice");
    
    const inputEvent = new Event("input", { bubbles: true });
    userSearchInput.dispatchEvent(inputEvent);

    await waitFor(() => {
      const addMemberButton = screen.getByRole("button", { name: /add member/i });
      addMemberButton.click();
    });

    await waitFor(() => {
      // Should call POST /teams/{id}/members endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/teams/team123/members"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});
