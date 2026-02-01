import { useState } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../os/wm/WindowManager";
import { resolveIconForApp } from "../ui/icons";
import type { IconType } from "../ui/icons";
import { Icon } from "../ui/icons";

export function MobilePage() {
  const { openWindow, windows } = useWindowRegistry();
  const [menuOpen, setMenuOpen] = useState(false);

  const icons = [
    {
      id: "games",
      label: "Игры",
      icon: resolveIconForApp("executor") as IconType,
      onClick: () => {
        window.location.href = "/";
      },
    },
    {
      id: "explorer",
      label: "Explorer",
      icon: resolveIconForApp("explorer") as IconType,
      onClick: () => openWindow("explorer"),
    },
    {
      id: "help",
      label: "HELP.TXT",
      icon: resolveIconForApp("help") as IconType,
      onClick: () => openWindow("help"),
    },
  ];

  // In mobile mode, only allow one window at a time
  const currentWindow = windows.length > 0 ? windows[windows.length - 1] : null;

  return (
    <div className="mobile-container">
      {/* Calendar/Header */}
      <div className="mobile-header">
        <div className="mobile-date">{new Date().toLocaleDateString()}</div>
        <button
          className="win-btn mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Burger menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {icons.map((icon) => (
            <button
              key={icon.id}
              className="win-btn mobile-menu-item"
              type="button"
              onClick={() => {
                icon.onClick();
                setMenuOpen(false);
              }}
            >
              <Icon type={icon.icon} size="16x16" /> {icon.label}
            </button>
          ))}
        </div>
      )}

      {/* Icons grid/list */}
      {!currentWindow && (
        <div className="mobile-icons-grid">
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
        <div className="mobile-window-container">
          <WindowManager />
        </div>
      )}
    </div>
  );
}
