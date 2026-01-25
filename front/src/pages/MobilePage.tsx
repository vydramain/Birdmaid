import { useState } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../os/wm/WindowManager";

export function MobilePage() {
  const { openWindow, windows } = useWindowRegistry();
  const [menuOpen, setMenuOpen] = useState(false);

  const icons = [
    {
      id: "games",
      label: "Игры",
      icon: "🎮",
      onClick: () => {
        window.location.href = "/";
      },
    },
    {
      id: "explorer",
      label: "Explorer",
      icon: "📁",
      onClick: () => openWindow("explorer"),
    },
    {
      id: "help",
      label: "HELP.TXT",
      icon: "❓",
      onClick: () => openWindow("help"),
    },
  ];

  // In mobile mode, only allow one window at a time
  const currentWindow = windows.length > 0 ? windows[windows.length - 1] : null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#008080",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Calendar/Header */}
      <div
        style={{
          backgroundColor: "var(--win-gray)",
          borderBottom: "2px solid var(--win-gray-dark)",
          padding: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          {new Date().toLocaleDateString()}
        </div>
        <button
          className="win-btn"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ padding: "4px 8px" }}
        >
          ☰
        </button>
      </div>

      {/* Burger menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "8px",
            backgroundColor: "var(--win-gray)",
            border: "2px outset var(--win-gray-light)",
            zIndex: 1000,
            minWidth: "150px",
          }}
        >
          {icons.map((icon) => (
            <button
              key={icon.id}
              className="win-btn"
              type="button"
              onClick={() => {
                icon.onClick();
                setMenuOpen(false);
              }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px" }}
            >
              {icon.icon} {icon.label}
            </button>
          ))}
        </div>
      )}

      {/* Icons grid/list */}
      {!currentWindow && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            padding: "16px",
            flex: 1,
            overflow: "auto",
          }}
        >
          {icons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              onClick={icon.onClick}
              tooltip={icon.label}
            />
          ))}
        </div>
      )}

      {/* Single window in mobile mode */}
      {currentWindow && (
        <div style={{ flex: 1, position: "relative" }}>
          <WindowManager />
        </div>
      )}
    </div>
  );
}
