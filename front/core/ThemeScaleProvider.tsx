/**
 * ThemeScaleProvider — applies theme + scale tokens to root.
 * THEMING_v0: single source of truth via CSS variables.
 */

import { useEffect } from "react";
import { THEME_PACKS, type ThemeId } from "./themePacks";

interface ThemeScaleProviderProps {
  theme: ThemeId;
  scale: number;
  children: React.ReactNode;
}

export function ThemeScaleProvider({ theme, scale, children }: ThemeScaleProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    const pack = THEME_PACKS[theme];
    if (pack) {
      for (const [key, value] of Object.entries(pack)) {
        root.style.setProperty(key, value);
      }
    }
    root.style.setProperty("--wm-scale", String(scale));
  }, [theme, scale]);

  return <>{children}</>;
}
