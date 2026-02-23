#!/usr/bin/env bash
# Canonical test:e2e scoped to FP — runs only the E2E spec for that FP.
# FP1 → e2e/fp1-shell.spec.ts
# FP2 → E2E not in DoD → exit 0, "E2E not required for FP2"
# FP3 → e2e/fp3-explorer.spec.ts
# Prerequisite: stack up (smoke + dev-server). Same setup as test-e2e.sh.
# Usage: ./infra/test-e2e-fp.sh FP1 | FP2 | FP3 | FP4

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.dev.yml}"

FP="${1:-}"
if [[ -z "$FP" ]]; then
  echo "Usage: $0 FP1 | FP2 | FP3 | FP4"
  exit 1
fi

case "$FP" in
  FP2)
    echo "E2E not required for $FP"
    exit 0
    ;;
  FP4)
    SPEC="e2e/fp4-viewers.spec.ts"
    ;;
  FP1)
    SPEC="e2e/fp1-shell.spec.ts"
    ;;
  FP3)
    SPEC="e2e/fp3-explorer.spec.ts"
    ;;
  *)
    echo "Unknown FP: $FP. Use FP1, FP2, FP3, or FP4."
    exit 1
    ;;
esac

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

echo "==> 4. Running E2E (FP scoped: $SPEC)"
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
  sh -c "npm install -g pnpm@10 && pnpm install && pnpm exec playwright test $SPEC"
