import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../../src/App";

describe("Windows 95 UI styling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response))
    );
  });

  it("renders all UI elements with Windows 95 design", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

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
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Check that MUI classes are not present
    const muiComponents = document.querySelectorAll("[class*='Mui']");
    expect(muiComponents.length).toBe(0);
  });

  it("removes Teams sidebar from Teams page", () => {
    render(
      <MemoryRouter initialEntries={["/teams"]}>
        <App />
      </MemoryRouter>
    );

    const sidebar = document.querySelector(".sidebar");
    expect(sidebar).not.toBeInTheDocument();
  });
});

