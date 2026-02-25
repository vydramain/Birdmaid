# FP4 Media Player Layout + Seek Hotfix — M0 Audit

> **FP:** FP4  
> **Mode:** build (hotfix)  
> **Date:** 2026-02-26

---

## 1. Reproduce

**Steps:** Open sample.mp4 in Media Player, resize window small/large.

**Observed:** Video overlaps controls when window is resized. Controls may be obscured or pushed off-screen.

---

## 2. Root Cause (CSS/DOM)

| Issue              | Location                                   | Detail                                                                  |
| ------------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| Controls not fixed | `.player-controls`                         | No `flex: 0 0 auto` — can shrink in flex column                         |
| Overlays in flow   | `#player-press-play`, `#player-load-error` | In flex flow as siblings; take space, affect layout                     |
| Root height        | `.player-root`                             | Has `flex: 1` but no `height: 100%` — in iframe may not fill            |
| Missing seek       | N/A                                        | No timeline bar or `computeSeekTime`; FP4 originally read-only progress |

**Current layout:** `player-root` (flex column) → `player-video-area` (flex:1), `player-audio-area`, `player-press-play`, `player-load-error`, `player-controls`. Video area and controls compete for space; controls lack `flex-shrink: 0`.

---

## 3. File Paths to Change

| File                                              | Change                                                                                                                                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `front/apps/media-player/index.html`              | Flex layout: playerRoot height:100%, mediaViewport flex:1 min-height:0, controls flex:0 0 auto; move press-play/load-error into video area as overlays (or keep but ensure controls last) |
| `front/apps/media-player/main.ts`                 | Add timeline bar + thumb; seek logic: `computeSeekTime`, onloadedmetadata, ontimeupdate, pointerdown/move/up; disable when duration not finite                                            |
| `front/__tests__/fp4/media-player-hotfix.test.ts` | Add computeSeekTime unit tests, duration NaN/Infinity, layout DOM assertions                                                                                                              |
| `front/lib/fp4/` (optional)                       | Extract `computeSeekTime` to util if shared                                                                                                                                               |

---

## 4. Gate Baseline (pre-fix)

| Command                  | Exit                               |
| ------------------------ | ---------------------------------- |
| `git status --porcelain` | 0 (empty)                          |
| `./infra/smoke.sh`       | 0                                  |
| `./infra/test-lint.sh`   | 0                                  |
| `./infra/test-unit.sh`   | 0 (after min-size 320×240 restore) |

---

## 5. Minimal Patch Plan

1. **M1 (TESTS-RED):** Add computeSeekTime unit tests, duration NaN/Infinity disabled, layout tests (root overflow hidden, controls last child, flex column).
2. **M2 (IMPLEMENT layout):** Refactor index.html per spec; make layout tests green.
3. **M3 (IMPLEMENT seek):** Add timeline bar, seek logic, video hooks; make seek tests green.
4. **M4 (GATE):** Full FP4 gate; evidence update.
