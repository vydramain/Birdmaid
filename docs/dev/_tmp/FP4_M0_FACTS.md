# FP4 M0 — Audit + Red Tests (baseline)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** audit+tests-red, milestone=M0  
**Roles:** @Analyst + @Engineer + @Compliance

---

## 1. Repro Steps

### 1.1 Commands

```bash
# Start stack
docker compose -f infra/docker-compose.dev.yml up --build

# Prerequisite: 127.0.0.1 shell.local api.shell.local s3.shell.local in /etc/hosts
```

### 1.2 Manual Steps

1. Open `http://shell.local/` (or http://127.0.0.1 with Host header)
2. Double-click "My Computer" (Explorer)
3. Navigate: DISK_C → My Documents → Images
4. Double-click `sample.webp`
5. Observe: Image Viewer window appears

### 1.3 Where "App not responding" appears

- **Location:** Shell placeholder overlay (`.app-host-placeholder`) inside the window chrome, **not** inside the viewer iframe
- **Source:** `front/core/AppHost.tsx` line 187 — handshake timer fires after 2000ms when `APP_READY` is not received
- **Condition:** When viewer iframe never sends `APP_READY` (or message not delivered to parent), placeholder shows "App not responding"

### 1.4 DevTools checks

- **Console (viewer iframe):** Select iframe context; check for errors on img load
- **Network (filter s3.shell.local):** Before fix — no GET requests to s3.shell.local
- **s3.shell.local resolution:** From host `getent hosts s3.shell.local` → 127.0.0.1; from container `--add-host s3.shell.local:host-gateway`

---

## 2. HAR Facts Table

**HAR:** `shell.local_Archive [26-02-23 03-31-05].har` (Firefox 147.0.4)

| initialUrl (from open-url) | GET to s3.shell.local in HAR | Status/Error | Content-Type |
| -------------------------- | ---------------------------- | ------------ | ------------ |
| sample.webp                | **No**                       | N/A          | N/A          |
| sample.png                 | **No**                       | N/A          | N/A          |
| sample.jpg                 | **No**                       | N/A          | N/A          |
| index.png                  | **No**                       | N/A          | N/A          |
| sample.mp3                 | **No**                       | N/A          | N/A          |
| sample.mp4                 | **No**                       | N/A          | N/A          |
| sample.webm                | **No**                       | N/A          | N/A          |

**Finding:** All POST `/api/fs/open-url` return 200 with signed URL (`response.url` contains `http://s3.shell.local/...`). **Zero** GET requests to `s3.shell.local` in `log.entries`. All requests in HAR are to `shell.local` (api/fs/list, open-url, apps/explorer, apps/image-viewer).

**Note:** Signed URLs in HAR contain `x-amz-checksum-mode=ENABLED` in query string.

---

## 3. Root-Cause Hypotheses

| #   | Hypothesis                                                                                                                                                        | Evidence                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| H1  | **postMessage targetOrigin mismatch:** Viewer sends APP_READY with wrong targetOrigin; browser drops message; Shell never receives APP_READY; handshake times out | FP4_M0_VIEWERS_AUDIT; AppHost handshake timeout |
| H2  | **Signed URL not fetchable in browser:** x-amz-checksum-mode=ENABLED or wrong Content-Type causes Firefox "contains errors" when loading via img.src              | User report; M2 fix added ResponseContentType   |
| H3  | **CORS:** Viewer iframe (origin null) fetches s3.shell.local; CORS blocks or misconfig                                                                            | M6 fix: Traefik minio-cors middleware           |
| H4  | **s3.shell.local DNS:** Host cannot resolve; GET fails before reaching MinIO                                                                                      | smoke.sh uses Host header fallback              |

---

## 4. Evidence

### 4.1 Test paths (created/updated)

| Path                                                               | Purpose                                                                                             |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `back/__tests__/fp4/signed-url-body-signature.integration.test.ts` | open-url → fetch → status 200, Content-Type, body binary signature (WebP, PNG, JPG, MP3, MP4, WebM) |
| `front/__tests__/fp4/app-host-handshake-timeout.test.tsx`          | When APP_READY never arrives, placeholder shows "App not responding" after 2000ms                   |

### 4.2 Commands and exit codes

| Command                      | Exit | Notes                                                      |
| ---------------------------- | ---- | ---------------------------------------------------------- |
| `./infra/smoke.sh`           | 0    | Platform OK                                                |
| `./infra/test-api-fp.sh FP4` | 1    | 2 tests fail: T-FP4-M0-BODY-SIG-png, T-FP4-M0-BODY-SIG-jpg |
| `./infra/test-unit.sh`       | 0    | Unit green (handshake timeout test passes)                 |
| `pnpm lint`                  | 0    | ESLint, Stylelint                                          |
| `pnpm format:check`          | 0    | Prettier                                                   |

### 4.3 Failing tests (RED)

| Test ID               | File                                                               | What it proves                                                                             |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| T-FP4-M0-BODY-SIG-png | `back/__tests__/fp4/signed-url-body-signature.integration.test.ts` | Fixture `sample.png` is placeholder text, not real PNG binary; body signature check fails  |
| T-FP4-M0-BODY-SIG-jpg | `back/__tests__/fp4/signed-url-body-signature.integration.test.ts` | Fixture `sample.jpg` is placeholder text, not real JPEG binary; body signature check fails |

**Note:** `sample.webp` is real WebP (RIFF....WEBP); `sample.png` and `sample.jpg` are "PNG placeholder - binary content for FP2 fixture" text. Fix: replace fixtures with real image files (out of scope M0).

---

## 5. Test Summary

### Integration (back/**tests**/fp4/)

- **T-FP4-M0-BODY-SIG:** open-url → fetch → status 200, Content-Type matches, body has correct binary signature (RIFF/WEBP, PNG, JPEG, ID3/mpeg, ftyp/mp4, webm)
- Existing: signed-url-fetchable, signed-url-content-type-m2, image-viewer-signed-url, open-url-viewers, etc.

### Unit (front/**tests**/fp4/)

- **T-FP4-M0-HANDSHAKE-TIMEOUT:** When APP_READY never received, placeholder shows "App not responding" after HANDSHAKE_TIMEOUT_MS
- Existing: app-host-handshake (APP_READY clears placeholder), protocol-null-origin, viewer-open-file-sets-src

---

## 6. TEMP Notice

This file is TEMP. Will be removed or merged into archive when FP4 is archived.
