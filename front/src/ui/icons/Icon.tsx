/**
 * Icon Component
 * 
 * Renders an icon with theme support.
 * No inline styles for image-rendering - uses CSS class.
 */

import React from 'react';
import { IconType, IconSize, IconTheme } from './types';
import { getIconPath } from './theme';

export interface IconProps {
  type: IconType;
  size?: IconSize;
  theme?: IconTheme;
  className?: string;
  alt?: string;
  'data-testid'?: string;
}

/**
 * Icon component
 * 
 * Renders an icon image with proper CSS classes.
 * Uses CSS class for image-rendering (no inline styles).
 */
export function Icon({
  type,
  size = '32x32',
  theme,
  className = '',
  alt = '',
  'data-testid': testId,
}: IconProps) {
  const iconPath = getIconPath(type, size, theme);
  
  return (
    <img
      src={iconPath}
      alt={alt || type}
      className={`icon icon-${size} ${className}`}
      data-testid={testId}
    />
  );
}
