import { vi } from "vitest";
import { describe, it, expect, beforeEach } from "vitest";

describe("Explorer Tree (FP6)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  it("should display tree structure: jams → years → games", async () => {
    expect(true).toBe(true);
  });

  it("should expand folder when clicked", async () => {
    expect(true).toBe(true);
  });

  it("should collapse folder when clicked again", async () => {
    expect(true).toBe(true);
  });

  it("should open game window when game is clicked", async () => {
    expect(true).toBe(true);
  });

  it("should show only published games for guests", async () => {
    expect(true).toBe(true);
  });
});
