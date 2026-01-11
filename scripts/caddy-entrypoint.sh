#!/bin/sh
# Entrypoint script for Caddy that substitutes environment variables in Caddyfile

set -e

# Check if DOMAIN is set
if [ -z "$DOMAIN" ]; then
    echo "ERROR: DOMAIN environment variable is not set" >&2
    exit 1
fi

# Validate input Caddyfile exists
if [ ! -f /etc/caddy/Caddyfile ]; then
    echo "ERROR: Input Caddyfile not found at /etc/caddy/Caddyfile" >&2
    exit 1
fi

# Use sed to substitute ${DOMAIN} in Caddyfile
# Read from mounted Caddyfile (read-only), substitute variables, write to temp file
echo "Substituting DOMAIN=${DOMAIN} in Caddyfile..."
if ! sed "s|\${DOMAIN}|${DOMAIN}|g" /etc/caddy/Caddyfile > /tmp/Caddyfile; then
    echo "ERROR: Failed to substitute variables in Caddyfile" >&2
    exit 1
fi

# Validate output file was created
if [ ! -f /tmp/Caddyfile ]; then
    echo "ERROR: Failed to create /tmp/Caddyfile" >&2
    exit 1
fi

# Validate Caddyfile syntax before starting
echo "Validating Caddyfile syntax..."
if ! caddy validate --config /tmp/Caddyfile --adapter caddyfile 2>&1; then
    echo "ERROR: Caddyfile validation failed" >&2
    echo "Generated Caddyfile contents:" >&2
    echo "---" >&2
    cat /tmp/Caddyfile >&2
    echo "---" >&2
    exit 1
fi

echo "Caddyfile validated successfully. Starting Caddy..."

# Execute Caddy with the substituted config file (not the read-only mounted one)
exec caddy run --config /tmp/Caddyfile --adapter caddyfile
