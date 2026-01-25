import { fireEvent, screen } from "@/test/utils";
import { render } from "../../src/test/utils/render";
import { describe, it, vi, beforeEach, expect } from "vitest";
import App from "../../src/App";

describe("Auth modal (Windows 95 style)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)));
  });

  it("opens Windows 95 styled draggable modal when Login button clicked", async () => {
    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    const modal = document.querySelector(".win95-modal");
    expect(modal).toBeInTheDocument();

    const titleBar = modal?.querySelector(".win-titlebar");
    expect(titleBar).toBeInTheDocument();
  });

  it("modal is draggable by title bar", async () => {
    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    const modal = document.querySelector(".win95-modal");
    const titleBar = modal?.querySelector(".win-titlebar");

    expect(titleBar).toBeInTheDocument();
  });

  it("modal contains login and registration forms", async () => {
    render(<App />, { initialEntries: ["/catalog"] });

    const loginButton = await screen.findByText("Login");
    fireEvent.click(loginButton);

    expect(await screen.findByLabelText(/email|login|username/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument();
  });
});
