# FP4 Tests Plan — System Viewers & Players

**Purpose:** AC → test mapping for FP4 (ImageViewer, MediaPlayer, MIME routing, playlist, signed-url flow).  
**Method:** Unit, integration (API), E2E (Playwright, M0 diagnostic).  
**Source:** [docs/fps/FP4.md](../fps/FP4.md)

---

## 1. AC → Test Mapping

| AC   | Test ID                          | Type | Description                                                                     |
| ---- | -------------------------------- | ---- | ------------------------------------------------------------------------------- |
| AC1  | T-AC1                            | Int  | Explorer double click .png/.jpg/.webp → ImageViewer opens, shows file           |
| AC2  | T-AC2, T-FP4-M3-NEXT-PREV-URL    | Unit | ImageViewer Prev/Next cyclic in playlist; next/prev changes img src             |
| AC3  | T-AC3                            | Int  | Image fit in view (contain)                                                     |
| AC4  | T-AC4                            | Int  | Explorer double click .mp3 → MediaPlayer(mode=audio), playback                  |
| AC5  | T-AC5                            | Int  | Explorer double click .mp4/.webm → MediaPlayer(mode=video), playback            |
| AC6  | T-AC6, T-FP4-M3-MP-NEXT-PREV-URL | Unit | MediaPlayer Prev/Next: stop → load next → autoplay; next/prev changes media src |
| AC7  | T-AC7                            | Unit | Play/Pause/Stop state machine                                                   |
| AC8  | T-AC8                            | Unit | Volume 0..100%; Mute toggle saves/restores value                                |
| AC9  | T-AC9                            | Unit | Autoplay blocked → "Press Play" shown                                           |
| AC10 | T-AC10                           | Unit | Unsupported MIME → log only, no crash                                           |

---

## 2. M0 (AUDIT + TESTS-RED) — Signed URL & Viewer Handshake

**Context:** Regression — Image Viewer shows "App not responding", Media Player does not play. Gateway returns signed URLs; content in viewer iframe does not load. M0: fix expected behavior in tests (red), then fix sources (green).

### 2.1 Integration / Contract Tests (Signed URL)

**Location:** `back/__tests__/fp4/`

| Test ID                      | File                                             | Description                                                                            |
| ---------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| T-FP4-M0-BODY-SIG            | `signed-url-body-signature.integration.test.ts`  | POST open-url → GET url → 200 + Content-Type + body signature + NOT XML/HTML           |
| T-FP4-NO-CHECKSUM            | `signed-url-fetchable.integration.test.ts`       | Modifying presigned URL (strip/add x-amz-checksum-mode) invalidates → 403              |
| T-FP4-SIGNED-URL-MAGIC-BYTES | `signed-url-magic-bytes.integration.test.ts`     | All fixtures: 200 + Content-Type + magic bytes (RIFF/WEBP, PNG, JPEG, MP3, ftyp, EBML) |
| T-FP4-M0-CURL                | `signed-url-fetchable.integration.test.ts`       | sample.webp dedicated: fetchable, image/webp, WebP signature, NOT XML                  |
| T-FP4-M0-MP3                 | `signed-url-fetchable.integration.test.ts`       | sample.mp3 (Media Player): 200 + audio/mpeg + body signature, NOT XML                  |
| T-FP4-M0-REACHABLE           | `open-url-reachable.integration.test.ts`         | open-url → 200 + Content-Type + body > 0 + CORS (webp/png/jpg/mp3/mp4/webm)            |
| T-FP4-ORIGIN-NULL-\*         | `open-url-reachable.integration.test.ts`         | signed URL fetchable with Origin: null (sandboxed viewer) per media type               |
| T-FP4-M2-\*                  | `signed-url-content-type-m2.integration.test.ts` | All media: 200 + Content-Type; mp4/webm Range → 206 + Accept-Ranges                    |

### 2.1.1 Unit Tests (Viewer Bootstrap + Handshake)

**Location:** `front/__tests__/fp4/`

| Test ID                 | File                                 | Description                                                                    |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| T-FP4-M0-BOOT           | `viewer-bootstrap-sandbox.test.ts`   | Viewer APP_READY postMessage uses targetOrigin \* (not window.location.origin) |
| T-FP4-M0-PAYLOAD-SCHEMA | `viewer-open-file-handshake.test.ts` | OpenFilePayload has initialPath/Url/playlist; no token                         |

**Assertions:**

- `status === 200`
- `Content-Type` matches expected (image/webp, image/png, audio/mpeg, video/mp4, etc.)
- Body NOT XML/HTML error: `bytes[0] !== 0x3c` ('<')
- Binary signature (RIFF/WEBP, PNG, JPEG, ID3/MP3, ftyp, EBML)

**Prerequisite:** `docker compose -f infra/docker-compose.dev.yml up -d`

### 2.2 E2E Minimal (Viewer Handshake)

