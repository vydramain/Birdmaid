/**
 * useThemeScale — applies theme + scale tokens to root.
 * THEMING_v0: single source of truth via CSS variables.
 */

import { watch, type Ref } from "vue";
import { THEME_PACKS, type ThemeId } from "../core/themePacks";

export function useThemeScale(themeId: Ref<ThemeId>, scale: Ref<number>) {
  watch(
    [themeId, scale],
    ([theme, s]) => {
      const root = document.documentElement;
      const pack = THEME_PACKS[theme];
      if (pack) {
        for (const [key, value] of Object.entries(pack)) {
          root.style.setProperty(key, value);
        }
      }
      root.style.setProperty("--wm-scale", String(s));
    },
    { immediate: true }
  );
}
