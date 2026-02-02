import { HourglassLoader } from "./win95/HourglassLoader";

/**
 * HourglassOverlay - Win98 hourglass loader overlay (fullscreen, z-index: 99999)
 * 
 * Показывается поверх всего контента во время booting auth state.
 */
export function HourglassOverlay() {
  return (
    <div
      className="hourglass-overlay"
      // inline-style: allowed (reason: layout-calc, fullscreen overlay)
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(192, 192, 192, 0.9)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HourglassLoader />
    </div>
  );
}
