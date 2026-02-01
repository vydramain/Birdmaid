/**
 * Icon Resolver
 * 
 * Resolves icon types for VFS nodes and apps.
 */

import { IconType } from './types';
import { VFSNode } from '../../os/fs/VirtualFileSystem';

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDot).toLowerCase();
}

/**
 * Resolve icon type for VFS node
 */
export function resolveIconForVFSNode(node: VFSNode, path?: string): IconType {
  if (node.type === 'dir') {
    // Check if this is a root-level system folder (Disk A, Disk B, Disk C)
    const name = node.name;
    if (name === 'Disk A' || name === 'Disk B' || name === 'Disk C') {
      // Check if it's at root level (path is '/' or undefined)
      if (!path || path === '/') {
        return 'disk';
      }
    }
    return 'dir';
  }

  // Check for .url link files
  if (node.name.endsWith('.url')) {
    return 'link';
  }

  // Resolve by extension
  const ext = getExtension(node.name);
  
  switch (ext) {
    case '.txt':
      return 'file-txt';
    case '.md':
      return 'file-md';
    case '.png':
      return 'file-png';
    case '.jpg':
    case '.jpeg':
      return 'file-jpg';
    case '.gif':
      return 'file-gif';
    case '.webp':
      return 'file-webp';
    case '.mp4':
    case '.webm':
    case '.ogg':
      return 'file-mp4';
    case '.html':
    case '.htm':
      return 'file-html';
    case '.app':
      return 'file-app';
    default:
      return 'file';
  }
}

/**
 * Resolve icon type for app ID
 */
export function resolveIconForApp(appId: string): IconType {
  const appIconMap: Record<string, IconType> = {
    'explorer': 'app-explorer',
    'imageviewer': 'app-imageviewer',
    'videoviewer': 'app-videoviewer',
    'notepad': 'app-notepad',
    'internetexplorer': 'app-internetexplorer',
    'executor': 'app-executor',
    'help': 'app-help',
    'landing': 'app-landing',
    'userpanel': 'app-userpanel',
    'styleguide': 'app-styleguide',
  };

  return appIconMap[appId] || 'unknown';
}
