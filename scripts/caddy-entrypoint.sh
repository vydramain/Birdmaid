#!/bin/sh
# Entrypoint script for Caddy that substitutes environment variables in Caddyfile

set -e

# Check if DOMAIN is set
if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN environment variable is not set"
    exit 1
fi

# Use sed to substitute ${DOMAIN} in Caddyfile
# Read from mounted Caddyfile, substitute variables, write to temp file
sed "s|\${DOMAIN}|${DOMAIN}|g" /etc/caddy/Caddyfile > /tmp/Caddyfile

# Replace original Caddyfile with substituted version
mv /tmp/Caddyfile /etc/caddy/Caddyfile

# Execute Caddy with the substituted config
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
