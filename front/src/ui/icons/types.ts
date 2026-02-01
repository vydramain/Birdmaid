/**
 * Icon System Types
 * 
 * Defines types for icon system with theme support.
 */

export type IconSize = '16x16' | '32x32' | '48x48';

export type IconType =
  // File system
  | 'file'
  | 'dir'
  | 'link'
  // File types by extension
  | 'file-txt'
  | 'file-md'
  | 'file-png'
  | 'file-jpg'
  | 'file-jpeg'
  | 'file-gif'
  | 'file-webp'
  | 'file-mp4'
  | 'file-webm'
  | 'file-ogg'
  | 'file-html'
  | 'file-htm'
  | 'file-app'
  // Apps
  | 'app-explorer'
  | 'app-imageviewer'
  | 'app-videoviewer'
  | 'app-notepad'
  | 'app-internetexplorer'
  | 'app-executor'
  | 'app-help'
  | 'app-landing'
  | 'app-userpanel'
  | 'app-styleguide'
  // System
  | 'system-user'
  | 'system-computer'
  // Fallback
  | 'unknown';

export type IconTheme = string;

export interface IconThemeConfig {
  basePath: string;
  mapping?: Partial<Record<IconType, string>>;
}

export interface IconResolver {
  resolveForVFSNode(node: { type: 'file' | 'dir'; name: string }): IconType;
  resolveForApp(appId: string): IconType;
}
