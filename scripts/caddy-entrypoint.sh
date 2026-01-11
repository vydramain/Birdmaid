#!/bin/sh
# Entrypoint script for Caddy that substitutes environment variables in Caddyfile

set -e

# Check if DOMAIN is set
if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN environment variable is not set"
    exit 1
fi

# Use sed to substitute ${DOMAIN} in Caddyfile
# Read from mounted Caddyfile (read-only), substitute variables, write to temp file
sed "s|\${DOMAIN}|${DOMAIN}|g" /etc/caddy/Caddyfile > /tmp/Caddyfile

# Execute Caddy with the substituted config file (not the read-only mounted one)
exec caddy run --config /tmp/Caddyfile --adapter caddyfile
