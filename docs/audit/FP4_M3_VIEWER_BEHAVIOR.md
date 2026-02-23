# FP4 M3 — Viewers Behavior Hardening: Playlist + Prev/Next Loop + Media Controls

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** implement → gate  
**Role:** @Engineer

---

## 1. Scope

- Build virtual playlist from same-type files in the same directory
- Prev/Next as circular doubly-linked list (wrap around)
- Image Viewer: `<img src="signedUrl">` (no fetch unless needed)
- Media Player: `<audio>/<video> src="signedUrl">` with:
  - Play: no-op if already playing
  - Pause: no-op if already paused; keep position
  - Stop: always pause and reset to 0
  - Volume slider 0..100 and Mute toggle preserving previous volume

---

## 2. Implementation Summary

| Component                           | Change                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `front/lib/fp4/playlist.ts`         | `nextIndex`, `prevIndex` wrap-around; `filterMediaItems`, `sortByLocaleCompare` |
| `front/lib/fp4/MediaPlayerState.ts` | play/pause/stop/volume/mute state machine                                       |
| `front/apps/explorer/main.ts`       | `buildPlaylistAndOpen` builds playlist from same-type files in dir              |
| `front/apps/media-player/main.ts`   | `syncMediaToState()` applies volume when loading new media                      |
| `front/apps/image-viewer/main.ts`   | Uses `<img src="signedUrl">`                                                    |

---

## 3. Test Outputs

### Unit Tests (viewer-related)

```
✓ front/__tests__/fp4/playlist-nav.test.ts (6 tests)
  nextIndex/prevIndex wrap-around, cyclic with 1 item

✓ front/__tests__/fp4/playlist-filter-sort.test.ts (7 tests)
  filter by ext, sort by locale, limit 100

✓ front/__tests__/fp4/media-player-state.test.ts (12 tests)
  play/pause/stop, volume 0..100, mute preserves previous

✓ front/__tests__/fp4/media-player-m2.test.ts (14 tests)
  T-FP4-MP-PLAYLIST, T-FP4-MP-NEXT-PREV, T-FP4-MP-PLAY-PAUSE-STOP, T-FP4-MP-VOLUME-MUTE

✓ front/__tests__/fp4/viewer-open-file-sets-src.test.ts (2 tests)
  T-FP4-VIEWER-OPEN-FILE, T-FP4-M3-PLAYLIST (Image Viewer OPEN_FILE with playlist enables Prev/Next)

✓ front/__tests__/fp4/media-player-playlist-m3.test.ts (1 test)
  T-FP4-M3-MP-PLAYLIST: OPEN_FILE with 2+ items enables Prev/Next
```

### Full Unit Suite

```
Test Files  14 passed (14)
     Tests  97 passed (97)
```

---

## 4. Exit Criteria

| Criterion                                                   | Status   |
| ----------------------------------------------------------- | -------- |
| Virtual playlist from same-type files in dir                | ✓        |
| Prev/Next wrap-around (circular)                            | ✓        |
| Image Viewer uses `<img src="signedUrl">`                   | ✓        |
| Media Player play/pause/stop/volume/mute                    | ✓        |
| Unit tests for playlist ordering and wrap-around            | ✓        |
| Unit tests for control state machine                        | ✓        |
| Integration test: OPEN_FILE with playlist enables Prev/Next | ✓        |
| All viewer-related unit tests green                         | ✓        |
| Manual spot-check: open image/audio/video, prev/next cycles | (manual) |

---

## 5. Manual Spot-Check Notes

1. Open Explorer, navigate to a folder with multiple images (e.g. `My Documents/Images`)
2. Double-click an image → Image Viewer opens
3. Prev/Next buttons enabled; click to cycle through same-type files
4. Repeat for audio (e.g. `My Documents/Music`) and video (`My Documents/Video`)
5. Media Player: verify Play/Pause/Stop, volume slider, Mute toggle
