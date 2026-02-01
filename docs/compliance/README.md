# Compliance Documentation

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Asset license compliance guardrails  
**Owner:** @Compliance

## Overview

This directory contains compliance policies and tools to ensure all assets included in the build are open-source redistributable.

## Documents

- **[ASSET_POLICY.md](./ASSET_POLICY.md)** - License policy for build assets
- **[ASSET_PROVENANCE.md](./ASSET_PROVENANCE.md)** - Registry of all assets with license information

## Tools

- **[scripts/check-asset-provenance.cjs](../../scripts/check-asset-provenance.cjs)** - Script to verify all assets are documented

## Usage

### Manual Check

```bash
node scripts/check-asset-provenance.cjs
```

### Pre-commit Hook

The script is automatically run via `lint-staged` when you commit asset files.

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/compliance.yml
name: Asset Compliance

on: [push, pull_request]

jobs:
  check-assets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Check asset provenance
        run: node scripts/check-asset-provenance.cjs
```

Or in `front/package.json`:

```json
{
  "scripts": {
    "lint:assets": "node ../scripts/check-asset-provenance.cjs"
  }
}
```

Then add to CI:

```bash
cd front && npm run lint:assets
```

## Adding New Assets

1. Verify license is in Allowed list (see `ASSET_POLICY.md`)
2. Add entry to `ASSET_PROVENANCE.md`
3. Run check: `node scripts/check-asset-provenance.cjs`
4. Commit both asset and provenance entry

## Questions?

Contact @Compliance for license questions or exceptions.
