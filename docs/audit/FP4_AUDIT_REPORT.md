# FP4 Audit Report — System Viewers & Players

**Date:** 2025-02-23  
**Scope:** FP4 build M5 (Security + Audit)  
**Source:** [FP4.md](../fps/FP4.md), [FP4_SECURITY_DOD.md](../../archive/FP4/temp_docs/FP4_SECURITY_DOD.md)

---

## 1. Commands → Exit Codes (fact)

| Command                      | Exit | Result                                     |
| ---------------------------- | ---- | ------------------------------------------ |
| `git status --porcelain`     | 0    | Non-empty (modified + untracked FP4 files) |
| `./infra/smoke.sh`           | 0    | PLATFORM OK                                |
| `./infra/test-lint.sh`       | 0    | Lint + format green                        |
| `./infra/test-unit.sh`       | 0    | 64 tests passed (8 files)                  |
| `./infra/test-api-fp.sh FP4` | 0    | 12 tests passed (3 files)                  |
| `./infra/gate.sh FP4`        | 0    | GATE OK                                    |

**Note:** `git status --porcelain` empty is required for release PASS. Current state has uncommitted FP4 changes.

---

## 2. Security DoD Verification

### 2.1 Sandbox Flags

| App         | Expected             | Verified                                                                                                      |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| ImageViewer | `allow-scripts` only | ✓ `front/core/AppHost.tsx:211` — `sandbox={isExplorer ? "allow-scripts allow-same-origin" : "allow-scripts"}` |
| MediaPlayer | `allow-scripts` only | ✓ Same; viewers get `allow-scripts` only                                                                      |

**Evidence:** `front/core/AppHost.tsx` line 211.

### 2.2 Token Policy

| Rule                                  | Verified                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Viewers never receive token           | ✓ `OpenFilePayload` = `{ initialPath, initialUrl, playlist }` — no token |
| SHELL_CAPS with token → Explorer only | ✓ `createShellCaps` adds `systemToken` only when `isExplorer`            |
| postMessage targetOrigin              | ✓ `sendToSource` uses `event.origin`; never `"*"`                        |

**Evidence:** `front/core/AppHost.tsx`, `front/core/protocol.ts`.

### 2.3 Allowlist

| Layer            | Verified                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| MIME allowlist   | ✓ `front/lib/fp4/handler.ts` — `ALLOWED_MIME` Set (image/png, jpeg, webp, audio/mpeg, video/mp4, webm) |
| Handler registry | ✓ `getHandlerForMime` returns null for non-allowlist                                                   |
| Unsupported MIME | ✓ log only, no handler — `front/apps/explorer/main.ts` console.warn                                    |

**Evidence:** `front/lib/fp4/handler.ts`, `front/__tests__/fp4/unsupported-mime.test.ts`, `front/__tests__/fp4/mime-mapping.test.ts`.

### 2.4 Signed-URL Policy

| Rule                       | Verified                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Explorer requests open-url | ✓ Only Explorer uses `fetchWithToken` for `/api/fs/open-url`                        |
| Viewer loads via URL only  | ✓ ImageViewer/MediaPlayer use `initialUrl` / `playlist[].url` (img/audio/video src) |
| Viewer never calls gateway | ✓ No fetch to api.shell.local in viewer apps                                        |

**Evidence:** `front/apps/explorer/main.ts` (fetchOpenUrl, fetchWithToken), `front/apps/image-viewer/main.ts`, `front/apps/media-player/main.ts`.

### 2.5 postMessage

| Rule                 | Verified                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| OPEN_FILE from Shell | ✓ AppHost sends OPEN_FILE on APP_READY; viewers validate `event.origin` via allowlist |
| No arbitrary origins | ✓ `isAllowedOrigin` in `front/core/protocol.ts`; no `"*"`                             |
| Payload structure    | ✓ `initialPath`, `initialUrl`, `playlist` only; no token                              |

