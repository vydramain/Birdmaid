import { useEffect, useState } from "react";
import { useWindow } from "../contexts/WindowContext";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../components/WindowManager";

export function DesktopPage() {
  const { openWindow } = useWindow();
  const [landingSeen, setLandingSeen] = useState(false);

  useEffect(() => {
    // Check if landing window was already seen
    const seen = localStorage.getItem("birdmaid_landing_seen");
    if (!seen) {
      // Open landing window automatically
      openWindow("landing");
      setLandingSeen(true);
    }
  }, [openWindow]);

  const icons = [
    {
      id: "games",
      label: "Игры",
      icon: "🎮",
      onClick: () => {
        // Open games catalog in a window
        // For now, just navigate or open a window
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
    {
      id: "installer",
      label: "Мастер по установке",
      icon: "⚙️",
      onClick: () => {
        // Placeholder - will be implemented in FP10
        alert("Coming in FP10");
      },
    },
    {
      id: "trash",
      label: "Говно - не открывать",
      icon: "🗑️",
      onClick: () => {
        // Placeholder - shuточный контент
        alert("You were warned!");
      },
    },
    {
      id: "widgets",
      label: "Безделушки",
      icon: "🎲",
      onClick: () => {
        // Placeholder - will be implemented in FP8
        alert("Coming in FP8");
      },
    },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#008080",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Desktop icons grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "16px",
          padding: "16px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
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

      {/* Window Manager */}
      <WindowManager />
    </div>
  );
}
