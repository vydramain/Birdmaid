#!/bin/bash
# Pre-deployment validation script for Caddy configuration
# Usage: ./scripts/validate_caddy.sh [.env.prod]

set -e

ENV_FILE="${1:-.env.prod}"
CADDYFILE="${2:-Caddyfile}"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: Environment file not found: $ENV_FILE" >&2
    echo "Usage: $0 [.env.prod] [Caddyfile]" >&2
    exit 1
fi

if [ ! -f "$CADDYFILE" ]; then
    echo "ERROR: Caddyfile not found: $CADDYFILE" >&2
    exit 1
fi

echo "Loading environment from $ENV_FILE..."
# Source the env file and export DOMAIN
set -a
source "$ENV_FILE"
set +a

if [ -z "$DOMAIN" ]; then
    echo "ERROR: DOMAIN not set in $ENV_FILE" >&2
    exit 1
fi

echo "DOMAIN=$DOMAIN"
echo ""

# Generate substituted Caddyfile
TMP_CADDYFILE=$(mktemp)
trap "rm -f $TMP_CADDYFILE" EXIT

echo "Generating substituted Caddyfile..."
sed "s|\${DOMAIN}|${DOMAIN}|g" "$CADDYFILE" > "$TMP_CADDYFILE"

echo "Generated Caddyfile:"
echo "---"
cat "$TMP_CADDYFILE"
echo "---"
echo ""

# Validate using Caddy container
echo "Validating Caddyfile syntax..."
if docker run --rm \
    -v "$TMP_CADDYFILE:/tmp/Caddyfile:ro" \
    caddy:2-alpine \
    caddy validate --config /tmp/Caddyfile --adapter caddyfile; then
    echo ""
    echo "✅ Caddyfile validation passed!"
    exit 0
else
    echo ""
    echo "❌ Caddyfile validation failed!"
    exit 1
fi
