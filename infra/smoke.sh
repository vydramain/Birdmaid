#!/usr/bin/env bash
set -euo pipefail

# Run from repo root
cd "$(cd "$(dirname "$0")/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.dev.yml}"
API_HOST="${API_HOST:-api.shell.local}"
S3_HOST="${S3_HOST:-s3.shell.local}"
SHELL_ORIGIN="${SHELL_ORIGIN:-http://shell.local}"

# If /etc/hosts is not set, we can still talk to Traefik via 127.0.0.1 + Host header.
BASE_URL="${BASE_URL:-http://127.0.0.1}"
USE_HOST_HEADER=0

if getent hosts "$API_HOST" >/dev/null 2>&1; then
  BASE_URL="http://$API_HOST"
else
  USE_HOST_HEADER=1
fi

curl_host() {
  local path="$1"
  if [[ "$USE_HOST_HEADER" -eq 1 ]]; then
    curl -fsS -H "Host: $API_HOST" "${BASE_URL}${path}"
  else
    curl -fsS "${BASE_URL}${path}"
  fi
}

wait_for_health() {
  local retries="${1:-60}"
  local delay="${2:-1}"
  for i in $(seq 1 "$retries"); do
    if curl_host "/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done
  return 1
}

echo "==> Bringing up dev stack (traefik, minio, minio-init, gateway)..."
docker compose -f "$COMPOSE_FILE" up -d traefik minio minio-init gateway

echo "==> Waiting for gateway /health..."
if ! wait_for_health 60 1; then
  echo "PLATFORM FAIL: gateway is not healthy after timeout"
  echo "--- docker compose ps ---"
  docker compose -f "$COMPOSE_FILE" ps || true
  echo "--- gateway logs (tail 200) ---"
  docker compose -f "$COMPOSE_FILE" logs --tail=200 gateway || true
  exit 1
fi

echo "==> Checking /health..."
HEALTH="$(curl_host "/health")"
echo "$HEALTH" | head -c 300
echo

echo "==> Checking /api/fs/roots..."
ROOTS="$(curl_host "/api/fs/roots")"
echo "$ROOTS" | head -c 500
echo

# Optional: open-url and try GET (Range) via returned signed URL
if command -v jq >/dev/null 2>&1; then
  echo "==> Checking /api/fs/open-url (optional)..."
  if [[ "$USE_HOST_HEADER" -eq 1 ]]; then
    OPEN_RESP="$(curl -fsS -H "Host: $API_HOST" -H "Content-Type: application/json" -X POST -d '{"path":"/@root/DISK_C/readme.txt"}' "${BASE_URL}/api/fs/open-url" 2>/dev/null || true)"
  else
    OPEN_RESP="$(curl -fsS -H "Content-Type: application/json" -X POST -d '{"path":"/@root/DISK_C/readme.txt"}' "${BASE_URL}/api/fs/open-url" 2>/dev/null || true)"
  fi
  if [[ -n "$OPEN_RESP" ]]; then
    URL="$(echo "$OPEN_RESP" | jq -r .url)"
    if [[ -n "$URL" && "$URL" != "null" ]]; then
      echo "Signed URL obtained (length ${#URL})"
      echo "==> GET signed URL (Range 0-0) with Origin..."
      if [[ "$USE_HOST_HEADER" -eq 1 ]]; then
        # s3.shell.local won't resolve; use 127.0.0.1 + Host header
        CURL_URL="${URL/http:\/\/${S3_HOST}/http://127.0.0.1}"
        STATUS="$(curl -sS -o /dev/null -w '%{http_code}' -H "Host: $S3_HOST" -H "Origin: $SHELL_ORIGIN" -H "Range: bytes=0-0" "$CURL_URL" 2>/dev/null || echo "000")"
      else
        STATUS="$(curl -sS -o /dev/null -w '%{http_code}' -H "Origin: $SHELL_ORIGIN" -H "Range: bytes=0-0" "$URL" 2>/dev/null || echo "000")"
      fi
      if [[ "$STATUS" != "200" && "$STATUS" != "206" ]]; then
        echo "PLATFORM FAIL: signed URL GET returned HTTP $STATUS"
        exit 1
      fi
    else
      echo "WARN: open-url response has no url (skipping signed URL check)"
    fi
  else
    echo "WARN: open-url request failed (skipping signed URL check)"
  fi
else
  echo "NOTE: jq not found; skipping open-url check"
fi

echo ""
echo "PLATFORM OK"
echo "API: ${BASE_URL} (Host header: ${USE_HOST_HEADER})"
