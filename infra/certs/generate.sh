#!/bin/sh
# Generate self-signed cert for shell.local, api.shell.local, s3.shell.local
# Required for Godot Web export (Secure Context / HTTPS)
# Run once: ./infra/certs/generate.sh

set -e
cd "$(dirname "$0")"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/CN=shell.local" \
  -addext "subjectAltName=DNS:shell.local,DNS:api.shell.local,DNS:s3.shell.local,IP:127.0.0.1"

echo "Generated cert.pem and key.pem (SAN: shell.local, api.shell.local, s3.shell.local)"
echo "Use https://shell.local for Godot user apps (Secure Context required)."
