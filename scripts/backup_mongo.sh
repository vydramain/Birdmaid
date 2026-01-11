#!/bin/bash
# MongoDB backup script for Birdmaid
# Backs up MongoDB and optionally uploads to S3

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.prod"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

BACKUP_DIR="${BACKUP_DIR:-/tmp/birdmaid-backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="birdmaid-mongo-${TIMESTAMP}"
BACKUP_FILE="${BACKUP_NAME}.tar.gz"

mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "=== MongoDB Backup ==="
echo "Backup directory: $BACKUP_DIR"
echo "Backup file: $BACKUP_FILE"
echo ""

# Create backup
echo "1. Creating MongoDB backup..."
docker compose -f "$COMPOSE_FILE" exec -T mongo mongodump \
    --archive > "${BACKUP_NAME}.archive" || {
    echo "Error: Failed to create MongoDB backup"
    exit 1
}
echo ""

# Compress backup
echo "2. Compressing backup..."
tar czf "$BACKUP_FILE" "${BACKUP_NAME}.archive"
rm "${BACKUP_NAME}.archive"
echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""

# Upload to S3 if configured
if [ -n "$S3_ENDPOINT" ] && [ -n "$S3_ACCESS_KEY_ID" ] && [ -n "$S3_SECRET_ACCESS_KEY" ]; then
    echo "3. Uploading to S3..."
    
    # Check if awscli is available
    if command -v aws &> /dev/null; then
        S3_BUCKET="${S3_BUCKET_BACKUPS:-${S3_BUCKET_ASSETS:-your-bucket-name}}"
        S3_PATH="backups/mongo/${BACKUP_FILE}"
        
        AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" \
        AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY" \
        aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PATH}" \
            --endpoint-url="$S3_ENDPOINT" \
            --region="${S3_REGION:-ru-1}" || {
            echo "Warning: Failed to upload to S3, but backup file exists locally"
        }
        echo "Uploaded to: s3://${S3_BUCKET}/${S3_PATH}"
    else
        echo "Warning: awscli not found. Install with: pip install awscli"
        echo "Backup saved locally: $BACKUP_FILE"
    fi
else
    echo "3. S3 not configured, backup saved locally: $BACKUP_FILE"
fi

echo ""
echo "=== Backup Complete ==="
echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"

# Cleanup old backups (keep last 7 days)
echo ""
echo "4. Cleaning up old backups (older than 7 days)..."
find "$BACKUP_DIR" -name "birdmaid-mongo-*.tar.gz" -mtime +7 -delete
echo "Done"