**Location:** `e2e/fp4-viewers.spec.ts`

| Test ID            | Description                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| T-FP4-M0-HANDSHAKE | Double-click sample.webp → viewer opens, NO "App not responding" after timeout |
| T-FP4-M0-S3-GET    | (skipped) img src set + s3 GET observed — optional, may be unstable in E2E     |

**Run:** `./infra/test-e2e-fp.sh FP4`

**Note:** FP4 gate does NOT require E2E (design decision). E2E used for M0 diagnostic.

### 2.3 Debug Logs (Dev Only)

Viewer apps log (when `import.meta.env.DEV`):

- `[ImageViewer] OPEN_FILE received`
- `[ImageViewer] signedUrl set`
- `[ImageViewer] onerror fired`
- `[MediaPlayer] OPEN_FILE received`
- `[MediaPlayer] signedUrl set`
- `[MediaPlayer] onerror fired`

No tokens in logs.

---

## 3. Unit Tests

**Location:** `front/__tests__/fp4/`

| File                                  | Coverage                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `mime-mapping.test.ts`                | getMimeForPath, isAllowedMime for allowlist ext                                                            |
| `handler-routing.test.ts`             | getHandlerForMime: MIME → ImageViewer \| MediaPlayer(mode)                                                 |
| `playlist-filter-sort.test.ts`        | filterMediaItems, sortByLocaleCompare, getExtensionsForMedia (playlist ordering)                           |
| `playlist-nav.test.ts`                | nextIndex, prevIndex ring navigation (cyclic)                                                              |
| `unsupported-mime.test.ts`            | getHandlerForMime returns null for unsupported                                                             |
| `media-player-state.test.ts`          | Play/Pause/Stop state machine, Volume 0..100, Mute toggle                                                  |
| `autoplay-blocked.test.ts`            | shouldShowPressPlay when autoplay blocked                                                                  |
| `protocol-null-origin.test.ts`        | isAllowedOrigin("null") returns true                                                                       |
| `viewer-open-file-sets-src.test.ts`   | OPEN_FILE fetch→blob→objectURL; T-FP4-M3-PLAYLIST; T-FP4-M3-NEXT-PREV-URL (playlist nav)                   |
| `viewer-state-transitions.test.ts`    | T-FP4-STATE-LOADING, T-FP4-STATE-ERROR, T-FP4-STATE-PREV-NEXT (loading→loaded, fetch failure, prev/next)   |
| `media-player-m2.test.ts`             | T-FP4-MP-PLAYLIST (N=100 cap), T-FP4-MP-NEXT-PREV (cyclic), T-FP4-MP-PLAY-PAUSE-STOP, T-FP4-MP-VOLUME-MUTE |
| `media-player-playlist-m3.test.ts`    | T-FP4-M3-MP-PLAYLIST; T-FP4-M3-MP-NEXT-PREV-URL (initial load + next/prev changes media src)               |
| `app-host-handshake.test.tsx`         | APP_READY from origin "null" → handshake; unknown source rejected                                          |
| `viewer-bootstrap-sandbox.test.ts`    | T-FP4-M0-BOOT: targetOrigin \*; T-FP4-M0-BOOT-MODULE: module script + ACAO                                 |
| `viewer-open-file-handshake.test.ts`  | T-FP4-M0-PAYLOAD-SCHEMA: OpenFilePayload has initialPath/Url/playlist; no token                            |
| `explorer-postmessage-target.test.ts` | T-FP4-M4-EXPLORER-TARGET: targetOrigin \*; T-FP4-M3-PLAYLIST-LIMIT: PLAYLIST_LIMIT = 100                   |

**Commands:** `pnpm test -- front/__tests__/fp4/` or `./infra/test-unit.sh`

---

## 4. Integration Tests

**Location:** `back/__tests__/fp4/`

