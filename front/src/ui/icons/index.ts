/**
 * Icon System
 * 
 * Unified icon system with theme support.
 */

export { Icon } from './Icon';
export type { IconProps } from './Icon';
export { getIconPath } from './theme';
export { registerTheme } from './theme';
export { resolveIconForVFSNode, resolveIconForApp } from './resolver';
export type { IconType, IconSize, IconTheme, IconThemeConfig } from './types';

/**
 * Convenience function: getIcon(type, size, theme)
 * 
 * Returns the icon path for given type, size, and theme.
 */
export function getIcon(
  type: IconType,
  size: IconSize = '32x32',
  theme?: IconTheme
): string {
  return getIconPath(type, size, theme);
}
