#!/usr/bin/env bash
# FP4 M4: Manual verification script for MediaPlayer playback.
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
# Usage: ./infra/verify-media-player-m4.sh
#
# Steps (manual — run in browser):
# 1. Open http://shell.local
# 2. Navigate Explorer to C:\My Documents\Video\
# 3. Double-click sample.mp4
# 4. MediaPlayer opens. Verify:
#    - Playback starts automatically (time advances)
#    - Play: resumes if paused
#    - Pause: pauses playback
#    - Stop: stops, resets to 0
#    - Volume slider and Mute work

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

echo "==> FP4 M4: MediaPlayer manual verification"
echo ""
echo "Prerequisite: stack running (./infra/smoke.sh)"
echo ""

# Quick sanity: open-url returns valid signed URL for mp4
API="${API_HOST:-http://api.shell.local}"
OPEN_RESP=$(curl -s -X POST "$API/api/fs/open-url" \
  -H "Content-Type: application/json" \
  -d '{"path":"/@root/DISK_C/My Documents/Video/sample.mp4"}' 2>/dev/null || true)

if ! echo "$OPEN_RESP" | grep -q '"url"'; then
  echo "WARN: open-url failed or API unreachable. Ensure stack is up."
  echo "  curl -s $API/health"
  exit 1
fi

URL=$(echo "$OPEN_RESP" | jq -r '.url')
if [[ -z "$URL" || "$URL" == "null" ]]; then
  echo "WARN: open-url returned no url"
  exit 1
fi

echo "1. Signed URL obtained (length ${#URL})"
echo ""

# Verify fetch returns mp4 bytes (ftyp at offset 4)
FTYP_HEX=$(curl -s -H "Range: bytes=0-11" "$URL" 2>/dev/null | head -c 12 | xxd -p 2>/dev/null | tr -d '\n' || true)
if [[ "$FTYP_HEX" == *"66747970"* ]]; then
  echo "2. Range fetch OK (ftyp present)"
else
  echo "2. WARN: Range fetch may have failed (no ftyp in first 12 bytes)"
fi
echo ""

echo "3. Manual steps:"
echo "   - Open http://shell.local"
echo "   - Explorer: C:\\My Documents\\Video\\"
echo "   - Double-click sample.mp4"
echo "   - Verify: autoplay, Play/Pause/Stop, volume"
echo ""
echo "Done."
