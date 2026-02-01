/**
 * Icon Build Pipeline
 * 
 * Generates 16x16 and 48x48 icons from 32x32 source icons using
 * nearest-neighbor scaling (pixel-art friendly).
 * 
 * Source: front/public/icons/<theme>/32x32/
 * Output: front/public/icons/<theme>/{16x16,48x48}/
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_SIZE = 32;
const TARGET_SIZES = [
  { size: 16, scale: 0.5 },
  { size: 48, scale: 1.5 },
];

const THEME = 'chicago95-default';
const BASE_DIR = path.join(__dirname, '..', 'public', 'icons', THEME);
const SOURCE_DIR = path.join(BASE_DIR, '32x32');

/**
 * Round to nearest integer (nearest-neighbor scaling)
 */
function roundNearest(value) {
  return Math.round(value);
}

/**
 * Scale a numeric value by the given factor
 */
function scaleValue(value, factor) {
  return roundNearest(value * factor);
}

/**
 * Scale SVG content from 32x32 to target size
 * Uses nearest-neighbor scaling for pixel-art quality
 */
function scaleSVG(svgContent, targetSize, scaleFactor) {
  // First, scale all numeric attributes in rect elements only
  // Matches: <rect ... x="N" y="N" width="N" height="N" ... />
  let scaled = svgContent.replace(
    /<rect([^>]*)>/g,
    (match, attrs) => {
      // Scale x, y, width, height attributes within rect tags
      const scaledAttrs = attrs.replace(
        /\b(x|y|width|height)="(\d+(?:\.\d+)?)"/g,
        (attrMatch, attr, value) => {
          const numValue = parseFloat(value);
          const scaledValue = scaleValue(numValue, scaleFactor);
          return `${attr}="${scaledValue}"`;
        }
      );
      return `<rect${scaledAttrs}>`;
    }
  );

  // Then replace SVG root width and height attributes (must come after rect scaling)
  scaled = scaled.replace(
    /<svg([^>]*)\s+width="\d+"\s+height="\d+"([^>]*)>/,
    `<svg$1 width="${targetSize}" height="${targetSize}"$2>`
  );
  
  // Fallback if width/height are in different order
  if (!scaled.includes(`width="${targetSize}"`)) {
    scaled = scaled.replace(
      /width="\d+"/,
      `width="${targetSize}"`
    );
  }
  if (!scaled.includes(`height="${targetSize}"`)) {
    scaled = scaled.replace(
      /height="\d+"/,
      `height="${targetSize}"`
    );
  }

  // Ensure shape-rendering="crispEdges" is present for pixel-art quality
  if (!scaled.includes('shape-rendering="crispEdges"')) {
    scaled = scaled.replace(
      /<svg([^>]*)>/,
      '<svg$1 shape-rendering="crispEdges">'
    );
  }

  return scaled;
}

/**
 * Build icons for all target sizes
 */
function buildIcons() {
  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Get all SVG files from source directory
  const sourceFiles = fs.readdirSync(SOURCE_DIR)
    .filter(file => file.endsWith('.svg'))
    .sort();

  if (sourceFiles.length === 0) {
    console.error(`❌ No SVG files found in ${SOURCE_DIR}`);
    process.exit(1);
  }

  console.log(`📦 Found ${sourceFiles.length} source icons in ${SOURCE_DIR}\n`);

  let totalGenerated = 0;
  let totalSkipped = 0;

  // Process each target size
  for (const { size, scale } of TARGET_SIZES) {
    const targetDir = path.join(BASE_DIR, `${size}x${size}`);
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Created directory: ${targetDir}`);
    }

    console.log(`\n🔄 Generating ${size}x${size} icons (scale: ${scale}x)...`);

    // Process each source file
    for (const sourceFile of sourceFiles) {
      const sourcePath = path.join(SOURCE_DIR, sourceFile);
      const targetPath = path.join(targetDir, sourceFile);

      try {
        // Read source SVG
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');

        // Verify source is 32x32
        const widthMatch = sourceContent.match(/width="(\d+)"/);
        const heightMatch = sourceContent.match(/height="(\d+)"/);
        
        if (widthMatch && heightMatch) {
          const width = parseInt(widthMatch[1], 10);
          const height = parseInt(heightMatch[1], 10);
          
          if (width !== SOURCE_SIZE || height !== SOURCE_SIZE) {
            console.warn(`⚠️  Skipping ${sourceFile}: expected ${SOURCE_SIZE}x${SOURCE_SIZE}, got ${width}x${height}`);
            totalSkipped++;
            continue;
          }
        }

        // Scale SVG
        const scaledContent = scaleSVG(sourceContent, size, scale);

        // Write scaled SVG
        fs.writeFileSync(targetPath, scaledContent, 'utf8');
        console.log(`  ✅ ${sourceFile} → ${size}x${size}/${sourceFile}`);
        totalGenerated++;

      } catch (error) {
        console.error(`  ❌ Error processing ${sourceFile}:`, error.message);
        totalSkipped++;
      }
    }
  }

  console.log(`\n✨ Icon build complete!`);
  console.log(`   Generated: ${totalGenerated} icons`);
  if (totalSkipped > 0) {
    console.log(`   Skipped: ${totalSkipped} icons`);
  }
}

// Run
if (require.main === module) {
  buildIcons();
}

module.exports = { buildIcons, scaleSVG };
