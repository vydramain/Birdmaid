#!/bin/sh
# M3: Copy fixtures to S3 excluding .gitkeep.
# Usage: run from /minio (docker minio-init working_dir).
# Env: BUCKET (default birdmaid-dev), FIXTURES (default /minio/fixtures)
# Always syncs fixtures (overwrites fixture paths). Preserves user data in non-fixture paths (e.g. Games/*).

echo "copy-fixtures: starting..."
BUCKET="${BUCKET:-birdmaid-dev}"
FIXTURES="${FIXTURES:-/minio/fixtures}"

# Cold start only: clear roots so fixtures define the structure
# On restart with user data, skip rm to preserve Games/* etc.
count=$(mc ls "myminio/$BUCKET/roots/" 2>/dev/null | wc -l)
if [ "$count" -eq 0 ]; then
  for disk in DISK_A DISK_C DISK_D; do
    mc rm --recursive --force "myminio/$BUCKET/roots/$disk/" 2>/dev/null || :
  done
fi

# minio/mc image (ubi9-micro) has no 'find'; use mc cp --recursive instead
copy_disk() {
  disk="$1"
  src="$FIXTURES/$disk"
  [ ! -d "$src" ] && return 0
  mc cp --recursive "$src/" "myminio/$BUCKET/roots/$disk/" 2>/dev/null || true
  echo "Uploaded roots/$disk"
}

# Create empty-dir placeholder (minimal file so dir appears in list)
# Required for dirs that had only .gitkeep (WINDOWS, Recycled, etc.)
ensure_empty_dir() {
  relpath="$1"
  tmp="/tmp/mc-empty-$$"
  printf "" > "$tmp"
  mc cp "$tmp" "myminio/$BUCKET/roots/$relpath/.emptydir" 2>/dev/null || true
  rm -f "$tmp"
}

copy_disk DISK_A
copy_disk DISK_C
copy_disk DISK_D

# Ensure empty dirs exist (had only .gitkeep in fixtures)
ensure_empty_dir "DISK_A"
ensure_empty_dir "DISK_D"
ensure_empty_dir "DISK_C/WINDOWS"
ensure_empty_dir "DISK_C/WINDOWS/SYSTEM"
ensure_empty_dir "DISK_C/WINDOWS/SYSTEM32"
ensure_empty_dir "DISK_C/WINDOWS/FONTS"
ensure_empty_dir "DISK_C/WINDOWS/TEMP"
ensure_empty_dir "DISK_C/WINDOWS/START MENU"
ensure_empty_dir "DISK_C/WINDOWS/DESKTOP"
ensure_empty_dir "DISK_C/Recycled"
ensure_empty_dir "DISK_C/My Documents/Games"
ensure_empty_dir "DISK_C/Program Files/Internet Explorer"
ensure_empty_dir "DISK_C/Program Files/NetMeeting"
ensure_empty_dir "DISK_C/Program Files/Outlook Express"
ensure_empty_dir "DISK_C/Program Files/Windows Media Player"
ensure_empty_dir "DISK_C/Program Files/Windows Messaging"

# Remove .gitkeep and _source (build-only, not deployed to S3)
mc find "myminio/$BUCKET/roots/" --name ".gitkeep" --exec "mc rm {}" 2>/dev/null || true
mc find "myminio/$BUCKET/roots/" --path "*_source/*" --exec "mc rm {}" 2>/dev/null || true
