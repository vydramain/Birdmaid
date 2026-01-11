import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Teams info modal sizing (FP5)", () => {
  beforeEach(() => {
    localStorage.setItem("birdmaid_token", "valid-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("modal has adaptive height (not full screen)", async () => {
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
              members: ["member1", "member2"],
              memberLogins: ["alice", "bob"],
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

    // Open team info modal
    const infoButton = screen.getByText(/info|view|details/i) || screen.getByRole("button", { name: /info/i });
    infoButton.click();

    await waitFor(() => {
      const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });

    const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
    const modalStyle = window.getComputedStyle(modal as HTMLElement);
    
    // Modal should not be full screen height
    const viewportHeight = window.innerHeight;
    const modalHeight = parseInt(modalStyle.height) || 0;
    
    expect(modalHeight).toBeLessThan(viewportHeight);
    expect(modalStyle.height).not.toBe("100vh");
    expect(modalStyle.height).not.toBe("100%");
  });

  it("modal ends immediately after 'Add Member' section", async () => {
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

    // Check that "Add Member" section exists
    const addMemberSection = screen.getByText(/add member/i) || screen.getByRole("button", { name: /add member/i });
    expect(addMemberSection).toBeInTheDocument();

    // Modal should end after Add Member section (no excessive padding/height)
    const modal = document.querySelector(".win95-modal") || screen.getByRole("dialog");
    const modalContent = modal?.querySelector(".modal-content") || modal;
    const contentStyle = window.getComputedStyle(modalContent as HTMLElement);
    
    // Content should not have excessive bottom padding
    const bottomPadding = parseInt(contentStyle.paddingBottom) || 0;
    expect(bottomPadding).toBeLessThan(100); // Reasonable padding, not excessive
  });
});
