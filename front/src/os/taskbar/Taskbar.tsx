import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWindowRegistry } from "../wm/WindowRegistry";
import { taskbar, colors } from "../../ui/win95/tokens";
import { Icon } from "../../ui/icons";

/**
 * Taskbar - Windows 95 styled taskbar.
 *
 * Features:
 * - List of open windows (left side) - TODO
 * - Tray area (right side): User Icon, Clock
 */
export function Taskbar() {
  const auth = useAuth();
  const { openWindow } = useWindowRegistry();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const isLoggedIn = auth.user !== null;

  return (
    <div
      className="win-taskbar-fixed"
      // inline-style: allowed (reason: layout-calc)
      style={{
        height: `${taskbar.height}px`,
        zIndex: taskbar.zIndex,
      }}
    >
      <div className="win-taskbar-window-list">{/* Window list will go here */}</div>
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
  );
}
