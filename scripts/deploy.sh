#!/bin/bash
# Birdmaid deployment script
# Usage: ./scripts/deploy.sh [--build]

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

echo "=== Birdmaid Deployment ==="
echo "Project directory: $PROJECT_DIR"
echo ""

# Pull latest code if git repo
if [ -d ".git" ]; then
    echo "1. Pulling latest code..."
    git pull
    echo ""
fi

# Pull updated images
echo "2. Pulling updated Docker images..."
docker compose -f "$COMPOSE_FILE" pull
echo ""

# Build if --build flag or if code changed
if [ "$1" == "--build" ] || [ -n "$(git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -E '\.(ts|tsx|js|jsx|json)$')" ]; then
    echo "3. Building Docker images..."
    docker compose -f "$COMPOSE_FILE" build
    echo ""
else
    echo "3. Skipping build (use --build to force rebuild)"
    echo ""
fi

# Start services
echo "4. Starting services..."
docker compose -f "$COMPOSE_FILE" up -d
echo ""

# Wait for services to be healthy
echo "5. Waiting for services to be healthy..."
sleep 5

# Check service status
echo "6. Service status:"
docker compose -f "$COMPOSE_FILE" ps
echo ""

# Prune old images (optional, saves disk space)
echo "7. Pruning unused Docker images..."
docker image prune -f
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "Check status: docker compose -f $COMPOSE_FILE ps"
