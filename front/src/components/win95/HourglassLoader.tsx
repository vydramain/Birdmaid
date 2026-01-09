import { useEffect, useState } from "react";

export function HourglassLoader() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Windows 95 hourglass animation frames
  const sandTop = [100, 75, 50, 25][frame];
  const sandBottom = [0, 25, 50, 75][frame];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#c0c0c0",
        border: "2px solid var(--win-black)",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          position: "relative",
          background: "#c0c0c0",
          border: "2px inset",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Hourglass shape */}
        <svg width="32" height="32" viewBox="0 0 32 32" style={{ position: "relative", zIndex: 1 }}>
          {/* Hourglass outline */}
          <path
            d="M 8 4 L 24 4 L 20 12 L 12 12 L 8 4 Z M 8 28 L 24 28 L 20 20 L 12 20 L 8 28 Z M 12 12 L 12 20 L 20 20 L 20 12 Z"
            fill="none"
            stroke="var(--win-black)"
            strokeWidth="1.5"
          />
          {/* Top sand */}
          <rect x="10" y="6" width="12" height={`${sandTop * 0.16}`} fill="#000" />
          {/* Bottom sand */}
          <rect x="10" y={`28 - ${sandBottom * 0.16}`} width="12" height={`${sandBottom * 0.16}`} fill="#000" />
        </svg>
      </div>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--win-black)", fontWeight: "normal" }}>
        Loading...
      </div>
    </div>
  );
}

