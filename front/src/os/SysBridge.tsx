import { useEffect } from "react";
import { useWindowRegistry } from "./wm/WindowRegistry";
import { windowStore } from "./wm/WindowStore";
import { runSmokeTest } from "../test/perf-smoke";

declare global {
  interface Window {
    sys: any;
    runSmokeTest: () => Promise<void>;
  }
}

export function SysBridge() {
  const { openWindow, closeWindow } = useWindowRegistry();

  useEffect(() => {
    window.sys = {
      open: openWindow,
      close: closeWindow,
      store: windowStore,
    };
    window.runSmokeTest = runSmokeTest;
    
    return () => {
      // Cleanup if needed
    };
  }, [openWindow, closeWindow]);

  return null;
}
