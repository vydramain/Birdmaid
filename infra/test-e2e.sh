#!/usr/bin/env bash
# Canonical test:e2e — clean container with Playwright.
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d (stack must be running).
# Usage: ./infra/test-e2e.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm \
  --add-host api.shell.local:host-gateway \
  --add-host s3.shell.local:host-gateway \
  --add-host shell.local:host-gateway \
  -v "$(pwd)":/app \
  -w /app \
  node:22 \
  sh -c "corepack enable pnpm && pnpm install && pnpm exec playwright install chromium && pnpm test:e2e"
