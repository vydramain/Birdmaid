/**
 * Generate placeholder icons for Chicago95 theme
 * 
 * Creates simple placeholder SVG files for all icon types.
 */

const fs = require('fs');
const path = require('path');

const sizes = ['16x16', '32x32', '48x48'];
const baseDir = path.join(__dirname, '..', 'public', 'icons', 'chicago95-default');

// Icon types to generate
const iconTypes = [
  // File system
  'file',
  'dir',
  'link',
  // File types
  'file-txt',
  'file-md',
  'file-png',
  'file-jpg',
  'file-gif',
  'file-webp',
  'file-mp4',
  'file-webm',
  'file-ogg',
  'file-html',
  'file-htm',
  'file-app',
  // Apps
  'app-explorer',
  'app-imageviewer',
  'app-videoviewer',
  'app-notepad',
  'app-internetexplorer',
  'app-executor',
  'app-help',
  'app-landing',
  'app-userpanel',
  'app-styleguide',
  // System
  'system-user',
  'system-computer',
  // Fallback
  'unknown',
];

/**
 * Create a simple SVG placeholder icon
 */
function createPlaceholderSVG(size, label) {
  const [width, height] = size.split('x').map(Number);
  const fontSize = Math.max(8, Math.floor(width / 4));
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${fontSize}" fill="#000" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>`;
}

/**
 * Generate placeholder icons
 */
function generateIcons() {
  // Ensure base directory exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  sizes.forEach(size => {
    const sizeDir = path.join(baseDir, size);
    if (!fs.existsSync(sizeDir)) {
      fs.mkdirSync(sizeDir, { recursive: true });
    }

    iconTypes.forEach(type => {
      // Create label from type (e.g., "app-explorer" -> "EX")
      const label = type
        .split('-')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
      
      const svg = createPlaceholderSVG(size, label);
      const filePath = path.join(sizeDir, `${type}.svg`);
      
      fs.writeFileSync(filePath, svg);
      console.log(`Created: ${filePath}`);
    });
  });

  console.log('\n✅ Placeholder icons generated!');
  console.log('Note: These are SVG placeholders. Replace with actual PNG icons later.');
}

// Run
generateIcons();