**Evidence:** `front/core/AppHost.tsx`, `front/core/protocol.ts`, `front/apps/image-viewer/main.ts`, `front/apps/media-player/main.ts`.

### 2.6 Explorer-Only list + open-url

| Rule                         | Verified                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| Only Explorer calls open-url | ✓ `fetchOpenUrl` / `fetchWithToken` only in `front/apps/explorer/main.ts` |

**Evidence:** `front/apps/explorer/main.ts` lines 117–128, 323–335.

---

## 3. Evidence (paths / tests / commands)

| Category    | Path / Command                                                                             |
| ----------- | ------------------------------------------------------------------------------------------ |
| Sandbox     | `front/core/AppHost.tsx:211`                                                               |
| Token       | `front/core/protocol.ts` (createShellCaps), `front/core/AppHost.tsx` (OpenFilePayload)     |
| Handler     | `front/lib/fp4/handler.ts`, `front/__tests__/fp4/handler-routing.test.ts`                  |
| MIME        | `front/__tests__/fp4/mime-mapping.test.ts`, `front/__tests__/fp4/unsupported-mime.test.ts` |
| Open-url    | `back/__tests__/fp4/open-url-viewers.integration.test.ts`                                  |
| Unsupported | `back/__tests__/fp4/unsupported-negative.integration.test.ts`                              |
| Gate        | `./infra/gate.sh FP4`                                                                      |

---

## 4. Security Checklist (FP4_SECURITY_DOD §8)

- [x] ImageViewer iframe: sandbox allow-scripts only
- [x] MediaPlayer iframe: sandbox allow-scripts only
- [x] OPEN_FILE: no token in payload
- [x] Handler registry: allowlist only
- [x] Unsupported MIME: log, no handler
- [x] postMessage: allowlist origins, no `"*"`
- [x] Explorer: only app that calls list + open-url for playlist

---

## 5. Final Verdict

**PASS** — subject to clean state for release.

- All Security DoD items verified by code inspection.
- All gate commands (smoke, lint, unit, integration) exit 0.
- `git status --porcelain` non-empty: commit FP4 changes for full release PASS.

**No compromises.** Security controls implemented as specified. T-SANDBOX, T-TOKEN, T-ALLOWLIST covered by implementation + unit/integration tests. T-GATEWAY (viewer fetch blocked) implied by sandbox; no explicit integration test in FP4 scope.

---

## 6. M1 Evidence (2026-02-23)

**Goal:** Fix "App not responding" + signed URL integrity. Red → green.

### 6.1 Tests Added

| Test ID            | File                                                             | Description                                              |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------- |
| T-FP4-IV-URL-200   | `back/__tests__/fp4/image-viewer-signed-url.integration.test.ts` | open-url for sample.webp → fetch(URL) status=200         |
| T-FP4-IV-CTYPE     | same                                                             | Content-Type starts with image/, contains webp           |
| T-FP4-IV-NOT-HTML  | same                                                             | Body is RIFF/WEBP magic, not HTML/XML error              |
| T-FP4-IV-HANDSHAKE | `front/__tests__/fp4/app-host-handshake.test.tsx`                | APP_READY received → placeholder cleared, OPEN_FILE sent |

### 6.2 Fixes Applied

| Area             | Files                                                                      | Change                                                              |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Fixture          | `infra/minio/fixtures/DISK_C/My Documents/Images/sample.webp`              | Replaced text placeholder with real WebP (ImageMagick 1x1 red)      |
| Early APP_READY  | `front/apps/image-viewer/index.html`, `front/apps/media-player/index.html` | Inline script sends APP_READY before module load; buffers OPEN_FILE |
| OPEN_FILE buffer | `front/apps/image-viewer/main.ts`, `front/apps/media-player/main.ts`       | Process `__fp4PendingOpenFile` if OPEN_FILE arrived before module   |
| Format           | `.prettierignore`                                                          | Added `*.har` to avoid format:check failure on HAR captures         |

