#!/usr/bin/env bash
# Canonical test:api scoped to FP — runs only FP2 or FP3 tests.
# FP2: back/__tests__/fp2/ only (so FP2 gate can PASS independently of FP3).
# FP3: back/__tests__/fp2/ + back/__tests__/fp3/ (FP3 extends FP2).
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d (stack must be running).
# Usage: ./infra/test-api-fp.sh FP2 | ./infra/test-api-fp.sh FP3

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

FP="${1:-}"
if [[ -z "$FP" ]]; then
  echo "Usage: $0 FP2 | FP3"
  exit 1
fi

case "$FP" in
  FP2)
    PATHS="back/__tests__/fp2/"
    ;;
  FP3)
    PATHS="back/__tests__/fp2/ back/__tests__/fp3/"
    ;;
  *)
    echo "Unknown FP: $FP. Use FP2 or FP3."
    exit 1
    ;;
esac

docker run --rm \
  --add-host api.shell.local:host-gateway \
  --add-host s3.shell.local:host-gateway \
  -v "$(pwd)":/app \
  -w /app \
  node:22-alpine \
  sh -c "corepack enable pnpm && pnpm install && pnpm exec vitest run --config vitest.api.config.ts $PATHS"
