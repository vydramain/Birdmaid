#!/usr/bin/env bash
# Canonical lint + format:check — clean container, avoids host store / optional deps issues.
# Usage: ./infra/test-lint.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm \
  -e CI=true \
  -v "$(pwd)":/app \
  -w /app \
  node:22-alpine \
  sh -c "corepack enable pnpm && pnpm install && pnpm lint && pnpm format:check"
