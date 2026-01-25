import { render } from "../../src/test/utils/render";
import { describe, it, vi, expect } from "vitest";
import App from "../../src/App";

describe("Windows 95 UI styling", () => {
  it("renders all UI elements with Windows 95 design", () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response))
    );

    render(<App />, { initialEntries: ["/catalog"] });

    // Check for Windows 95 window structure
    const window = document.querySelector(".win-window");
    expect(window).toBeInTheDocument();

    const titleBar = document.querySelector(".win-titlebar");
    expect(titleBar).toBeInTheDocument();

    // Check for Windows 95 buttons
    const buttons = document.querySelectorAll(".win-btn");
    expect(buttons.length).toBeGreaterThan(0);

    // Check for Windows 95 inset/outset styles
    const inset = document.querySelector(".win-inset");
    const outset = document.querySelector(".win-outset");
    expect(inset || outset).toBeInTheDocument();
  });

  it("does not contain MUI Material 3 components", () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)));
    
    render(<App />, { initialEntries: ["/catalog"] });

    // Check that MUI classes are not present
    const muiComponents = document.querySelectorAll("[class*='Mui']");
    expect(muiComponents.length).toBe(0);
  });

  it("removes Teams sidebar from Teams page", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ teams: [] }) } as Response)));

    render(<App />, { initialEntries: ["/teams"] });

    const sidebar = document.querySelector(".sidebar");
    expect(sidebar).not.toBeInTheDocument();
  });
});
