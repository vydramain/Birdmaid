/**
 * DesktopIcon — double-clickable desktop shortcut (FP3 My Computer).
 */

interface DesktopIconProps {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function DesktopIcon({ label, onClick }: DesktopIconProps) {
  return (
    <button
      type="button"
      className="desktop-icon"
      data-testid="desktop-icon-my-computer"
      onDoubleClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
}
