/**
 * MenuBar Primitive
 * 
 * Windows 95 styled menu bar component.
 * Uses only SCSS classes, no inline styles.
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ReactNode } from "react";

type MenuBarProps = {
  children: ReactNode;
  "data-testid"?: string;
};

export function MenuBar({ children, "data-testid": testId }: MenuBarProps) {
  return (
    <div className="win-menubar" data-testid={testId}>
      {children}
    </div>
  );
}

type MenuItemProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  "data-testid"?: string;
};

export function MenuItem({ label, onClick, disabled, "data-testid": testId }: MenuItemProps) {
  return (
    <button
      className="win-menubar-item"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {label}
    </button>
  );
}
