# FP4 M3 — Render/Playback in Sandbox + Surfaced Errors (Evidence)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** build, milestone=M3  
**Roles:** @Engineer + @Compliance

---

## 1. Why It Didn't Render/Play Before

**Image Viewer:** The viewer already set `img.src = initialUrl` and had `onerror`/`onload` handlers. The main blockers were M0–M2: invalid fixtures (placeholder text), handshake timeout ("App not responding"), and listener race. After M1 (fixtures) and M2 (handshake), the flow works. M3 adds **error logging** so load failures are visible in the console instead of only showing "Unable to load image" in the UI.

**Media Player:** Same flow: `audio.src`/`video.src` were set, autoplay with "Press Play" fallback existed. M3 adds **onerror handlers** for audio/video so load failures are logged. Previously, failed loads were silent (no console output).

---

## 2. Evidence: Changed Files

| Path                                                    | Change                                              |
| ------------------------------------------------------- | --------------------------------------------------- |
| `front/apps/image-viewer/main.ts`                       | `console.error` in `img.onerror` with URL           |
| `front/apps/media-player/main.ts`                       | `onerror` for video and audio with `console.error`  |
| `eslint.config.js`                                      | `no-console: off` for image-viewer and media-player |
| `back/__tests__/fp4/playlist-flow.integration.test.ts`  | New: playlist build, next/prev wrap                 |
| `front/__tests__/fp4/viewer-open-file-sets-src.test.ts` | New: T-FP4-M3-LOAD-ERROR (onerror logs)             |

---

## 3. Commands and Exit Codes

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/test-unit.sh`       | 0    |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/smoke.sh`           | 0    |

---

## 4. Tests Added

| Test                        | File                                | Purpose                          |
| --------------------------- | ----------------------------------- | -------------------------------- |
| T-FP4-M3-PLAYLIST-BUILD     | `playlist-flow.integration.test.ts` | list + open-url → playlist N>=1  |
| T-FP4-M3-PLAYLIST-NEXT-PREV | `playlist-flow.integration.test.ts` | next/prev index wrap (cyclic)    |
| T-FP4-M3-LOAD-ERROR         | `viewer-open-file-sets-src.test.ts` | img onerror logs, error UI shown |
