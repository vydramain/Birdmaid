#!/bin/sh
# FP4 M2: Upload media fixtures with explicit Content-Type.
# MinIO may default to application/octet-stream; Firefox can fail to decode.
# Belt-and-suspenders: presigned URLs use response-content-type, but object
# metadata should also be correct.
# Usage: run from /minio (docker minio-init working_dir).
# Note: minio/mc image has no 'find'; use mc find on bucket to locate media by extension.

BUCKET="${BUCKET:-birdmaid-dev}"

# Re-upload with Content-Type (mc cp same src/dest updates metadata)
set_content_type() {
  ext="$1"
  ct="$2"
  mc find "myminio/$BUCKET/roots/" --name "*.$ext" --exec "mc cp --attr Content-Type=$ct {} {}" 2>/dev/null || true
}

echo "Setting Content-Type on media fixtures..."
set_content_type webp "image/webp"
set_content_type png "image/png"
set_content_type jpg "image/jpeg"
set_content_type jpeg "image/jpeg"
set_content_type mp3 "audio/mpeg"
set_content_type mp4 "video/mp4"
set_content_type webm "video/webm"
echo "Content-Type set done."
