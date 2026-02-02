import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWindowRegistry } from "../wm/WindowRegistry";
import { taskbar, colors } from "../../ui/win95/tokens";
import { Icon } from "../../ui/icons";
import { StartMenu } from "./StartMenu";

/**
 * Taskbar - Windows 95 styled taskbar.
 *
 * Features:
 * - Start button (left side)
 * - List of open windows (left side) - TODO
 * - Tray area (right side): User Icon, Clock
 */
export function Taskbar() {
  const auth = useAuth();
  const { openWindow } = useWindowRegistry();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUserIconClick = () => {
    openWindow("userpanel");
  };

  // Format time as HH:MM:SS (24-hour format)
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const isLoggedIn = auth.user !== null && auth.state === 'authed';

  const handleStartClick = () => {
    setStartMenuOpen(!startMenuOpen);
  };

  return (
    <>
      <div
        className="win-taskbar-fixed"
        // inline-style: allowed (reason: layout-calc)
        style={{
          height: `${taskbar.height}px`,
          zIndex: taskbar.zIndex,
        }}
      >
        <div className="win-taskbar-window-list">
          {/* Start Button */}
          <button
            data-testid="start-button"
            type="button"
            onClick={handleStartClick}
            className="win-taskbar-start-button"
          >
            Start
          </button>
        </div>
        <div className="win-taskbar-tray">
        {/* User Icon */}
        <div
          data-testid="tray-user-icon"
          onClick={handleUserIconClick}
          className={`tray-icon ${isLoggedIn ? "tray-icon-logged-in" : ""}`}
          title={isLoggedIn ? `Logged in as ${auth.user?.login || "User"}` : "Not logged in"}
        >
          <Icon type="system-user" size="16x16" />
        </div>

        {/* Clock */}
        <div className="tray-clock" title={currentTime.toLocaleString()}>
          {formatTime(currentTime)}
        </div>
        </div>
      </div>
      <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} />
    </>
  );
}
