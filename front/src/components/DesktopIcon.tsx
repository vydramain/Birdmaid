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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        padding: "8px",
        position: "relative",
      }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--win-gray)",
          border: "2px outset var(--win-gray-light)",
          marginBottom: "4px",
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: "11px", textAlign: "center", maxWidth: "64px" }}>
        {label}
      </span>
      {showTooltip && tooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "4px",
            padding: "4px 8px",
            backgroundColor: "var(--win-yellow)",
            border: "1px solid var(--win-gray-dark)",
            fontSize: "10px",
            whiteSpace: "nowrap",
            zIndex: 1000,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
