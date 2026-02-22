# FP4 Tests Plan — System Viewers & Players

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + canonical docs/core/PROTOCOL_v0.md

**Purpose:** AC → test mapping for FP4 (ImageViewer, MediaPlayer, MIME routing, playlist, signed-url flow).  
**Method:** Unit, integration. **E2E:** OUT of scope (design decision).  
**Source:** [docs/fps/FP4.md](../fps/FP4.md)

---

## 1. AC → Test Mapping

| AC   | Test ID | Type | Description                                                           |
| ---- | ------- | ---- | --------------------------------------------------------------------- |
| AC1  | T-AC1   | Int  | Explorer double click .png/.jpg/.webp → ImageViewer opens, shows file |
| AC2  | T-AC2   | Int  | ImageViewer Prev/Next cyclic in playlist                              |
| AC3  | T-AC3   | Int  | Image fit in view (contain)                                           |
| AC4  | T-AC4   | Int  | Explorer double click .mp3 → MediaPlayer(mode=audio), playback        |
| AC5  | T-AC5   | Int  | Explorer double click .mp4/.webm → MediaPlayer(mode=video), playback  |
| AC6  | T-AC6   | Int  | MediaPlayer Prev/Next: stop → load next → autoplay                    |
| AC7  | T-AC7   | Unit | Play/Pause/Stop state machine                                         |
| AC8  | T-AC8   | Unit | Volume 0..100%; Mute toggle saves/restores value                      |
| AC9  | T-AC9   | Unit | Autoplay blocked → "Press Play" shown                                 |
| AC10 | T-AC10  | Unit | Unsupported MIME → log only, no crash                                 |

---

## 2. Unit Tests

**Location:** `front/__tests__/fp4/`

| File                           | Coverage                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `mime-mapping.test.ts`         | getMimeForPath, isAllowedMime for allowlist ext              |
| `handler-routing.test.ts`      | getHandlerForMime: MIME → ImageViewer \| MediaPlayer(mode)   |
| `playlist-filter-sort.test.ts` | filterMediaItems, sortByLocaleCompare, getExtensionsForMedia |
| `playlist-nav.test.ts`         | nextIndex, prevIndex ring navigation                         |
| `unsupported-mime.test.ts`     | getHandlerForMime returns null for unsupported               |
| `media-player-state.test.ts`   | Play/Pause/Stop, Volume, Mute toggle                         |
| `autoplay-blocked.test.ts`     | shouldShowPressPlay when autoplay blocked                    |

**Stubs:** `front/lib/fp4/handler.ts`, `playlist.ts`, `MediaPlayerState.ts`, `autoplay.ts` (throw until implementation).

**Commands:** `pnpm test -- front/__tests__/fp4/` or `./infra/test-unit.sh`

---

## 3. Integration Tests

**Location:** `back/__tests__/fp4/`

| File                                       | Coverage                                                           |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `open-url-viewers.integration.test.ts`     | open-url for image/audio/video paths → 200, GET url → 200          |
| `allowlist-types.integration.test.ts`      | open-url for png/mp3/mp4 → 200 (no 500)                            |
| `unsupported-negative.integration.test.ts` | missing file → 404, path traversal → 400, unsupported ext → no 500 |

**Fixtures:** `infra/minio/fixtures/DISK_C/My Documents/Images/`, `Music/`, `Video/` with sample.png, sample.jpg, sample.webp, sample.mp3, sample.mp4, sample.webm.

**Commands:** `pnpm test:api -- back/__tests__/fp4/` or `./infra/test-api-fp.sh FP4`

**Prerequisite:** `docker compose -f infra/docker-compose.dev.yml up -d`

---

## 4. E2E

**OUT of scope FP4.** Design decision (FP4 Contradictions §7). Gate: smoke + unit + integration. E2E deferred to FP5+.

**Rationale:** File chooser in iframe, Playwright limitations, coverage via integration sufficient for FP4.

---

## 5. Sandbox & Security Tests

| Test        | Type | Description                                                                        |
| ----------- | ---- | ---------------------------------------------------------------------------------- |
| T-SANDBOX   | Unit | ImageViewer/MediaPlayer iframe sandbox = allow-scripts only (no allow-same-origin) |
| T-TOKEN     | Unit | OPEN_FILE never contains token                                                     |
| T-GATEWAY   | Int  | Viewer fetch(api.shell.local) → blocked (sandbox)                                  |
| T-ALLOWLIST | Unit | Handler registry: only allowlist MIME → app                                        |

See [FP4_SECURITY_DOD.md](FP4_SECURITY_DOD.md) (archived).

---

## 6. Gate Commands (FP4)

| Command                      | Required | Purpose                           |
| ---------------------------- | -------- | --------------------------------- |
| `git status --porcelain`     | yes      | Clean state                       |
| `./infra/smoke.sh`           | yes      | Platform OK                       |
| `./infra/test-lint.sh`       | yes      | Lint + format                     |
| `./infra/test-unit.sh`       | yes      | Unit (front/**tests**/fp4/)       |
| `./infra/test-api-fp.sh FP4` | yes      | Integration (back/**tests**/fp4/) |

**Run unit only:** `pnpm test -- front/__tests__/fp4/`  
**Run integration only:** `pnpm test:api -- back/__tests__/fp4/` (prerequisite: compose up)

---

## 7. Fixtures (FP4)

| Path                           | Content                             |
| ------------------------------ | ----------------------------------- |
| C:/Program Files/Image Viewer/ | index.html, assets (read-only)      |
| C:/Program Files/Media Player/ | index.html, assets (read-only)      |
| C:/My Documents/Images/        | sample.png, sample.jpg, sample.webp |
| C:/My Documents/Music/         | sample.mp3                          |
| C:/My Documents/Video/         | sample.mp4, sample.webm             |

---

## 8. References

- [FP4.md](../fps/FP4.md)
- [FP4_SECURITY_DOD.md](FP4_SECURITY_DOD.md) (archived)
- [GUARDRAILS.md](../dev/GUARDRAILS.md) § Gate Semantics