### 6.3 Commands + Exit Codes (post-M1)

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/smoke.sh`           | 0    |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/test-unit.sh`       | 0    |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/gate.sh FP4`        | 0    |

**Unit:** 65 tests (9 files). **Integration:** 15 tests (4 files).

---

## 7. M2 Evidence (2026-02-23)

**Goal:** MediaPlayer audio/video controls + playlist prev/next. Red → green.

### 7.1 Tests Added

| Test ID                  | File                                          | Description                                                     |
| ------------------------ | --------------------------------------------- | --------------------------------------------------------------- |
| T-FP4-MP-PLAYLIST        | `front/__tests__/fp4/media-player-m2.test.ts` | Virtual list from same-type files, limit 100                    |
| T-FP4-MP-NEXT-PREV       | same                                          | next/prev cyclic (wrap last→first, first→last)                  |
| T-FP4-MP-PLAY-PAUSE-STOP | same                                          | State and position (stop→stopped, play from stopped→playing)    |
| T-FP4-MP-VOLUME-MUTE     | same                                          | Mute saves old value; slider 0..100; slider while muted→restore |

### 7.2 Fixes Applied

| Area        | Files                               | Change                                                                     |
| ----------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Volume/mute | `front/lib/fp4/MediaPlayerState.ts` | setVolume: when muted, update \_volumeBeforeMute only (for unmute restore) |

### 7.3 Commands + Exit Codes (post-M2)

| Command                      | Exit |
| ---------------------------- | ---- |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/test-unit.sh`       | 0    |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/gate.sh FP4`        | 0    |

**Unit:** 79 tests (10 files). **Integration:** 15 tests (4 files).

---

## 8. M3 Evidence (2026-02-23)

**Goal:** Stabilize routing "double click in Explorer → MIME → default app → open with correct initial file + playlist".

### 8.1 Tests Added

| Test ID                 | File                                           | Description                                                      |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| T-FP4-MIME-MAP          | `front/__tests__/fp4/mime-routing-m3.test.tsx` | mime lookup by ext; image/audio/video; unknown → denied          |
| T-FP4-DEFAULT-APP       | same                                           | path → ImageViewer/MediaPlayer; unknown → null                   |
| T-FP4-OPEN-FILE-PAYLOAD | same                                           | payload has initialPath, initialUrl, playlist; no token; sandbox |

### 8.2 Fixes Applied

No code changes required. Routing already correct; tests verify contract.

### 8.3 Commands + Exit Codes (post-M3)

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/smoke.sh`           | 0    |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/test-unit.sh`       | 0    |
| `./infra/test-api-fp.sh FP4` | 0    |

**Unit:** 90 tests (11 files). **Integration:** 15 tests (4 files).

---

## 9. M4 Clean-state Evidence (2026-02-23)

**Goal:** Repo ready for final PASS audit; clean-state empty; temp docs marked; no new garbage docs.

### 9.1 Edits Applied

| Area              | Files                                                                 | Change                                                                 |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| PROTOCOL_v0       | `docs/core/PROTOCOL_v0.md`                                            | Added: "CANON UPDATE; must be merged into canonical after build"       |
| Temp docs         | `docs/dev/_tmp/M1_FIX_NOTES.md`                                       | Already TEMP (merge/delete on archive FP4)                             |
| .gitignore        | `.gitignore`                                                          | Added `*.har` (HAR captures)                                            |
| Doc links         | `docs/README.md`, `docs/audit/FP4_AUDIT_REPORT.md`, `docs/fps/FP1.md`, `docs/fps/FP2.md`, `docs/fps/FP3.md` | Fixed broken links (archive paths, THEMING_v0→THEMING) |

### 9.2 Verification (post-M4)

| Command                           | Exit |
| --------------------------------- | ---- |
| `git status --porcelain`           | 0 (empty after commit) |
| `node tools/check-doc-links.cjs docs/` | 0    |
| `pnpm lint`                       | 0    |
| `pnpm format:check`               | 0    |
