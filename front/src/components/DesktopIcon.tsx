import { useState } from "react";
import { Icon } from "../ui/icons";
import type { IconType } from "../ui/icons";

type DesktopIconProps = {
  icon: IconType;
  label: string;
  onClick: () => void;
  tooltip?: string;
  dataTestId?: string;
};

export function DesktopIcon({ icon, label, onClick, tooltip, dataTestId }: DesktopIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="desktop-icon-container"
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={dataTestId || `desktop-icon-${label}`}
    >
      <div className="desktop-icon-box">
        <Icon type={icon} size="48x48" />
      </div>
      <span className="desktop-icon-label">{label}</span>
    </div>
  );
}
