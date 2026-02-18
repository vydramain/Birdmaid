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
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--wm-bg, #f0f0f0)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
