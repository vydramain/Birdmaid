#!/usr/bin/env bash
# Canonical test:e2e — Playwright image (avoids libnspr4.so in node:22).
# Ensures stack is up (smoke + dev-server) before running tests.
# Usage: ./infra/test-e2e.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.dev.yml}"

echo "==> 1. Smoke (gateway, traefik, minio)"
"$SCRIPT_DIR/smoke.sh"

echo "==> 2. Ensure dev-server up (shell.local)"
docker compose -f "$COMPOSE_FILE" up -d dev-server

echo "==> 3. Waiting for shell.local..."
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null -w "%{http_code}" -H "Host: shell.local" http://127.0.0.1/ 2>/dev/null | grep -qE "^(200|304)"; then
    echo "shell.local ready"
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "E2E FAIL: shell.local not ready after 60s"
    docker compose -f "$COMPOSE_FILE" logs --tail=50 dev-server || true
    exit 1
  fi
  sleep 1
done

echo "==> 4. Running E2E (Playwright image)"
# Playwright image has Chromium + deps; add-host for dev-domain routing
docker run --rm \
  --init \
  --ipc=host \
  --add-host shell.local:host-gateway \
  --add-host api.shell.local:host-gateway \
  --add-host s3.shell.local:host-gateway \
  -v "$(pwd)":/app \
  -w /app \
  -e PLAYWRIGHT_BASE_URL=http://shell.local \
  mcr.microsoft.com/playwright:v1.58.2-noble \
  sh -c "npm install -g pnpm@10 && pnpm install && pnpm test:e2e"