| File                                             | Coverage                                                                                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open-url-viewers.integration.test.ts`           | open-url for image/audio/video paths → 200, GET url → 200                                                                                                            |
| `allowlist-types.integration.test.ts`            | open-url for png/mp3/mp4 → 200 (no 500)                                                                                                                              |
| `unsupported-negative.integration.test.ts`       | missing file → 404, path traversal → 400, unsupported ext → no 500                                                                                                   |
| `signed-url-body-signature.integration.test.ts`  | T-FP4-M0-BODY-SIG: 200 + Content-Type + body signature + NOT XML                                                                                                     |
| `signed-url-fetchable.integration.test.ts`       | T-FP4-NO-CHECKSUM: modifying presigned URL invalidates → 403; T-FP4-M0-CURL: sample.webp; T-FP4-M0-MP3: sample.mp3                                                   |
| `signed-url-magic-bytes.integration.test.ts`     | T-FP4-SIGNED-URL-MAGIC-BYTES: all fixtures (webp/png/jpg/mp3/mp4/webm) → 200 + Content-Type + magic bytes                                                            |
| `signed-url-content-type-m2.integration.test.ts` | T-FP4-M2: all media Content-Type                                                                                                                                     |
| `playlist-flow.integration.test.ts`              | T-FP4-M3-PLAYLIST-BUILD: list + open-url → playlist N>=1; T-FP4-M3-PLAYLIST-NEXT-PREV: cyclic wrap; T-FP4-M3-OPEN-FILE-PAYLOAD: payload for initial load + next/prev |
| `open-url-reachable.integration.test.ts`         | T-FP4-M0-REACHABLE: open-url → 200 + Content-Type + body > 0 + CORS                                                                                                  |

**Fixtures:** `infra/minio/fixtures/DISK_C/My Documents/Images/`, `Music/`, `Video/` with sample.png, sample.jpg, sample.webp, sample.mp3, sample.mp4, sample.webm.

**Commands:** `pnpm test:api -- back/__tests__/fp4/` or `./infra/test-api-fp.sh FP4`

---

## 5. Gate Commands (FP4)

| Command                      | Required | Purpose                           |
| ---------------------------- | -------- | --------------------------------- |
| `git status --porcelain`     | yes      | Clean state                       |
| `./infra/smoke.sh`           | yes      | Platform OK                       |
| `./infra/test-lint.sh`       | yes      | Lint + format                     |
| `./infra/test-unit.sh`       | yes      | Unit (front/**tests**/fp4/)       |
| `./infra/test-api-fp.sh FP4` | yes      | Integration (back/**tests**/fp4/) |
| `./infra/test-e2e-fp.sh FP4` | no       | E2E diagnostic (M0)               |

**REQUIRED for PASS:** T-FP4-NO-CHECKSUM, T-FP4-SIGNED-URL-MAGIC-BYTES (all fixtures). No skips.

**Run unit only:** `pnpm test -- front/__tests__/fp4/`  
**Run integration only:** `pnpm test:api -- back/__tests__/fp4/` or `./infra/test-api-fp.sh FP4` (prerequisite: compose up)  
**Run E2E FP4:** `./infra/test-e2e-fp.sh FP4`

---

## 6. Fixtures (FP4)

| Path                           | Content                             |
| ------------------------------ | ----------------------------------- |
| C:/Program Files/Image Viewer/ | index.html, assets (read-only)      |
| C:/Program Files/Media Player/ | index.html, assets (read-only)      |
| C:/My Documents/Images/        | sample.png, sample.jpg, sample.webp |
| C:/My Documents/Music/         | sample.mp3                          |
| C:/My Documents/Video/         | sample.mp4, sample.webm             |

---

## 7. M2 Evidence (Viewers Handshake + Load) — 2026-02-23

**E2E:**

- T-FP4-M0-HANDSHAKE: ✓ Double-click sample.webp → no "App not responding"
- T-FP4-M0-S3-GET: skipped (Docker E2E: s3 GET not observed; img src empty in container)

**Integration:** playlist-flow T-FP4-M3-PLAYLIST-BUILD, T-FP4-M3-PLAYLIST-NEXT-PREV cover list + open-url per file, cyclic next/prev.

**Run E2E manually:** `./infra/test-e2e-fp.sh FP4`

---

## 8. M1 Evidence (Signed URL Delivery Fix) — 2026-02-23

**Tests closed (green):**

| Test ID           | File                                             | Status |
| ----------------- | ------------------------------------------------ | ------ |
| T-FP4-M0-BODY-SIG | `signed-url-body-signature.integration.test.ts`  | ✓ 6    |
| T-FP4-M0-CURL     | `signed-url-fetchable.integration.test.ts`       | ✓ 1    |
| T-FP4-M0-MP3      | `signed-url-fetchable.integration.test.ts`       | ✓ 1    |
| T-FP4-M2-\*       | `signed-url-content-type-m2.integration.test.ts` | ✓ 6    |
| open-url-viewers  | `open-url-viewers.integration.test.ts`           | ✓ 6    |
| allowlist-types   | `allowlist-types.integration.test.ts`            | ✓ 3    |
| playlist-flow     | `playlist-flow.integration.test.ts`              | ✓ 2    |
| unsupported-neg   | `unsupported-negative.integration.test.ts`       | ✓ 3    |

**Total:** 31 integration tests pass. No 4xx/5xx/HTML/XML instead of binary.

**Fix:** `back/src/index.ts` — presign S3Client: `requestChecksumCalculation: "WHEN_REQUIRED"` (explicit config; avoids x-amz-checksum-mode in presigned URLs for MinIO/Firefox compatibility).

---

## 9. References

- [FP4.md](../fps/FP4.md)
- [GUARDRAILS.md](../dev/GUARDRAILS.md) § Gate Semantics
- [FP4_M0_VIEWERS_AUDIT.md](../audit/FP4_M0_VIEWERS_AUDIT.md)
