# Dev Domain — shell.local (FP1) + api.shell.local, s3.shell.local (FP2)

**Purpose:** Dev domains via Traefik. FP1: shell.local. FP2: api.shell.local (gateway), s3.shell.local (MinIO).  
**ADR:** Dev domain: Traefik + docker-compose (QNA_DECISIONS ADR#8, ADR#11).

---

## 1. /etc/hosts (required)

Add entries so the browser resolves domains:

```
127.0.0.1 shell.local
127.0.0.1 api.shell.local
127.0.0.1 s3.shell.local
```

**Optional (MinIO console, not DoD):**
```
127.0.0.1 minio.shell.local
```

**Linux/macOS:** `sudo nano /etc/hosts`  
**Windows:** `C:\Windows\System32\drivers\etc\hosts`

Without this, `http://shell.local`, `http://api.shell.local`, `http://s3.shell.local` will not resolve.

---

## 2. Проверка запуска (Smoke)

**Prerequisite:** `/etc/hosts` с `127.0.0.1 shell.local api.shell.local s3.shell.local` (см. секцию 1).

Одна команда для проверки, что платформа запущена:

```bash
./infra/smoke.sh
# или
pnpm smoke
```

**Ожидаемый результат:** `PLATFORM OK` — стек поднят, gateway отвечает на /health и /api/fs/roots. При наличии `jq` дополнительно проверяется open-url и GET signed URL.

**При FAIL:** скрипт выводит `docker compose ps` и `gateway logs --tail=200` для диагностики.

**Fallback (без /etc/hosts):** smoke автоматически использует `curl -H "Host: api.shell.local" http://127.0.0.1/...`. Ручные команды:

```bash
curl -H "Host: api.shell.local" http://127.0.0.1/health
curl -H "Host: api.shell.local" http://127.0.0.1/api/fs/roots
```

---

## 3. Ports

| Service | Port | Purpose |
|---------|------|---------|
| Traefik | 80 | HTTP entrypoint |
| Traefik dashboard | 8080 | Optional: http://localhost:8080 |
| dev-server (Vite) | 5173 | Frontend dev server |
| MinIO (S3 API) | 9000 | Internal (via Traefik on s3.shell.local) |
| Gateway | 3000 | Internal (via Traefik on api.shell.local) |

---

## 3. Routing (FP2)

```
shell.local       → Traefik :80 → dev-server :5173
api.shell.local   → Traefik :80 → gateway :3000
s3.shell.local    → Traefik :80 → minio :9000
```

Traefik uses dynamic config via Docker labels in `infra/docker-compose.dev.yml`.

---

## 4. Commands

| Command | Description |
|---------|-------------|
| `docker compose -f infra/docker-compose.dev.yml up -d` | Full stack: Traefik + MinIO + Gateway + dev-server (все в контейнерах) |
| `docker compose -f infra/docker-compose.dev.yml down` | Stop |
| `pnpm dev` | Только фронт на хосте (без Docker; http://localhost:5173) |

**Full stack** (единственный canonical compose — `infra/docker-compose.dev.yml`):

Compose поднимает **все сервисы в контейнерах**, включая dev-server (Vite). Никакого `pnpm dev` на хосте не требуется.

```bash
docker compose -f infra/docker-compose.dev.yml up -d
# Open http://shell.local
# API: http://api.shell.local
# S3: http://s3.shell.local (MinIO)
```

**Standalone (no Docker):** для разработки только фронта без MinIO/Gateway:
```bash
pnpm dev
# Open http://localhost:5173
```

---

## 5. /health Checks (FP2 DoD)

**После M1** (gateway skeleton): health check проходит. **После M5** (FS endpoints): roots + signed URL.

| Check | Command | Expected | M |
|-------|---------|----------|---|
| Gateway health | `curl http://api.shell.local/health` | 200, `{ "status": "ok" }` | M1 |
| Roots | `curl http://api.shell.local/api/fs/roots` | 200, `{ "roots": [...] }` | M5 |
| Signed URL | `curl -I <signed_url>` (URL from open-url, points to s3.shell.local) | 200 | M5 |

All checks must pass **via domains** (api.shell.local, s3.shell.local), not localhost ports.

---

## 6. SPA routing

Shell SPA uses client-side routing. Traefik must serve `index.html` for all routes (no 404 on refresh).  
**Build task:** Configure Vite dev server `historyApiFallback` (default) and prod static to serve index.html for unknown paths.

---

## 7. Gateway env vars (secrets)

Gateway reads S3 credentials from env. **Never expose to frontend.**

| Var | Purpose |
|-----|---------|
| FS_S3_ENDPOINT | MinIO endpoint (e.g. http://minio:9000) |
| FS_S3_BUCKET | Bucket name (birdmaid-dev) |
| FS_S3_ACCESS_KEY | MinIO access key |
| FS_S3_SECRET_KEY | MinIO secret key |
| FS_SIGNED_URL_TTL_SEC | TTL for presigned URLs (60–300, default 120) |

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- FP2: [docs/fps/FP2.md](../fps/FP2.md)
- API.yaml: [docs/core/API.yaml](../core/API.yaml)
- MinIO: [infra/minio/README.md](../../infra/minio/README.md)
- QNA_DECISIONS: [docs/core/QNA_DECISIONS.md](../core/QNA_DECISIONS.md)
