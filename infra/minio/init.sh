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

# CORS: free MinIO does not support bucket CORS. Use Traefik middleware (docker-compose) instead.
# mc cors set "$CORS_JSON" "myminio/$BUCKET" || true

# Upload fixtures (roots/DISK_A, DISK_C, DISK_D). FP3: APPS deprecated.
# M3: exclude .gitkeep (no .gitkeep pollution in S3)
FIXTURES="$FIXTURES" BUCKET="$BUCKET" sh "$SCRIPT_DIR/copy-fixtures-exclude-gitkeep.sh"
FIXTURES="$FIXTURES" BUCKET="$BUCKET" sh "$SCRIPT_DIR/upload-with-content-type.sh" 2>/dev/null || true

echo "MinIO init done."
