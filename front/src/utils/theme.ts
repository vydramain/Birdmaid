/**
 * Theme Helper
 *
 * Utilities for theme switching in Win95 UI.
 * Themes are applied via data-theme attribute on root element.
 *
 * References:
 * - docs/style/THEME_CONTRACT.md: Theme contract
 */

export type Theme = "win95-default" | "win95-high-contrast";

/**
 * Set theme on root element
 *
 * @param theme Theme name or 'default' to remove theme attribute
 */
export function setTheme(theme: Theme | "default") {
  const root = document.documentElement;
  if (theme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/**
 * Get current theme from root element
 *
 * @returns Current theme (defaults to 'win95-default' if no theme set)
 */
export function getTheme(): Theme {
  const theme = document.documentElement.getAttribute("data-theme");
  return (theme as Theme) || "win95-default";
}

/**
 * Check if theme is currently set
 *
 * @returns true if theme is set, false otherwise
 */
export function hasTheme(): boolean {
  return document.documentElement.hasAttribute("data-theme");
}
