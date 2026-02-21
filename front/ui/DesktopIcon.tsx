/**
 * DesktopIcon — double-clickable desktop shortcut (FP3 My Computer).
 * FP3.1 A4: Uses shared fs-tile + fs-icon-my-computer (same as Explorer).
 */

import "../shared/fs-tile.css";

interface DesktopIconProps {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function DesktopIcon({ label, onClick }: DesktopIconProps) {
  return (
    <button
      type="button"
      className="desktop-icon fs-tile"
      data-testid="desktop-icon-my-computer"
      onDoubleClick={onClick}
      aria-label={label}
    >
      <span
        className="fs-tile-icon fs-icon-my-computer"
        data-testid="my-computer-icon"
        aria-hidden
      />
      <span className="fs-tile-label">{label}</span>
    </button>
  );
}
