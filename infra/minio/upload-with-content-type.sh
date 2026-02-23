#!/bin/sh
# FP4 M2: Upload media fixtures with explicit Content-Type.
# MinIO may default to application/octet-stream; Firefox can fail to decode.
# Belt-and-suspenders: presigned URLs use response-content-type, but object
# metadata should also be correct.
# Usage: run from /minio (docker minio-init working_dir).

set -e

BUCKET="${BUCKET:-birdmaid-dev}"
FIXTURES="${FIXTURES:-/minio/fixtures}"

# Map extension -> Content-Type (matches back/src/fs.ts MIME_MAP)
upload_media() {
  ext="$1"
  ct="$2"
  find "$FIXTURES" -type f -name "*.$ext" 2>/dev/null | while IFS= read -r f; do
    rel="${f#$FIXTURES/}"
    rel="${rel#/}"
    mc cp --attr "Content-Type=$ct" "$f" "myminio/$BUCKET/roots/$rel" 2>/dev/null || true
  done
}

echo "Setting Content-Type on media fixtures..."
upload_media webp "image/webp"
upload_media png "image/png"
upload_media jpg "image/jpeg"
upload_media jpeg "image/jpeg"
upload_media mp3 "audio/mpeg"
upload_media mp4 "video/mp4"
upload_media webm "video/webm"
echo "Content-Type set done."
