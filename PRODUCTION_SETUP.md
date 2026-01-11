# Birdmaid Production Setup Summary

This document summarizes the production deployment setup for Birdmaid.

## Files Created/Modified

### Production Docker Configuration

1. **`docker-compose.prod.yml`** - Production Docker Compose configuration
   - Services: mongo, back, front, caddy
   - Health checks for mongo and back
   - Log rotation (10MB max, 3 files)
   - Named volumes for mongo data
   - Dedicated Docker network
   - No MinIO (uses external S3)

2. **`front/Dockerfile.prod`** - Multi-stage frontend Dockerfile
   - Build stage: compiles React/Vite app
   - Runtime stage: minimal Node.js Alpine with static file server
   - Serves from `/srv/dist` on port 80

3. **`back/Dockerfile.prod`** - Multi-stage backend Dockerfile
   - Build stage: compiles NestJS TypeScript
   - Runtime stage: production dependencies only
   - Health check endpoint: `/health`
   - Exposes port 3000 (internal)

4. **`Caddyfile`** - Reverse proxy configuration
   - Automatic TLS via Let's Encrypt
   - Frontend: `birdmaid.{DOMAIN}` → front:80
   - Backend: `api.birdmaid.{DOMAIN}` → back:3000
   - Compression (gzip/zstd)
   - Security headers (permissive for iframe embedding)

5. **`.dockerignore`** files (front/back)
   - Reduces build context size
   - Excludes node_modules, tests, coverage, etc.

### Environment Configuration

6. **`env.prod.example`** - Production environment template
   - All required variables documented
   - S3 configuration for Selectel
   - Domain, JWT, MongoDB, SMTP settings

7. **`docker-compose.override.example.yml`** - Local override example
   - For local testing/development

### Documentation

8. **`docs/DEPLOY.md`** - Complete deployment guide
   - Server setup instructions
   - Deployment steps
   - Monitoring and troubleshooting
   - Backup procedures

### Scripts

9. **`scripts/deploy.sh`** - Automated deployment script
   - Pulls latest code
   - Updates images
   - Rebuilds if needed
   - Starts services
   - Prunes old images

10. **`scripts/backup_mongo.sh`** - MongoDB backup script
    - Creates compressed backup
    - Optional S3 upload
    - Cleans up old backups

11. **`scripts/check_disk.sh`** - Disk usage monitoring
    - System disk usage
    - Docker disk usage
    - Volume sizes
    - Container sizes

### Backend Code Updates

12. **`back/src/build-url.service.ts`** - Updated S3 configuration
    - Supports `S3_REGION` environment variable
    - Supports `S3_FORCE_PATH_STYLE` environment variable
    - Supports `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`
    - Supports `S3_PUBLIC_BASE_URL`
    - Backward compatible with old env var names

13. **`back/src/games/games.controller.ts`** - Updated S3 configuration
    - Same updates as build-url.service.ts

14. **`back/src/app.controller.ts`** - Updated S3 configuration
    - Same updates as build-url.service.ts

15. **`back/src/main.ts`** - Updated CORS configuration
    - Uses `CORS_ORIGIN` environment variable
    - Restricts origins in production
    - Allows all in development

## Deployment Commands

### Initial Deployment

```bash
# On server (Debian 12)
cd /opt/birdmaid
git clone https://github.com/vydramain/Birdmaid.git .
cp env.prod.example .env.prod
nano .env.prod  # Configure all variables
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Updates

```bash
cd /opt/birdmaid
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build  # If code changed
docker compose -f docker-compose.prod.yml up -d
```

Or use the automated script:
```bash
./scripts/deploy.sh [--build]
```

## Environment Variables

### Required Variables

- `DOMAIN` - Base domain (e.g., `example.com`)
- `MONGO_URI` - MongoDB connection string (default: `mongodb://mongo:27017/birdmaid`)
- `JWT_SECRET` - Secret for JWT tokens (generate: `openssl rand -base64 32`)
- `APP_BASE_URL` - Backend API URL (e.g., `https://api.birdmaid.example.com`)
- `CORS_ORIGIN` - Frontend URL for CORS (e.g., `https://birdmaid.example.com`)
- `VITE_API_BASE_URL` - Frontend API URL (e.g., `https://api.birdmaid.example.com`)
- `S3_ENDPOINT` - S3 endpoint URL (e.g., `https://s3.selcdn.ru`)
- `S3_REGION` - S3 region (e.g., `ru-1` for Selectel)
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET_ASSETS` - S3 bucket name (e.g., `birdmaid-builds`)
- `S3_PUBLIC_BASE_URL` - Public S3 URL (usually same as endpoint)
- `S3_FORCE_PATH_STYLE` - Use path-style URLs (`true` for Selectel)

### Optional Variables

- `SMTP_HOST` - SMTP server for email (password recovery)
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address

## Architecture

```
Internet
  │
  ├─→ Caddy (Ports 80/443)
  │   ├─→ birdmaid.example.com → Frontend (static files)
  │   └─→ api.birdmaid.example.com → Backend (NestJS :3000)
  │
  └─→ Docker Network (birdmaid-network)
      ├─→ Frontend (Node.js static server :80)
      ├─→ Backend (NestJS :3000)
      ├─→ MongoDB (internal only, no host ports)
      └─→ External S3 (Selectel)
```

## Key Features

1. **Automatic TLS** - Caddy handles Let's Encrypt certificates automatically
2. **Health Checks** - MongoDB and backend have health checks
3. **Log Rotation** - Docker logs rotated (10MB max, 3 files)
4. **Resource Efficient** - Multi-stage builds, minimal runtime images
5. **No MinIO** - Uses external S3-compatible storage (Selectel)
6. **Secure** - MongoDB not exposed to host, services on internal network
7. **Backup Ready** - MongoDB backup script with S3 upload support

## Validation

To validate the configuration locally (without starting services):

```bash
# Check compose config
docker compose -f docker-compose.prod.yml config

# List services
docker compose -f docker-compose.prod.yml config --services

# Expected output: mongo, back, front, caddy
```

## Next Steps

1. Configure DNS records for your domain
2. Set up Selectel S3 bucket and configure CORS
3. Copy `env.prod.example` to `.env.prod` and fill in values
4. Deploy using commands above
5. Verify health endpoint: `curl https://api.birdmaid.example.com/health`
6. Set up automated backups (cron job for `backup_mongo.sh`)

## Troubleshooting

See `docs/DEPLOY.md` for detailed troubleshooting guide.

Common issues:
- DNS not configured → TLS certificate won't issue
- S3 credentials wrong → File uploads fail
- MongoDB connection → Check MONGO_URI and network
- Port conflicts → Check what's using ports 80/443
