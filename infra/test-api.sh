#!/usr/bin/env bash
# Canonical test:api — clean container, avoids rollup optional deps / host store issues.
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d (stack must be running).
# Usage: ./infra/test-api.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm \
  --add-host api.shell.local:host-gateway \
  --add-host s3.shell.local:host-gateway \
  -v "$(pwd)":/app \
  -w /app \
  node:22-alpine \
  sh -c "corepack enable pnpm && pnpm install && pnpm test:api"
