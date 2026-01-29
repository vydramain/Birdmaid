import { DesktopPage } from "../pages/DesktopPage";
import { Taskbar } from "./taskbar/Taskbar";

/**
 * DesktopShell - Windows 95 styled desktop environment.
 * 
 * Components:
 * - Wallpaper (via DesktopPage)
 * - Desktop Icons (via DesktopPage)
 * - WindowManager (via DesktopPage)
 * - Taskbar (stub)
 */
export function DesktopShell() {
  return (
    <>
      <DesktopPage />
      <Taskbar />
    </>
  );
}
