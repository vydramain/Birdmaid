# Dev Domain Setup

**Purpose:** Document expected dev setup for shell.local, api.shell.local, s3.shell.local.

---

## A) DNS / Hosts

**Required:** Add the following to `/etc/hosts` (or equivalent):

```
127.0.0.1  shell.local
127.0.0.1  api.shell.local
127.0.0.1  s3.shell.local
```

**Why:** Traefik routes by Host header. The browser and curl must resolve these names to 127.0.0.1 so requests hit Traefik on port 80.

**Verify:**

```bash
getent hosts s3.shell.local
# Expected: 127.0.0.1 s3.shell.local
```

---

## B) Traefik Routing

| Host            | Service    | Backend Port |
| --------------- | ---------- | ------------ |
| shell.local     | dev-server | 5173         |
| api.shell.local | gateway    | 3000         |
| s3.shell.local  | minio      | 9000         |

**CORS (s3.shell.local):** Traefik middleware `minio-cors` adds:

- `Access-Control-Allow-Origin: *` (allows shell.local and opaque origin null)
- `Access-Control-Allow-Methods: GET, HEAD, OPTIONS` (OPTIONS for preflight on Range requests)
- `Access-Control-Expose-Headers: Content-Length, Content-Type, ETag, Accept-Ranges, Content-Range`

**Range support:** MinIO returns `Accept-Ranges: bytes` and supports `Range: bytes=0-N` for video/audio seeking.

---

## C) MinIO CORS

Free MinIO does not support bucket-level CORS (`mc cors set` not implemented). CORS is handled by **Traefik middleware** (see docker-compose.dev.yml). No MinIO CORS config required.

---

## D) Content-Type

Signed URLs include `response-content-type` (e.g. `image/webp`, `video/mp4`). MinIO honors this when serving. Gateway sets it from file extension (back/src/fs.ts MIME_MAP).

**Fixture upload:** minio-init runs `upload-with-content-type.sh` to set explicit Content-Type on media objects (webp, png, jpg, mp3, mp4, webm). Avoids MinIO defaulting to `application/octet-stream`, which can cause Firefox "contains errors" when opening signed URL directly.

**No compression:** Traefik does NOT use compress middleware on the s3.shell.local route. Binary responses (images, audio, video) must not be transformed by proxy. Do not add compress to the minio router.

---

## E) Checksum / Query Flags

Gateway uses `AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED` to avoid `x-amz-checksum-mode` in presigned URLs (MinIO/Firefox compatibility).

---

## Quick Start

```bash
# 1. Add hosts (if not present)
echo "127.0.0.1 shell.local api.shell.local s3.shell.local" | sudo tee -a /etc/hosts

# 2. Start stack
docker compose -f infra/docker-compose.dev.yml up -d

# 3. Smoke
./infra/smoke.sh
# Expected: PLATFORM OK
```
