import { usePlatform } from "../contexts/PlatformContext";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";

/**
 * ShellRoot - Single entry point for the platform.
 * 
 * Determines Desktop/Mobile on boot and fixes the mode for the session.
 * No react-router, shell-only navigation.
 */
export function ShellRoot() {
  const { isMobile } = usePlatform();

  if (isMobile) {
    return <MobileShell />;
  }

  return <DesktopShell />;
}
