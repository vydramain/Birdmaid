# MinIO (FP2 Dev S3)

**Purpose:** S3-compatible storage for dev. Single bucket `birdmaid-dev`, prefixes `roots/DISK_C/`, `roots/APPS/`.

---

## 1. Fixtures Structure

```
fixtures/
  DISK_C/
    readme.txt
    docs/
      sample.txt
    apps/          (empty dir)
  APPS/
    demo-app/
      index.html   (isApp=true)
      asset.png
```

Maps to S3:

- `roots/DISK_C/readme.txt`
- `roots/DISK_C/docs/sample.txt`
- `roots/DISK_C/apps/`
- `roots/APPS/demo-app/index.html`
- `roots/APPS/demo-app/asset.png`

---

## 2. Changing Fixtures

1. Add/edit files under `fixtures/DISK_C/` or `fixtures/APPS/`
2. Re-run init (see below)
3. Or manually: `mc cp --recursive fixtures/DISK_C/ myminio/birdmaid-dev/roots/DISK_C/`

---

## 3. Running Init

**Prerequisite:** MinIO running, `mc` (MinIO Client) available.

**From host (with mc installed):**

```bash
cd infra/minio
export MINIO_ENDPOINT=http://localhost:9000  # or s3.shell.local if via Traefik
export MINIO_ACCESS_KEY=minioadmin
export MINIO_SECRET_KEY=minioadmin
./init.sh
```

**Via Docker (mc image):**

```bash
docker run --rm --network birdmaid_default \
  -v "$(pwd)/infra/minio:/minio" \
  -e MINIO_ENDPOINT=http://minio:9000 \
  -e MINIO_ACCESS_KEY=minioadmin \
  -e MINIO_SECRET_KEY=minioadmin \
  minio/mc sh /minio/init.sh
```

_(Adjust network name to match docker-compose.)_

**From docker-compose:** Init runs automatically via `minio-init` service in `infra/docker-compose.dev.yml`.

---

## 4. CORS

- **Free MinIO:** `mc cors set` is not supported (functionality not implemented).
- **CORS handled by Traefik:** `docker-compose.dev.yml` applies `minio-cors` middleware to s3.shell.local route: `Access-Control-Allow-Origin: *`, methods GET/HEAD, expose headers for Content-Type, Range, etc.
- **Legacy:** `cors.json` exists but is not used for free MinIO.

---

## 5. References

- FP2: [docs/fps/FP2.md](../../docs/fps/FP2.md)
- CORS: [docs/dev/ARCHITECTURE.md](../../docs/dev/ARCHITECTURE.md) § CORS
- FS Contract: [docs/core/API.yaml](../../docs/core/API.yaml), [docs/dev/ARCHITECTURE.md](../../docs/dev/ARCHITECTURE.md)
