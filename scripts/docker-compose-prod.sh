#!/bin/bash
# Wrapper script for docker compose with production env file
# Usage: ./scripts/docker-compose-prod.sh <docker-compose-command> [args...]
# Example: ./scripts/docker-compose-prod.sh ps
# Example: ./scripts/docker-compose-prod.sh logs -f back

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.prod"

cd "$PROJECT_DIR"

# Check if .env.prod exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env.prod not found. Copy env.prod.example to .env.prod and configure it."
    exit 1
fi

# Run docker compose with production env file
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
