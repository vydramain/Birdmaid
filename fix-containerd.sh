#!/bin/bash
# Fix containerd metadata database error

set -e

echo "🔧 Fixing containerd metadata database error..."
echo ""

# Stop services
echo "1. Stopping Docker and containerd..."
sudo systemctl stop docker containerd 2>/dev/null || true

# Remove corrupted snapshotter directory
echo "2. Removing corrupted snapshotter metadata..."
sudo rm -rf /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/ 2>/dev/null || true

# Also clean up any other potential issues
echo "3. Cleaning up containerd state..."
sudo rm -rf /var/lib/containerd/tmp/ 2>/dev/null || true

# Restart containerd first
echo "4. Starting containerd..."
sudo systemctl start containerd
sleep 3

# Then start Docker
echo "5. Starting Docker..."
sudo systemctl start docker
sleep 2

# Verify services
echo "6. Verifying services..."
if sudo systemctl is-active --quiet containerd && sudo systemctl is-active --quiet docker; then
    echo "✅ Services are running"
else
    echo "❌ Services failed to start. Check status:"
    sudo systemctl status containerd docker --no-pager
    exit 1
fi

# Test Docker
echo "7. Testing Docker..."
if sudo docker ps > /dev/null 2>&1; then
    echo "✅ Docker is working"
else
    echo "❌ Docker test failed"
    exit 1
fi

echo ""
echo "✅ Fix complete! You can now run: docker compose up --build"
