/**
 * Icon Theme System
 * 
 * Manages icon themes with basePath and mapping overrides.
 */

import { IconType, IconSize, IconTheme, IconThemeConfig } from './types';

const DEFAULT_THEME = 'chicago95-default';

// Theme registry
const themes: Map<IconTheme, IconThemeConfig> = new Map();

/**
 * Register a theme
 */
export function registerTheme(theme: IconTheme, config: IconThemeConfig): void {
  themes.set(theme, config);
}

/**
 * Get theme config (fallback to default)
 */
function getThemeConfig(theme?: IconTheme): IconThemeConfig {
  const themeName = theme || DEFAULT_THEME;
  const config = themes.get(themeName);
  
  if (config) {
    return config;
  }

  // Default theme: chicago95-default
  return {
    basePath: `/icons/${themeName}`,
  };
}

/**
 * Get icon path for type, size, and theme
 * 
 * Tries PNG first, falls back to SVG (for placeholders)
 */
export function getIconPath(
  type: IconType,
  size: IconSize = '32x32',
  theme?: IconTheme
): string {
  const config = getThemeConfig(theme);
  
  // Check for mapping override
  const mappedType = config.mapping?.[type] || type;
  
  // Build path: {basePath}/{size}/{type}.png (or .svg as fallback)
  // For now, using SVG placeholders - replace with PNG later
  return `${config.basePath}/${size}/${mappedType}.svg`;
}

/**
 * Initialize default theme
 */
export function initDefaultTheme(): void {
  registerTheme(DEFAULT_THEME, {
    basePath: `/icons/${DEFAULT_THEME}`,
  });
}

// Auto-initialize
initDefaultTheme();
