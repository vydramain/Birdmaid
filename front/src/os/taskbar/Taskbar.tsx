import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useWindowRegistry } from "../wm/WindowRegistry";
import { taskbar, colors } from "../../ui/win95/tokens";

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
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const isLoggedIn = auth.user !== null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: `${taskbar.height}px`,
        backgroundColor: taskbar.backgroundColor,
        borderTop: taskbar.borderTop,
        borderBottom: taskbar.borderBottom,
        zIndex: taskbar.zIndex,
        display: "flex",
        alignItems: "center",
        padding: taskbar.padding,
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Window list will go here */}
      </div>
      <div
        style={{
          display: "flex",
          gap: `${taskbar.tray.gap}px`,
          alignItems: "center",
          padding: taskbar.tray.padding,
        }}
      >
        {/* User Icon */}
        <div
          data-testid="tray-user-icon"
          onClick={handleUserIconClick}
          style={{
            width: taskbar.trayIcon.width,
            height: taskbar.trayIcon.height,
            cursor: taskbar.trayIcon.cursor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isLoggedIn ? colors.blue : colors.gray,
            border: `1px solid ${colors.black}`,
            borderTopColor: colors.white,
            borderLeftColor: colors.white,
            borderRightColor: colors.black,
            borderBottomColor: colors.black,
            boxShadow: `1px 1px 0 ${colors.black}, inset -1px -1px 0 ${colors.grayDark}`,
            fontSize: "14px",
            userSelect: "none",
          }}
          title={isLoggedIn ? `Logged in as ${auth.user?.login || 'User'}` : "Not logged in"}
        >
          {isLoggedIn ? "👤" : "👤"}
        </div>

        {/* Clock */}
        <div
          style={{
            fontSize: taskbar.clock.fontSize,
            color: taskbar.clock.color,
            padding: taskbar.clock.padding,
            fontFamily: "monospace",
            userSelect: "none",
          }}
          title={currentTime.toLocaleString()}
        >
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}
