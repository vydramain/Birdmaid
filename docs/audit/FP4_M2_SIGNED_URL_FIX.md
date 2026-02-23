# FP4 M2 — Signed URL Compatibility (Firefox/MinIO)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** implement → gate  
**Role:** @Engineer

---

## 1. Problem

Direct opening of signed URLs in Firefox showed "contains errors". Suspected causes:

- Presigned URL contains `x-amz-checksum-mode=ENABLED` (MinIO/Firefox compatibility)
- Response Content-Type incorrect or missing for media files

---

## 2. Reproduction (Container)

```bash
# Get signed URL
curl -s -X POST http://api.shell.local/api/fs/open-url \
  -H "Content-Type: application/json" \
  -d '{"path":"/@root/DISK_C/My Documents/Images/sample.webp"}'

# Curl the URL
curl -v -o /tmp/sample.webp "<url>"
```

**Before fix:** URL lacked `response-content-type`; object metadata might not set Content-Type.

**After fix:** URL includes `response-content-type=image%2Fwebp`; response returns `Content-Type: image/webp`.

---

## 3. What Changed

### 3.1 ResponseContentType in GetObjectCommand

| File             | Change                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| `back/src/fs.ts` | Add `ResponseContentType` to GetObjectCommand based on file extension (MIME_MAP) |

Ensures presigned URLs request the correct Content-Type in the response. MinIO honors `response-content-type` when present.

### 3.2 MIME_MAP extended

| File             | Change                                           |
| ---------------- | ------------------------------------------------ |
| `back/src/fs.ts` | Add `.webp`, `.mp3`, `.mp4`, `.webm` to MIME_MAP |

### 3.3 x-amz-checksum-mode

- AWS SDK v3 adds `x-amz-checksum-mode=ENABLED` to GetObject presigned URLs by default.
- `AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED` is set in docker-compose; SDK still adds it for GetObject.
- Stripping the param from the URL invalidates the signature (403).
- **Status:** curl returns 200; Content-Type fix addresses Firefox "contains errors" when object metadata is wrong. Checksum param remains; MinIO accepts it in curl/browser tests.

---

## 4. Curl Output (After Fix)

```
> GET /birdmaid-dev/roots/DISK_C/My%20Documents/Images/sample.webp?...
  response-content-type=image%2Fwebp&x-amz-checksum-mode=ENABLED&x-id=GetObject

< HTTP/1.1 200 OK
< Content-Type: image/webp
< Content-Length: 68
```

---

## 5. Test Outputs

### M2 Integration Tests

```
✓ back/__tests__/fp4/signed-url-content-type-m2.integration.test.ts (6 tests)
  T-FP4-M2-webp: open-url → 200 + Content-Type
  T-FP4-M2-jpg: open-url → 200 + Content-Type
  T-FP4-M2-png: open-url → 200 + Content-Type
  T-FP4-M2-mp3: open-url → 200 + Content-Type
  T-FP4-M2-mp4: open-url → 200 + Content-Type
  T-FP4-M2-webm: open-url → 200 + Content-Type
```

### Full FP4 API Suite

```
Test Files  6 passed (6)
     Tests  22 passed (22)
```

---

## 6. Exit Criteria

| Criterion                                                                      | Status |
| ------------------------------------------------------------------------------ | ------ |
| Signed URL opens correctly in browser and via curl (200 + proper Content-Type) | ✓      |
| M2 integration tests green                                                     | ✓      |
| sample.webp, sample.jpg, sample.png                                            | ✓      |
| sample.mp3                                                                     | ✓      |
| sample.mp4, sample.webm                                                        | ✓      |
