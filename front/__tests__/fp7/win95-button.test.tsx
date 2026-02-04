/**
 * Win95 Button System Tests
 *
 * Verifies WinButton component and win-btn classes.
 * Spec: docs/style/WIN95_SPEC.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WinButton } from "../../src/components/win95/WinButton";

describe("Win95 Button System", () => {
  it("renders with win-btn class", () => {
    render(<WinButton>Click me</WinButton>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toHaveClass("win-btn");
  });

  it("applies win-btn-default when variant is default", () => {
    render(<WinButton variant="default">Default</WinButton>);
    const btn = screen.getByRole("button", { name: /default/i });
    expect(btn).toHaveClass("win-btn");
    expect(btn).toHaveClass("win-btn-default");
  });

  it("applies win-btn-toggle and is-pressed when toggle and aria-pressed true", () => {
    render(
      <WinButton toggle aria-pressed={true}>
        Toggle
      </WinButton>
    );
    const btn = screen.getByRole("button", { name: /toggle/i });
    expect(btn).toHaveClass("win-btn");
    expect(btn).toHaveClass("win-btn-toggle");
    expect(btn).toHaveClass("is-pressed");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("focus-visible: button has win-btn class (focus ring applied via :focus-visible in CSS)", () => {
    render(<WinButton data-testid="focus-btn">Focus me</WinButton>);
    const btn = screen.getByTestId("focus-btn");
    expect(btn).toHaveClass("win-btn");
    expect(btn.tagName).toBe("BUTTON");
  });

  it("pressed state: toggle button with is-pressed has correct classes", () => {
    render(
      <WinButton toggle aria-pressed={true}>
        Toggle
      </WinButton>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("is-pressed");
    expect(btn).toHaveClass("win-btn-toggle");
  });

  it("disabled button has disabled attribute", () => {
    render(<WinButton disabled>Disabled</WinButton>);
    const btn = screen.getByRole("button", { name: /disabled/i });
    expect(btn).toBeDisabled();
  });
});
