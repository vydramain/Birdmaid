# FP4 Viewers — Root Cause Audit (signed URL ground-truth)

**Role:** @Engineer (debug/audit)  
**Mode:** audit-only (no functional fixes)  
**Date:** 2026-02-23

---

## 1. Queue Safety (baseline)

| Check                    | Result                                                      |
| ------------------------ | ----------------------------------------------------------- |
| `git status --porcelain` | **Not empty** — modified files (archive, back, docs)        |
| `./infra/smoke.sh`       | 0 — PLATFORM OK                                             |
| `pnpm lint`              | 0 — Green                                                   |
| `pnpm format:check`      | 0 — Green                                                   |
| `pnpm test:api`          | 1 — 2 failed (FP2 CORS, FP3 rename dir — outside FP4 scope) |

---

## 2. Signed URL Used

**Source:** POST `/api/fs/open-url` with `{"path":"/@root/DISK_C/My Documents/Images/sample.webp"}`

**URL (signature redacted):**

```
http://s3.shell.local/birdmaid-dev/roots/DISK_C/My%20Documents/Images/sample.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=minioadmin%2F20260223%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260223T155336Z&X-Amz-Expires=120&X-Amz-Signature=e4be5103...9729a259a0a8&X-Amz-SignedHeaders=host&response-content-type=image%2Fwebp&x-amz-checksum-mode=ENABLED&x-id=GetObject
```

**Note:** Host-side curl used `127.0.0.1` + `Host: s3.shell.local` (s3.shell.local may not resolve in /etc/hosts).

---

## 3. curl Response (host-side)

**Command:**

```bash
curl -v -L -o /tmp/fp4.bin -H "Host: s3.shell.local" "http://127.0.0.1/birdmaid-dev/roots/DISK_C/My%20Documents/Images/sample.webp?X-Amz-..."
```

**Status:** `HTTP/1.1 200 OK`

**Headers:** See [docs/dev/\_tmp/FP4_SIGNED_URL_HEADERS.txt](../dev/_tmp/FP4_SIGNED_URL_HEADERS.txt) (TEMP(FP4.1))

| Header                      | Value      |
| --------------------------- | ---------- |
| Content-Type                | image/webp |
| Content-Length              | 68         |
| Access-Control-Allow-Origin | \*         |
| Accept-Ranges               | bytes      |

---

## 4. Body Analysis

**Size:** 68 bytes

**First 64 bytes (hex):**

```
524946463c000000574542505650382030000000d001009d012a0100010002003425a00274ba01f80003b000fef0c40bff20b96175c8d7ff203fe407fc80fff8
```

**file(1) output:**

```
RIFF (little-endian) data, Web/P image, VP8 encoding, 1x1, Scaling: [none]x[none], YUV color, decoders should clamp
```

---

## 5. Magic Bytes Check

| Format | Expected                                              | Actual (hex)          | Result  |
| ------ | ----------------------------------------------------- | --------------------- | ------- |
| WebP   | RIFF (52 49 46 46) .... WEBP (57 45 42 50 @ offset 8) | 52494646 ... 57454250 | ✓ Valid |

---

## 6. Conclusion

**Response bytes are valid.**

- curl returns 200 OK
- Content-Type: image/webp
- Body is valid WebP (RIFF....WEBP, VP8 1x1)
- No XML/HTML error (first byte ≠ 0x3c)

**If Firefox shows "contains errors" when opening the same URL directly:**

- **Not M1 (signature/host mismatch):** curl receives valid image; signature and routing are correct.
- **Likely M2/M3:** proxy transforms, compression, range handling, or browser-specific decoding. Proceed to M2/M3 investigation.

---

## 7. TEMP Artifacts

| Path                                       | Description                         |
| ------------------------------------------ | ----------------------------------- |
| `docs/dev/_tmp/FP4_SIGNED_URL_HEADERS.txt` | curl response headers (TEMP(FP4.1)) |
| `/tmp/fp4.bin`                             | Raw response body (68 bytes)        |
| `/tmp/fp4.curl.txt`                        | Full curl -v output                 |
