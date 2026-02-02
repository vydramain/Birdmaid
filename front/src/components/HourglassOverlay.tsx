import { HourglassLoader } from "./win95/HourglassLoader";

/**
 * HourglassOverlay - Win98 hourglass loader overlay (fullscreen, z-index: 99999)
 * 
 * Показывается поверх всего контента во время booting auth state.
 */
export function HourglassOverlay() {
  return (
    <div className="hourglass-overlay">
      <HourglassLoader />
    </div>
  );
}
