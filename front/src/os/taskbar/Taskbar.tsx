/**
 * Taskbar - Windows 95 styled taskbar (stub).
 * 
 * Future implementation:
 * - List of open windows (left side)
 * - Tray area (right side): User Icon, Clock
 */
export function Taskbar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        backgroundColor: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        borderBottom: "2px solid #808080",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Window list will go here */}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {/* Tray area: User Icon, Clock will go here */}
      </div>
    </div>
  );
}
