#!/bin/sh
# FP2 MinIO init: create bucket, apply CORS, upload fixtures
# Run from infra/minio/ or via docker. Requires mc (MinIO Client).
# Env: MINIO_ENDPOINT (default http://minio:9000), MINIO_ACCESS_KEY, MINIO_SECRET_KEY

set -e

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
BUCKET="${MINIO_BUCKET:-birdmaid-dev}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIXTURES="${FIXTURES:-$SCRIPT_DIR/fixtures}"
CORS_JSON="${CORS_JSON:-$SCRIPT_DIR/cors.json}"

echo "MinIO init: endpoint=$MINIO_ENDPOINT bucket=$BUCKET"

# Wait for MinIO
until mc alias set myminio "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" 2>/dev/null; do
  echo "Waiting for MinIO..."
  sleep 2
done

# Create bucket
mc mb "myminio/$BUCKET" --ignore-existing

# Apply CORS
mc cors set "$CORS_JSON" "myminio/$BUCKET"

# Upload fixtures (roots/DISK_A, DISK_C, DISK_D). FP3: APPS deprecated.
if [ -d "$FIXTURES/DISK_A" ]; then
  mc cp --recursive "$FIXTURES/DISK_A/" "myminio/$BUCKET/roots/DISK_A/" 2>/dev/null || true
  echo "Uploaded roots/DISK_A"
fi
if [ -d "$FIXTURES/DISK_C" ]; then
  mc cp --recursive "$FIXTURES/DISK_C/" "myminio/$BUCKET/roots/DISK_C/"
  echo "Uploaded roots/DISK_C"
fi
if [ -d "$FIXTURES/DISK_D" ]; then
  mc cp --recursive "$FIXTURES/DISK_D/" "myminio/$BUCKET/roots/DISK_D/" 2>/dev/null || true
  echo "Uploaded roots/DISK_D"
fi

echo "MinIO init done."
