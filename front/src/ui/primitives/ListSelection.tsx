/**
 * ListSelection Primitive
 * 
 * Windows 95 styled list with selection support.
 * Uses only SCSS classes, no inline styles.
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ReactNode } from "react";

type ListSelectionProps = {
  children: ReactNode;
  "data-testid"?: string;
};

export function ListSelection({ children, "data-testid": testId }: ListSelectionProps) {
  return (
    <div className="win-list-selection" data-testid={testId}>
      {children}
    </div>
  );
}

type ListItemProps = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  "data-testid"?: string;
};

export function ListItem({ children, selected, onClick, "data-testid": testId }: ListItemProps) {
  return (
    <div
      className={`win-list-item ${selected ? "win-list-item-selected" : ""}`}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
