# Birdmaid Production Deployment Guide

This guide covers deploying Birdmaid to a single VPS (Debian 12) using Docker Compose.

## Prerequisites

### Server Requirements

- **OS**: Debian 12 (Bookworm)
- **Resources**: Minimum 1 vCPU, 2 GB RAM, 40 GB disk
- **Software**:
  - Docker Engine 24.0+
  - Docker Compose v2.20+
  - UFW (firewall)
  - Git (for cloning repository)

### Domain Setup

- Domain name pointing to server IP (e.g., `birdmaid.example.com`)
- DNS A record for `birdmaid.example.com` → server IP
- DNS A record for `api.birdmaid.example.com` → server IP

### External Services

- **Selectel S3-compatible Object Storage** (or any S3-compatible service)
  - Create a bucket (e.g., `my-birdmaid-bucket`)
  - Generate access key and secret
  - Configure CORS (see S3 CORS Configuration below)

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin -y

# Log out and back in for group changes to take effect
```

### 2. Configure Firewall (UFW)

```bash
# Allow SSH (adjust port if needed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 3. Configure Swap (Recommended for Low RAM)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. Configure Docker Log Rotation

Docker's default log rotation is configured in `docker-compose.prod.yml`:
- Max size: 10MB per log file
- Max files: 3 (keeps ~30MB per service)

To verify log rotation:
```bash
docker compose -f docker-compose.prod.yml logs --tail=50
```

## Deployment Steps

### 1. Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /opt/birdmaid
sudo chown $USER:$USER /opt/birdmaid
cd /opt/birdmaid

# Clone repository
git clone https://github.com/vydramain/Birdmaid.git .
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp env.prod.example .env.prod

# Edit environment variables
nano .env.prod
```

**Required variables** (see `env.prod.example` for full list):

```bash
# Domain
DOMAIN=example.com

# MongoDB (internal, no change needed)
MONGO_URI=mongodb://mongo:27017/birdmaid

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here

# URLs
APP_BASE_URL=https://api.birdmaid.example.com
CORS_ORIGIN=https://birdmaid.example.com
VITE_API_BASE_URL=https://api.birdmaid.example.com

# S3 (Selectel)
S3_ENDPOINT=https://s3.selcdn.ru
S3_REGION=ru-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_ASSETS=your-bucket-name
S3_PUBLIC_BASE_URL=https://s3.selcdn.ru
S3_FORCE_PATH_STYLE=true

# SMTP (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=password
SMTP_FROM=noreply@birdmaid.example.com
```

### 3. Configure S3 CORS

In your Selectel Object Storage dashboard, configure CORS for the bucket:

**Allowed Origins**: `https://birdmaid.example.com`
**Allowed Methods**: `GET, PUT, POST, HEAD`
**Allowed Headers**: `*`
**Exposed Headers**: `ETag`
**Max Age**: `3600`

### 4. Build and Start Services

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://api.birdmaid.example.com/health

# Expected response: {"status":"ok"}

# Check frontend
curl -I https://birdmaid.example.com

# Check TLS certificate (should be valid)
openssl s_client -connect birdmaid.example.com:443 -servername birdmaid.example.com
```

## Updating Deployment

### Standard Update Flow

```bash
cd /opt/birdmaid

# Pull latest code
git pull

# Pull updated images (if any)
docker compose -f docker-compose.prod.yml pull

# Rebuild if needed (code changes)
docker compose -f docker-compose.prod.yml build

# Restart services
docker compose -f docker-compose.prod.yml up -d

# Prune old images (optional, saves disk space)
docker image prune -f
```

### Quick Update Script

See `scripts/deploy.sh` for an automated update script.

## Monitoring and Logs

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f back
docker compose -f docker-compose.prod.yml logs -f front
docker compose -f docker-compose.prod.yml logs -f mongo
docker compose -f docker-compose.prod.yml logs -f caddy

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Check Service Health

```bash
# Service status
docker compose -f docker-compose.prod.yml ps

# Health checks
docker inspect birdmaid-back | jq '.[0].State.Health'
docker inspect birdmaid-mongo | jq '.[0].State.Health'
```

### Disk Usage

```bash
# Docker disk usage
docker system df

# Volume sizes
docker volume ls
docker volume inspect birdmaid-mongo-data

# System disk usage
df -h
```

## Backup and Recovery

### MongoDB Backup

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec mongo mongodump \
  --out /data/db/backup-$(date +%Y%m%d-%H%M%S)

# Backup script (see scripts/backup_mongo.sh)
./scripts/backup_mongo.sh
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp backup.tar.gz birdmaid-mongo:/tmp/

# Extract and restore
docker compose -f docker-compose.prod.yml exec mongo sh -c \
  "cd /tmp && tar xzf backup.tar.gz && mongorestore /tmp/backup"
```

