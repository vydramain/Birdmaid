#!/usr/bin/env bash
# Canonical test:e2e — Playwright image (avoids libnspr4.so in node:22).
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d (stack must be running).
# Usage: ./infra/test-e2e.sh

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

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
  mcr.microsoft.com/playwright:v1.49.0-noble \
  sh -c "corepack enable pnpm && pnpm install && pnpm test:e2e"
