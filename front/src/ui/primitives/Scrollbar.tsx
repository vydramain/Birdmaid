/**
 * Scrollbar Primitive
 * 
 * Windows 95 styled scrollbar component.
 * Uses only SCSS classes, no inline styles (except whitelisted for layout-calc).
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ReactNode } from "react";

type ScrollbarProps = {
  children: ReactNode;
  orientation?: "vertical" | "horizontal";
  "data-testid"?: string;
};

export function Scrollbar({ children, orientation = "vertical", "data-testid": testId }: ScrollbarProps) {
  return (
    <div 
      className={`win-scrollbar win-scrollbar-${orientation}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
