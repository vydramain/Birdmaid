# FP4 M1 — Signed URL Content Validity (Evidence)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** build, milestone=M1  
**Roles:** @Engineer + @Compliance

---

## 1. Evidence: Changed Files

| Path                                                         | Change                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `infra/minio/fixtures/DISK_C/My Documents/Images/sample.png` | Replaced placeholder text with real PNG (1×1 red pixel via ImageMagick)  |
| `infra/minio/fixtures/DISK_C/My Documents/Images/sample.jpg` | Replaced placeholder text with real JPEG (1×1 red pixel via ImageMagick) |

**No changes to:** `back/`, `infra/docker-compose.dev.yml`, or tests.

---

## 2. Commands and Exit Codes

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/test-unit.sh`       | 0    |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/smoke.sh`           | 0    |

---

## 3. Why WebP/PNG/JPEG Are Now Valid

### Fixtures Before (M0)

- **sample.png, sample.jpg:** Text "PNG placeholder - binary content for FP2 fixture" (49 bytes)
- **sample.webp:** Already valid (RIFF....WEBP, 68 bytes)

### Fixtures After (M1)

- **sample.png:** Real PNG — signature `\x89PNG\r\n\x1a\n` (bytes 0–7). Created with `magick -size 1x1 xc:red sample.png`.
- **sample.jpg:** Real JPEG — signature `\xFF\xD8\xFF` (SOI). Created with `magick -size 1x1 xc:red sample.jpg`.
- **sample.webp:** Unchanged; already valid.

### Test Verification

`back/__tests__/fp4/signed-url-body-signature.integration.test.ts`:

- **checkPNG:** `bytes[0]==0x89 && bytes[1]==0x50 && bytes[2]==0x4e && bytes[3]==0x47`
- **checkJPEG:** `bytes[0]==0xff && bytes[1]==0xd8 && bytes[2]==0xff`
- **checkWebP:** `bytes[0]==0x52 && bytes[1]==0x49 && bytes[2]==0x46 && bytes[3]==0x46` (RIFF) and `bytes[8..11]==WEBP`

Content-Type: backend `fs.ts` uses `ResponseContentType` in GetObjectCommand (M2 fix); MinIO returns correct `image/png`, `image/jpeg`, `image/webp`.

---

## 4. Hypotheses Closed

| #   | Hypothesis                              | Result                                        |
| --- | --------------------------------------- | --------------------------------------------- |
| 1   | Fixtures contain invalid sample.webp    | **N/A** — sample.webp was already valid       |
| 2   | Fixtures contain invalid sample.png/jpg | **Fixed** — replaced with real binary images  |
| 3   | MinIO returns wrong Content-Type        | **Already fixed** — M2 ResponseContentType    |
| 4   | open-url returns HTML/error URL         | **N/A** — open-url returns correct signed URL |
| 5   | checksum/query params break MinIO       | **N/A** — tests pass; no change needed        |
