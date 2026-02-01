# Asset License Policy

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Define license requirements for all assets included in the build  
**Status:** Active  
**Owner:** @Compliance

## Overview

All assets that are included in the build (icons, fonts, cursors, sounds) **MUST** be open-source redistributable. This policy ensures legal compliance and prevents licensing issues in production builds.

## Scope

This policy applies to all files in:
- `front/public/icons/**`
- `front/public/fonts/**`
- `front/public/cursors/**`
- `front/public/sounds/**`
- Any other assets bundled into the production build

## Allowed Licenses

The following licenses are **ALLOWED** for assets included in the build:

### Code Licenses (for SVG icons, scripts)
- **MIT** (MIT License) - SPDX: `MIT`
- **Apache-2.0** (Apache License 2.0) - SPDX: `Apache-2.0`
- **BSD-2-Clause** (2-Clause BSD License) - SPDX: `BSD-2-Clause`
- **BSD-3-Clause** (3-Clause BSD License) - SPDX: `BSD-3-Clause`
- **ISC** (ISC License) - SPDX: `ISC`
- **Zlib** (zlib License) - SPDX: `Zlib`

### Font Licenses
- **OFL** (SIL Open Font License 1.1) - SPDX: `OFL-1.1`
- **Apache-2.0** (Apache License 2.0) - SPDX: `Apache-2.0`
- **MIT** (MIT License) - SPDX: `MIT`

### Content Licenses (for graphics, icons, sounds)
- **CC0** (Creative Commons Zero - Public Domain) - SPDX: `CC0-1.0`
- **CC-BY-4.0** (Creative Commons Attribution 4.0) - SPDX: `CC-BY-4.0`
- **CC-BY-SA-4.0** (Creative Commons Attribution-ShareAlike 4.0) - SPDX: `CC-BY-SA-4.0`

### System Fonts
- System fonts (e.g., `"MS Sans Serif"`, `Tahoma`, `sans-serif`) that are referenced but not bundled are allowed, as they rely on the user's system.

### External CDN Fonts
- Google Fonts (OFL licensed) are allowed when loaded via CDN, but must be documented in `ASSET_PROVENANCE.md`.

## Blocked Licenses

The following are **BLOCKED** and must not be included in the build:

- **Unknown license** - No license information available
- **Proprietary** - Commercial/proprietary licenses
- **No license** - Files without explicit license
- **CC-BY-NC** (Creative Commons Non-Commercial) - Restricts commercial use
- **CC-BY-ND** (Creative Commons No Derivatives) - Restricts modifications
- **GPL** (for fonts/assets) - Copyleft may conflict with project license
- **Helvetica** (original) - Proprietary font, use open-source alternatives instead

## Reference-Only Assets

The following assets are **reference-only** and must **NOT** be included in the build:

- Screenshots from Windows 95/98 in `docs/design/references/screenshots/**` - Used for visual reference only
- Any proprietary reference materials in `docs/design/references/**`

These files are for design reference and must never be bundled into production builds.

## Open-Source Font Alternatives

If you need a font similar to a proprietary one, use these open-source alternatives:

### Helvetica Alternatives
- **Liberation Sans** (SIL OFL) - Metric-compatible with Helvetica
- **Noto Sans** (OFL) - Google Fonts, comprehensive coverage
- **Open Sans** (Apache 2.0) - Google Fonts, widely used
- **Inter** (SIL OFL) - Modern sans-serif

### MS Sans Serif Alternatives
- System fonts: `system-ui, -apple-system, sans-serif`
- **VT323** (OFL) - Google Fonts, pixel-style
- **Pixelify Sans** (OFL) - Google Fonts, retro pixel font
- **Silkscreen** (OFL) - Google Fonts, pixel font

## Compliance Process

1. **Before adding any asset:**
   - Verify the license is in the Allowed list
   - Add entry to `ASSET_PROVENANCE.md`
   - Run `scripts/check-asset-provenance.cjs` to verify

2. **Pre-commit hook:**
   - Automatically runs `check-asset-provenance.cjs`
   - Blocks commits if any asset is missing from provenance

3. **CI/CD:**
   - Runs asset provenance check on every build
   - Fails build if compliance check fails

## Enforcement

- **Pre-commit:** Script runs automatically via git hooks
- **CI/CD:** Build fails if assets are non-compliant
- **Manual:** Run `node scripts/check-asset-provenance.cjs` anytime

## Helvetica Check

**Status:** ✅ **Helvetica is NOT used in this project**

- No Helvetica font files found in the codebase
- No references to "Helvetica" in code or CSS
- System fonts and Google Fonts (OFL) are used instead

**If you need a Helvetica-like font, use:**
- **Liberation Sans** (SIL OFL) - Metric-compatible with Helvetica
- **Noto Sans** (OFL) - Google Fonts
- **Open Sans** (Apache 2.0) - Google Fonts
- **Inter** (SIL OFL) - Modern alternative

## Questions?

Contact @Compliance for license questions or exceptions.
