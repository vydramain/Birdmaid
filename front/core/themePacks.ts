/**
 * Theme packs — THEMING_v0.
 * Single source of truth for theme token values.
 */

export type ThemeId = "DefaultMock" | "Win98Mock";

export interface ThemePack {
  "--wm-bg": string;
  "--wm-fg": string;
  "--wm-border": string;
  "--wm-accent": string;
  "--wm-shadow": string;
  "--wm-font-family": string;
}

export const THEME_PACKS: Record<ThemeId, ThemePack> = {
  DefaultMock: {
    "--wm-bg": "#f0f0f0",
    "--wm-fg": "#333",
    "--wm-border": "#ccc",
    "--wm-accent": "#0078d4",
    "--wm-shadow": "0 2px 8px rgba(0,0,0,0.15)",
    "--wm-font-family": "system-ui",
  },
  Win98Mock: {
    "--wm-bg": "#008080",
    "--wm-fg": "#000",
    "--wm-border": "#000",
    "--wm-accent": "#c0c0c0",
    "--wm-shadow": "2px 2px 0 #000",
    "--wm-font-family": '"MS Sans Serif", sans-serif',
  },
};

export type ScalePreset = 1.0 | 1.5;

export const SCALE_PRESETS: ScalePreset[] = [1.0, 1.5];
