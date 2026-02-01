# Icon Build Pipeline

**Version:** 1.0  
**Purpose:** Automated generation of icon sizes from canonical 32x32 source icons  
**Status:** Active

## Overview

The icon build pipeline automatically generates 16x16 and 48x48 icon variants from 32x32 source icons using nearest-neighbor scaling (pixel-art friendly, no blur).

## Directory Structure

```
front/public/icons/<theme>/
├── 16x16/     # Generated from 32x32 (0.5x scale)
├── 32x32/     # Canonical source icons (manually created)
└── 48x48/     # Generated from 32x32 (1.5x scale)
```

**Current theme:** `chicago95-default`

## Canonical Source

**Source directory:** `front/public/icons/chicago95-default/32x32/`

All new icons must be added to the 32x32 directory. The build pipeline will automatically generate the 16x16 and 48x48 versions.

## Adding New Icons

1. **Create the 32x32 source icon:**
   - Add your SVG file to `front/public/icons/chicago95-default/32x32/`
   - Ensure the SVG has `width="32" height="32"` attributes
   - Use `shape-rendering="crispEdges"` for pixel-art quality
   - Use precise pixel coordinates (rect elements work best)

2. **Run the build pipeline:**
   ```bash
   npm run icons:build
   ```

3. **Verify the output:**
   ```bash
   npm run icons:check
   ```

The build script will:
- Generate 16x16 version (0.5x scale, nearest-neighbor)
- Generate 48x48 version (1.5x scale, nearest-neighbor)
- Preserve `shape-rendering="crispEdges"` for pixel-art quality

## Scaling Algorithm

The pipeline uses **nearest-neighbor scaling** to preserve pixel-art aesthetics:

- **32→16:** All coordinates and dimensions multiplied by 0.5, rounded to nearest integer
- **32→48:** All coordinates and dimensions multiplied by 1.5, rounded to nearest integer

This ensures:
- No anti-aliasing or blur
- Sharp pixel edges
- Consistent visual style across sizes

## NPM Scripts

### `npm run icons:build`

Generates 16x16 and 48x48 icons from 32x32 source icons.

**What it does:**
- Reads all SVG files from `32x32/` directory
- Validates source icons are 32x32
- Generates scaled versions in `16x16/` and `48x48/` directories
- Preserves pixel-art quality with nearest-neighbor scaling

**When to run:**
- After adding new 32x32 icons
- After modifying existing 32x32 icons
- Before committing icon changes

### `npm run icons:check`

Validates icon dimensions and completeness.

**What it checks:**
- All icons have correct dimensions (16x16, 32x32, 48x48)
- Every 32x32 icon has corresponding 16x16 and 48x48 versions
- No orphaned files (16x16/48x48 without 32x32 source)

**Exit codes:**
- `0`: All checks passed
- `1`: Validation failed (missing sizes, wrong dimensions, etc.)

**When to run:**
- In CI/CD pipelines
- As a pre-commit hook
- Before releasing

## CI/Pre-commit Integration

### Recommended Pre-commit Hook

Add to `.husky/pre-commit` or your pre-commit configuration:

```bash
#!/bin/sh
cd front
npm run icons:check
```

This ensures that:
- All icons are properly generated before commit
- No missing or incorrectly sized icons are committed

### Alternative: Auto-generate on Commit

If you prefer automatic generation:

```bash
#!/bin/sh
cd front
npm run icons:build
git add public/icons/
```

**Note:** This approach requires committing generated files, which may increase repository size.

## Icon Format Requirements

### Source Icons (32x32)

- **Format:** SVG
- **Dimensions:** Exactly 32x32 pixels
- **Attributes:** Must include `width="32" height="32"`
- **Rendering:** Should include `shape-rendering="crispEdges"` for pixel-art
- **Structure:** Prefer `<rect>` elements with precise pixel coordinates

### Example Source Icon

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<svg version="1.1" width="32" height="32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <rect x="0" y="0" width="32" height="32" fill="#C0C0C0" />
  <!-- More rect elements... -->
</svg>
```

## Troubleshooting

### "Source directory not found"

Ensure you're running the script from the `front/` directory, or that `front/public/icons/chicago95-default/32x32/` exists.

### "Expected 32x32, got XxY"

The source icon has incorrect dimensions. Fix the SVG `width` and `height` attributes to be exactly 32.

### "Missing 16x16/48x48 versions"

Run `npm run icons:build` to generate the missing sizes.

### Icons look blurry after scaling

The build script uses nearest-neighbor scaling, which should prevent blur. If icons still look blurry:
- Check that source icons use `shape-rendering="crispEdges"`
- Verify source icons use integer pixel coordinates
- Ensure browser/rendering engine respects `shape-rendering` attribute

## Technical Details

### Implementation

- **Language:** Node.js (CommonJS)
- **Dependencies:** None (uses built-in `fs` and `path` modules)
- **Scaling method:** Regex-based coordinate transformation with nearest-neighbor rounding
- **File format:** SVG (vector graphics, preserves quality at any scale)

### Why SVG?

- Scalable without quality loss
- Small file size for pixel-art icons
- Easy to manipulate programmatically
- Browser-native support

### Why Nearest-Neighbor?

- Preserves pixel-art aesthetic
- No anti-aliasing artifacts
- Sharp edges at all sizes
- Consistent with retro/Windows 95 style

## Related Documentation

- [Icon Types](../../front/src/ui/icons/types.ts) - TypeScript definitions for icon types
- [Icon Theme](../../front/src/ui/icons/theme.ts) - Theme configuration
- [Asset Provenance](../compliance/ASSET_PROVENANCE.md) - License and source tracking
