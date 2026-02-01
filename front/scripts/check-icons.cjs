/**
 * Icon Check Pipeline
 * 
 * Validates that all icons have the correct dimensions and that
 * all 32x32 source icons have corresponding 16x16 and 48x48 versions.
 * 
 * Exits with code 1 if validation fails.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const THEME = 'chicago95-default';
const BASE_DIR = path.join(__dirname, '..', 'public', 'icons', THEME);
const REQUIRED_SIZES = ['16x16', '32x32', '48x48'];
const EXPECTED_DIMENSIONS = {
  '16x16': 16,
  '32x32': 32,
  '48x48': 48,
};

/**
 * Extract dimensions from SVG content
 */
function getSVGDimensions(svgContent) {
  const widthMatch = svgContent.match(/width="(\d+)"/);
  const heightMatch = svgContent.match(/height="(\d+)"/);
  
  if (!widthMatch || !heightMatch) {
    return null;
  }

  return {
    width: parseInt(widthMatch[1], 10),
    height: parseInt(heightMatch[1], 10),
  };
}

/**
 * Get all SVG files in a directory
 */
function getSVGFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .sort();
}

/**
 * Check icons
 */
function checkIcons() {
  const errors = [];
  const warnings = [];

  // Check if base directory exists
  if (!fs.existsSync(BASE_DIR)) {
    errors.push(`Base directory not found: ${BASE_DIR}`);
    console.error(`❌ ${errors[0]}`);
    process.exit(1);
  }

  // Get source files (32x32)
  const sourceDir = path.join(BASE_DIR, '32x32');
  const sourceFiles = getSVGFiles(sourceDir);

  if (sourceFiles.length === 0) {
    errors.push(`No source icons found in ${sourceDir}`);
    console.error(`❌ ${errors[0]}`);
    process.exit(1);
  }

  console.log(`🔍 Checking ${sourceFiles.length} source icons...\n`);

  // Check each size directory
  for (const size of REQUIRED_SIZES) {
    const sizeDir = path.join(BASE_DIR, size);
    const expectedDim = EXPECTED_DIMENSIONS[size];
    
    if (!fs.existsSync(sizeDir)) {
      errors.push(`Size directory missing: ${size}`);
      continue;
    }

    const files = getSVGFiles(sizeDir);
    console.log(`📁 ${size}/: ${files.length} icons`);

    // Check dimensions of each file
    for (const file of files) {
      const filePath = path.join(sizeDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const dims = getSVGDimensions(content);

        if (!dims) {
          errors.push(`${size}/${file}: Could not parse dimensions`);
        } else if (dims.width !== expectedDim || dims.height !== expectedDim) {
          errors.push(
            `${size}/${file}: Expected ${expectedDim}x${expectedDim}, got ${dims.width}x${dims.height}`
          );
        }
      } catch (error) {
        errors.push(`${size}/${file}: Error reading file - ${error.message}`);
      }
    }
  }

  // Check completeness: every 32x32 icon should have 16x16 and 48x48 versions
  console.log(`\n🔗 Checking completeness...`);
  
  const source32Files = getSVGFiles(path.join(BASE_DIR, '32x32'));
  const files16 = getSVGFiles(path.join(BASE_DIR, '16x16'));
  const files48 = getSVGFiles(path.join(BASE_DIR, '48x48'));

  const missing16 = source32Files.filter(f => !files16.includes(f));
  const missing48 = source32Files.filter(f => !files48.includes(f));

  if (missing16.length > 0) {
    errors.push(`Missing 16x16 versions: ${missing16.join(', ')}`);
  }

  if (missing48.length > 0) {
    errors.push(`Missing 48x48 versions: ${missing48.join(', ')}`);
  }

  // Check for orphaned files (exist in 16x16/48x48 but not in 32x32)
  const orphaned16 = files16.filter(f => !source32Files.includes(f));
  const orphaned48 = files48.filter(f => !source32Files.includes(f));

  if (orphaned16.length > 0) {
    warnings.push(`Orphaned 16x16 files (no 32x32 source): ${orphaned16.join(', ')}`);
  }

  if (orphaned48.length > 0) {
    warnings.push(`Orphaned 48x48 files (no 32x32 source): ${orphaned48.join(', ')}`);
  }

  // Report results
  console.log('');

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach(e => console.error(`   ${e}`));
    console.error('');
    process.exit(1);
  }

  console.log('✅ All icons validated successfully!');
  console.log(`   Source icons: ${source32Files.length}`);
  console.log(`   16x16 icons: ${files16.length}`);
  console.log(`   48x48 icons: ${files48.length}`);
}

// Run
if (require.main === module) {
  checkIcons();
}

module.exports = { checkIcons };
