# M1 Fix Notes — TEMP(FP4.1)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Scope:** ImageViewer "App not responding" + signed URL integrity

## Root Causes Addressed

1. **Handshake timeout:** ImageViewer sent APP_READY only after main.ts + playlist.ts loaded. In dev (Vite ESM), chain exceeded 2000ms.
2. **sample.webp fixture:** Was text placeholder, not valid WebP → T-FP4-IV-NOT-HTML failed.

## Fixes

- Early APP_READY: inline script in index.html runs before module; sends APP_READY immediately.
- OPEN_FILE buffer: inline script also listens for OPEN_FILE; main.ts processes `__fp4PendingOpenFile` on load.
- sample.webp: `convert -size 1x1 xc:red sample.webp` (ImageMagick).
- .prettierignore: `*.har` added for HAR captures.

## Verification

`./infra/gate.sh FP4` → GATE OK.
