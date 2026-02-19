# CORS for Signed URLs (FP2)

**Purpose:** Document CORS setup for MinIO signed URLs so Shell/Apps can fetch objects directly from S3/MinIO without proxy.  
**Decision:** Signed URL only (no proxy). CORS must be configured on MinIO.

---

## 1. Solution: Signed URL Only

- Gateway returns presigned GET URL to MinIO (s3.shell.local)
- Client (browser) fetches object directly from MinIO
- **MinIO must allow CORS** for the origin; otherwise browser blocks the request

---

## 2. MinIO CORS Configuration (Dev)

### 2.1 Allowed Origins

```
http://shell.local
http://api.shell.local
http://localhost:5173
```

(Optional: `https://` variants for local TLS.)

### 2.2 Allowed Methods

```
GET
HEAD
```

OPTIONS is handled by MinIO for preflight.

### 2.3 Allowed Headers

```
Accept
Range
Origin
Content-Type
```

### 2.4 Exposed Headers

```
Accept-Ranges
Content-Range
Content-Length
Content-Type
ETag
```

### 2.5 Config File and Application

- **Config:** `infra/minio/cors.json`
- **Apply:** `mc cors set /path/to/cors.json myminio/birdmaid-dev`
- **In docker-compose:** minio-init runs `mc cors set /minio/cors.json myminio/birdmaid-dev` after bucket creation
- **Manual re-apply:** `cd infra/minio && mc cors set cors.json myminio/birdmaid-dev` (with mc alias configured)

---

## 3. Gateway CORS (API Gateway)

- Gateway (`api.shell.local`) allows only allowlist origins for `/api/*` and `/health`
- Allowlist: `http://shell.local`, `http://api.shell.local`, `http://localhost:5173`
- Preflight: respond to OPTIONS with 204
- Bad origin → 403 + `request_rejected` in logs

---

## 4. What We Do NOT Allow

| Item | Reason |
|------|--------|
| PUT/POST/DELETE on signed URLs | FP2 read-only |
| PUT/POST/DELETE on MinIO CORS | Read-only |
| `*` origin | Security: explicit allowlist |
| Credentials in client | No S3 keys in frontend |

---

## 5. Verification

### 5.1 Manual (curl)

```bash
# Preflight to MinIO
curl -X OPTIONS "http://s3.shell.local/birdmaid-dev/" \
  -H "Origin: http://shell.local" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Expect: Access-Control-Allow-Origin: http://shell.local in response

# GET signed URL (with Origin)
SIGNED_URL="<from gateway open-url>"
curl -I "$SIGNED_URL" \
  -H "Origin: http://shell.local"

# Expect: 200, Access-Control-Allow-Origin in response
```

### 5.2 Browser

1. Open `http://shell.local` (Shell)
2. Trigger an App that loads an asset via `<img src="...">` or `fetch(signedUrl)`
3. DevTools Network: request to `s3.shell.local` must return 200 with CORS headers
4. Disallowed origin: use `http://evil.example` → expect CORS error or 403

### 5.3 Integration Test

- Test: `CORS: request with Origin from allowed passes`
- Test: `CORS: disallowed origin rejected (gateway)`
- Test: `signed URL GET/HEAD 200 for known object` (from allowed origin context)

---

## 6. References

- FP2: [docs/fps/FP2.md](../fps/FP2.md)
- FS Contract: [docs/core/FS_CONTRACT_v0.md](./FS_CONTRACT_v0.md)
- MinIO CORS docs: https://min.io/docs/minio/linux/integrations/aws-cli-with-minio.html#minio-cors
