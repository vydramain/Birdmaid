import { usePlatform } from "../contexts/PlatformContext";
import { useAuth } from "../contexts/AuthContext";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";
import { HourglassOverlay } from "../components/HourglassOverlay";

/**
 * ShellRoot - Single entry point for the platform.
 * 
 * Determines Desktop/Mobile on boot and fixes the mode for the session.
 * No react-router, shell-only navigation.
 */
export function ShellRoot() {
  const { isMobile } = usePlatform();
  const { state } = useAuth();

  // Show hourglass overlay during booting
  if (state === 'booting') {
    return <HourglassOverlay />;
  }

  if (isMobile) {
    return <MobileShell />;
  }

  return <DesktopShell />;
}
