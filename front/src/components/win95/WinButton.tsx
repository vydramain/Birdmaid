/**
 * WinButton - Windows 95 styled button component.
 *
 * Single source of truth for Win95 button behavior.
 * No local button styling; all styles from SCSS (win-btn, win-btn--default, win-btn--toggle).
 *
 * Spec: docs/style/WIN95_SPEC.md
 * - Normal: 3D outset, system gray, black text
 * - Pressed: 3D inset + 1px content shift
 * - Focus-visible: inner dotted focus rectangle
 * - Disabled: engraved text, cursor default
 * - Default: outer emphasis border (dialog default)
 * - Toggle: pressed via aria-pressed or is-pressed
 */

import { ButtonHTMLAttributes, ReactNode } from "react";

type WinButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Dialog default action (Enter key), adds outer emphasis border */
  variant?: "default" | "normal";
  /** Toggle button; use aria-pressed for state */
  toggle?: boolean;
};

export function WinButton({
  children,
  className = "",
  variant = "normal",
  toggle = false,
  "aria-pressed": ariaPressed,
  ...props
}: WinButtonProps) {
  const classes = [
    "win-btn",
    variant === "default" && "win-btn-default",
    toggle && "win-btn-toggle",
    toggle && ariaPressed === true && "is-pressed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={`${classes} ${className}`.trim()}
      aria-pressed={toggle ? ariaPressed : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
