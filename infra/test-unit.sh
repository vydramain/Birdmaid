#!/usr/bin/env bash
# Canonical test (unit) — clean container, avoids rollup optional deps / host store issues.
# Usage: ./infra/test-unit.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm \
  -v "$(pwd)":/app \
  -w /app \
  node:22-alpine \
  sh -c "corepack enable pnpm && pnpm install && pnpm test"
