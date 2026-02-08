import { useState } from "react";
import { Icon } from "../ui/icons";
import type { IconType } from "../ui/icons";

type DesktopIconProps = {
  icon: IconType;
  label: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  selected?: boolean;
  tooltip?: string;
  dataTestId?: string;
  dataPath?: string;
  dataItemType?: "file" | "dir";
};

export function DesktopIcon({ icon, label, onClick, onDoubleClick, onContextMenu, selected, tooltip: _tooltip, dataTestId, dataPath, dataItemType }: DesktopIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`desktop-icon-container${selected ? " is-selected" : ""}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={dataTestId || `desktop-icon-${label}`}
      {...(dataPath && { "data-path": dataPath, "data-cm-item": dataItemType ?? "file" })}
    >
      <div className="desktop-icon-box">
        <Icon type={icon} size="48x48" />
      </div>
      <span className="desktop-icon-label">{label}</span>
    </div>
  );
}
