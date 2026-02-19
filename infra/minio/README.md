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

- Config: `cors.json`
- Applied by init.sh: `mc cors set cors.json myminio/birdmaid-dev`
- To re-apply: run `mc cors set cors.json myminio/birdmaid-dev`

---

## 5. References

- FP2: [docs/fps/FP2.md](../../docs/fps/FP2.md)
- CORS: [docs/core/CORS_SIGNED_URLS.md](../../docs/core/CORS_SIGNED_URLS.md)
- FS Contract: [docs/core/FS_CONTRACT_v0.md](../../docs/core/FS_CONTRACT_v0.md)
