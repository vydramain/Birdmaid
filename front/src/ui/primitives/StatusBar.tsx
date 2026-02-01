/**
 * StatusBar Primitive
 * 
 * Windows 95 styled status bar component.
 * Uses only SCSS classes, no inline styles.
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ReactNode } from "react";

type StatusBarProps = {
  children: ReactNode;
  "data-testid"?: string;
};

export function StatusBar({ children, "data-testid": testId }: StatusBarProps) {
  return (
    <div className="win-statusbar" data-testid={testId}>
      {children}
    </div>
  );
}