### Backup to S3

The `scripts/backup_mongo.sh` script can upload backups to S3. Configure S3 credentials in `.env.prod`:

```bash
# Backup and upload to S3
./scripts/backup_mongo.sh
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check configuration
docker compose -f docker-compose.prod.yml config

# Verify environment variables
docker compose -f docker-compose.prod.yml config | grep -A 5 "environment:"
```

### Port Conflicts

```bash
# Check what's using ports 80/443
sudo netstat -tulpn | grep -E ':(80|443)'

# Or use ss
sudo ss -tulpn | grep -E ':(80|443)'
```

### TLS Certificate Issues

```bash
# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy

# Verify DNS records
dig birdmaid.example.com
dig api.birdmaid.example.com

# Check Caddy data volume
docker volume inspect birdmaid-caddy-data
```

### Caddy Configuration Validation

**Before restarting Caddy, always validate the configuration:**

```bash
# Validate Caddyfile with your production domain
./scripts/validate_caddy.sh .env.prod

# Or manually:
# 1. Load environment
source .env.prod
# 2. Generate substituted config
sed "s|\${DOMAIN}|${DOMAIN}|g" Caddyfile > /tmp/Caddyfile.prod
# 3. Validate
docker run --rm -v /tmp/Caddyfile.prod:/tmp/Caddyfile:ro \
  caddy:2-alpine caddy validate --config /tmp/Caddyfile --adapter caddyfile
```

**If Caddy container is restarting:**

```bash
# 1. Check full logs (last 200 lines)
docker compose -f docker-compose.prod.yml logs caddy --tail=200

# 2. Inspect container configuration
docker inspect birdmaid-caddy | jq '.[0].Config'

# 3. Check if DOMAIN is set correctly
docker compose -f docker-compose.prod.yml exec caddy env | grep DOMAIN

# 4. Test entrypoint script manually
docker compose -f docker-compose.prod.yml run --rm caddy /bin/sh /entrypoint.sh

# 5. Validate config inside container (if it starts)
docker compose -f docker-compose.prod.yml exec caddy \
  caddy validate --config /tmp/Caddyfile --adapter caddyfile
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker compose -f docker-compose.prod.yml logs mongo

# Test connection from backend
docker compose -f docker-compose.prod.yml exec back sh -c \
  "node -e \"const {MongoClient}=require('mongodb'); \
   MongoClient.connect(process.env.MONGO_URL).then(()=>console.log('OK')).catch(e=>console.error(e))\""
```

### S3 Connection Issues

```bash
# Check backend logs for S3 errors
docker compose -f docker-compose.prod.yml logs back | grep -i s3

# Verify S3 credentials in environment
docker compose -f docker-compose.prod.yml exec back env | grep S3_
```

### High Disk Usage

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a -f

# Check log sizes
docker compose -f docker-compose.prod.yml logs --tail=0 2>&1 | wc -l
```

### Low Memory Issues

```bash
# Check memory usage
free -h

# Check container memory
docker stats --no-stream

# Increase swap if needed (see Server Setup section)
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.prod` to git. It contains secrets.
2. **Firewall**: Only expose ports 80, 443, and SSH (22).
3. **MongoDB**: Not exposed to host network (internal Docker network only).
4. **JWT Secret**: Use a strong random string (32+ characters).
5. **S3 Credentials**: Rotate regularly and use IAM policies with minimal permissions.
6. **Updates**: Keep Docker and system packages updated.
7. **Backups**: Regular MongoDB backups to S3.

## Production Checklist

- [ ] Domain DNS records configured
- [ ] Firewall configured (UFW)
- [ ] Swap configured (if low RAM)
- [ ] `.env.prod` configured with all secrets
- [ ] S3 bucket created and CORS configured
- [ ] JWT secret generated (strong random string)
- [ ] Services start successfully
- [ ] Health endpoint responds (`/health`)
- [ ] TLS certificate valid (automatic via Caddy)
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] File uploads work (covers/builds)
- [ ] MongoDB backup script tested
- [ ] Log rotation working (check log sizes)

## Architecture Overview

```
Internet
  │
  ├─→ Caddy (Port 80/443)
  │   ├─→ birdmaid.example.com → Frontend (static files)
  │   └─→ api.birdmaid.example.com → Backend (NestJS :3000)
  │
  └─→ Docker Network (birdmaid-network)
      ├─→ Frontend (Caddy serving static files)
      ├─→ Backend (NestJS)
      ├─→ MongoDB (internal only, no host ports)
      └─→ External S3 (Selectel)
```

## Support

For issues or questions:
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Review this guide's Troubleshooting section
- Check GitHub issues: https://github.com/vydramain/Birdmaid/issues
