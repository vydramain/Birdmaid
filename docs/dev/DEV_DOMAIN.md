# Dev Domain — shell.local

**Purpose:** Single path for FP1 dev: shell.local via Traefik.  
**ADR:** Dev domain: Traefik + docker-compose (QNA_DECISIONS ADR#8, ADR#11).

---

## 1. /etc/hosts (required for shell.local)

Add `shell.local` → `127.0.0.1` so the browser resolves the domain:

```
127.0.0.1 shell.local
```

**Linux/macOS:** `sudo nano /etc/hosts`  
**Windows:** `C:\Windows\System32\drivers\etc\hosts`

Without this, `http://shell.local` will not resolve.

---

## 2. Ports

| Service | Port | Purpose |
|---------|------|---------|
| Traefik | 80 | HTTP entrypoint |
| Traefik dashboard | 8080 | Optional: http://localhost:8080 |
| dev-server (Vite) | 5173 | Frontend dev server |

---

## 3. Routing

```
shell.local (Host header)
    → Traefik :80
    → dev-server :5173 (loadbalancer)
```

Traefik uses dynamic config via Docker labels:
- `traefik.http.routers.shell.rule=Host(\`shell.local\`)`
- `traefik.http.services.shell.loadbalancer.server.port=5173`

---

## 4. Commands

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up -d` | Start Traefik + dev-server (from repo root) |
| `docker compose -f infra/docker-compose.dev.yml up -d` | Same, alternative path |
| `docker compose -f docker-compose.dev.yml down` | Stop |
| `pnpm dev` | Run dev-server only (no Traefik; use http://localhost:5173) |

**Full stack (shell.local):**
```bash
docker compose -f docker-compose.dev.yml up -d
# Open http://shell.local
```

**Standalone (no Docker):**
```bash
pnpm dev
# Open http://localhost:5173
```

**Traefik only (proxy to host dev-server):**  
Run `pnpm dev` on host, then start Traefik with `host.docker.internal` or `network_mode: host`. Optional: create `infra/docker-compose.traefik-only.yml` for this variant.

---

## 5. /health

- **URL:** `http://shell.local/health` (or `http://localhost:5173/health` standalone)
- **Expected:** `200` with JSON `{ "status": "ok" }` (or similar per API.yaml)
- **AC A2:** `/health = 200`

---

## 6. SPA routing

Shell SPA uses client-side routing. Traefik must serve `index.html` for all routes (no 404 on refresh).  
**Build task:** Configure Vite dev server `historyApiFallback` (default) and prod static to serve index.html for unknown paths.

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- API.yaml: [docs/core/API.yaml](../core/API.yaml)
- QNA_DECISIONS: [docs/core/QNA_DECISIONS.md](../core/QNA_DECISIONS.md)
