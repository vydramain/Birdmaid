import type { ThemeTokenSet } from "../core/types";

interface DesktopViewProps {
  theme: ThemeTokenSet;
  scale: number;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function DesktopView({ children, onClick }: DesktopViewProps) {
  return (
    <div
      data-testid="desktop"
      className="wm-desktop"
      onClick={onClick}
      onMouseDown={onClick}
      role="presentation"
    >
      {children}
    </div>
  );
}
