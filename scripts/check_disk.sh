#!/bin/bash
# Disk usage check script for Birdmaid deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"

echo "=== Birdmaid Disk Usage Report ==="
echo ""

# System disk usage
echo "1. System Disk Usage:"
df -h /
echo ""

# Docker disk usage
echo "2. Docker Disk Usage:"
docker system df
echo ""

# Volume sizes
echo "3. Docker Volumes:"
docker volume ls | grep birdmaid | while read -r driver name; do
    size=$(docker volume inspect "$name" --format '{{ .Mountpoint }}' | xargs du -sh 2>/dev/null || echo "unknown")
    echo "  $name: $size"
done
echo ""

# Container sizes
echo "4. Container Sizes:"
docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | jq -r '.Name' | while read -r name; do
    if [ -n "$name" ]; then
        size=$(docker inspect "$name" --format '{{ .SizeRootFs }}' 2>/dev/null | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "unknown")
        echo "  $name: $size"
    fi
done
echo ""

# Log sizes (approximate)
echo "5. Log Sizes (approximate):"
docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | jq -r '.Name' | while read -r name; do
    if [ -n "$name" ]; then
        log_size=$(docker inspect "$name" --format '{{ range .HostConfig.LogConfig.Config }}{{ . }}{{ end }}' 2>/dev/null || echo "")
        echo "  $name: logs configured"
    fi
done
echo ""

# Warnings
echo "6. Warnings:"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "  ⚠️  Disk usage is above 80%: ${DISK_USAGE}%"
fi

DOCKER_SIZE=$(docker system df --format '{{.Size}}' | head -1)
echo "  Docker total: $DOCKER_SIZE"
echo ""

echo "=== End Report ==="
