import { useState, ReactNode } from "react";

type DesktopIconProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tooltip?: string;
};

export function DesktopIcon({ icon, label, onClick, tooltip }: DesktopIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="desktop-icon-container"
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="desktop-icon-box">{icon}</div>
      <span className="desktop-icon-label">{label}</span>
      {showTooltip && tooltip && (
        <div
          className="desktop-icon-tooltip"
          // inline-style: allowed (reason: layout-calc)
          style={{
            transform: "translateX(-50%)",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
