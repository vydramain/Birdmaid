#!/usr/bin/env bash
# Optional: run full gate sequence (smoke → lint → format → test:api → test:e2e).
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d.
# Usage: ./infra/gate.sh [FP1|FP2|FP3]
#   FP1: smoke + lint + unit + e2e (no test:api)
#   FP2: smoke + lint + test:api (no e2e in DoD)
#   FP3: smoke + lint + test:api + e2e
#   (default): smoke + lint + test:api + e2e

set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

FP="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Gate: FP=${FP:-all}"
echo "==> 1. Smoke"
"$SCRIPT_DIR/smoke.sh"

echo "==> 2. Lint + format"
"$SCRIPT_DIR/test-lint.sh"

if [[ "$FP" == "FP1" ]]; then
  echo "==> 3a. Test unit (FP1)"
  "$SCRIPT_DIR/test-unit.sh"
  echo "==> 3b. Test E2E (FP1)"
  "$SCRIPT_DIR/test-e2e.sh"
  echo ""
  echo "GATE OK"
  exit 0
fi

if [[ "$FP" == "FP2" ]]; then
  echo "==> 3. Test API (FP2 scoped)"
  "$SCRIPT_DIR/test-api-fp.sh" FP2
  echo "==> Skip E2E (FP2: E2E not in DoD)"
elif [[ "$FP" == "FP3" ]]; then
  echo "==> 3. Test API (FP3 scoped)"
  "$SCRIPT_DIR/test-api-fp.sh" FP3
  echo "==> 4. Test E2E"
  "$SCRIPT_DIR/test-e2e.sh"
else
  echo "==> 3. Test API (full)"
  "$SCRIPT_DIR/test-api.sh"
  echo "==> 4. Test E2E"
  "$SCRIPT_DIR/test-e2e.sh"
fi

echo ""
echo "GATE OK"
