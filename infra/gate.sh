#!/usr/bin/env bash
# Canonical gate: smoke + lint + format:check + scoped unit/api/e2e per FP.
# Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d.
# Usage: ./infra/gate.sh [FP1|FP2|FP3]
#   FP1: smoke + lint + unit + test-e2e-fp FP1
#   FP2: smoke + lint + test-api-fp FP2 + test-e2e-fp FP2 (E2E not in DoD → skip)
#   FP3: smoke + lint + test-api-fp FP3 + test-e2e-fp FP3
#   (default): smoke + lint + test-api full + test-e2e-fp FP1 + FP2 + FP3
# Rule: Any non-zero exit → REJECT. No partial PASS.

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
  echo "==> 3b. Test E2E (FP1 scoped)"
  "$SCRIPT_DIR/test-e2e-fp.sh" FP1
  echo ""
  echo "GATE OK"
  exit 0
fi

if [[ "$FP" == "FP2" ]]; then
  echo "==> 3. Test API (FP2 scoped)"
  "$SCRIPT_DIR/test-api-fp.sh" FP2
  echo "==> 4. Test E2E (FP2: not in DoD)"
  "$SCRIPT_DIR/test-e2e-fp.sh" FP2
  echo ""
  echo "GATE OK"
  exit 0
fi

if [[ "$FP" == "FP3" ]]; then
  echo "==> 3. Test API (FP3 scoped)"
  "$SCRIPT_DIR/test-api-fp.sh" FP3
  echo "==> 4. Test E2E (FP3 scoped)"
  "$SCRIPT_DIR/test-e2e-fp.sh" FP3
  echo ""
  echo "GATE OK"
  exit 0
fi

# Default: all FPs
echo "==> 3. Test API (full)"
"$SCRIPT_DIR/test-api.sh"
echo "==> 4. Test E2E (FP1 scoped)"
"$SCRIPT_DIR/test-e2e-fp.sh" FP1
echo "==> 5. Test E2E (FP2: not in DoD)"
"$SCRIPT_DIR/test-e2e-fp.sh" FP2
echo "==> 6. Test E2E (FP3 scoped)"
"$SCRIPT_DIR/test-e2e-fp.sh" FP3

echo ""
echo "GATE OK"
