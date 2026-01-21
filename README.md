# Birdmaid

Birdmaid is an itch.io-at-home for the Omsk gamedev community: a small, hackathon-friendly catalog where teams can publish web builds and players can discover and play them in the browser.

## Current Status

- **FP1**: Browse & Play + Admin Authoring (status: release)
- **FP2**: Team System and Game Editing (status: release)
- **FP3**: Windows 95 UI Behavior (status: release)
- **FP4**: User Accounts & Windows 95 UI (status: release)
- **FP5**: UI/UX Fixes and Polish (status: release, gate PASS)


## Codex Skills

Skills live under `.codex/skills/**` and are opt-in: each workflow-role (in `ai/roles/`) lists required skills and when to run them. If a skill is installed but not referenced by any role, it is considered unused and must be wired in or removed (out of scope to remove now).

| Skill name (folder) | Origin | Purpose | Used by workflow-roles |
| --- | --- | --- | --- |
| birdmaid-ux-modern-baseline | project | Enforce UX baseline in docs | design |
| fp-bootstrap | project | Bootstrap FP scope artifacts | plan |
| ux-map-sync | project | Sync UX_MAP with API/MODEL | design |
| agentic-code/documentation-criteria | vendor | Doc quality checks | plan, design, build, release |
| agentic-code/testing-strategy | vendor | Shape UAT/BDD + RTM | build |
| agentic-code/testing | vendor | Testing practices guidance | build |
| agentic-code/coding-rules | vendor | Coding rules guardrails | build |
| agentic-code/implementation-approach | vendor | Implementation approach | design, build |
| agentic-code/integration-e2e-testing | vendor | Integration/E2E testing | build |
| agentic-code/ai-development-guide | vendor | General dev guidance | plan, build |
| agentic-code/metacognition | vendor | Self-check and risk scan | release |
| agents/product-lead | project | Product management skills | Product Lead agent |
| agents/designer | project | UX design and BA skills | Designer agent |
| agents/analyst | project | Product analytics skills | Analyst agent |
| agents/engineer | project | Technical skills | Engineer agent |
| agents/delivery | project | Project delivery skills | Delivery agent |
| agents/compliance | project | Security and compliance skills | Compliance agent |

> **Примечание:** Workflow-роли находятся в `ai/roles/`. См. [ai/roles/README.md](./ai/roles/README.md) для подробностей.

## Installing / Updating skills

- Prerequisites: Node.js + npx.
- Install vendor skills (agentic-code): `npx agentic-code skills --codex --project`
- Verify install: list `.codex/skills/**` and confirm each skill folder has `SKILL.md`.
- Update/reinstall: rerun the same install command.
- Policy:
  - Vendor skills live under `.codex/skills/agentic-code/**` (current vendor pack).
  - Project-specific skills live under `.codex/skills/birdmaid-*/SKILL.md`.

## Runbook (scaffolds)

- Frontend install: `cd front && npm install`
- Frontend dev: `cd front && npm run dev`
- Frontend tests: `cd front && npm test`
- Frontend tests (CI): `cd front && npm run test:ci`
- Frontend coverage: `cd front && npm run coverage`
- Backend install: `cd back && npm install`
- Backend dev: `cd back && npm run start:dev`
- Backend tests: `cd back && npm test`
- Backend tests (CI): `cd back && npm run test:ci`
- Backend coverage: `cd back && npm run coverage`

## Docker Compose (local MVP)

- Build and start everything: `docker compose up --build`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/health`
- MinIO console: `http://localhost:9001` (user/pass: `minioadmin`)

### Local MVP flow

1. **Authentication** (FP4):
   - Register a new account or login
   - Super Admin accounts can be created via MongoDB flag (`isSuperAdmin: true`)

2. **Team Management** (FP4):
   - Create a team (Teams page)
   - Add team members by login (team leader only)
   - Transfer team leadership

3. **Game Creation** (FP1, FP4):
   - Create a game (Editor page) for your team
   - Upload cover image (300 KB max, image files only)
   - Upload a ZIP build that contains `index.html` at the root
   - Add user tags (Enter/comma separated) and system tags (Super Admin only)
   - Publish the game

4. **Playing Games**:
   - Browse catalog with search and tag filtering
   - Open game page and click "Play" to open in modal
   - View team members, comments, and game details

5. **Admin Features** (Super Admin):
   - Edit any game
   - Force status changes with remarks
   - Manage system tags

### Test logs and artifacts

- Create artifact folders: `mkdir -p artifacts/FP<N>/$(date +%F)/{logs,coverage,evidence}`
- Capture front test log: `cd front && npm run test:ci | tee ../artifacts/FP<N>/$(date +%F)/logs/front-tests.log`
- Capture back test log: `cd back && npm run test:ci | tee ../artifacts/FP<N>/$(date +%F)/logs/back-tests.log`
- Copy coverage summary:
  - `cp front/coverage/coverage-summary.json artifacts/FP<N>/$(date +%F)/coverage/coverage-front.json`
  - `cp back/coverage/coverage-summary.json artifacts/FP<N>/$(date +%F)/coverage/coverage-back.json`

## Работа с агентами

Проект использует упрощенный подход к работе с AI-агентами:

### Команда агентов (6 человек)

1. **@Product Lead** — управляет продуктом, определяет проблему, outcome, приоритеты
2. **@Designer** — UX + BA, строит journey map, требования, прототипы
3. **@Analyst** — метрики, воронки, аналитика, эксперименты
4. **@Engineer** — техническая реализация, feasibility, архитектура, код
5. **@Delivery** — план релиза, координация, зависимости, риски
6. **@Compliance** — комплаенс, безопасность, приватность

### Workflow-этапы (4 этапа)

1. **plan** — планирование: discovery + plan
2. **design** — дизайн: design-first + architecture
3. **build** — реализация: tests-red + implement + tests-green
4. **release** — релиз: gate + acceptance

### Как использовать

**Вызов агента:**
```
@Product Lead: нужно определить scope для FP6
```

**Работа над Feature Pack:**
```
FP=FP6 mode=plan
FP=FP6 mode=design
FP=FP6 mode=build
FP=FP6 mode=release
```

**Единый файл для каждого FP:** `docs/fps/FP<N>.md` — вся информация в одном месте.

См. [AGENTS.md](./AGENTS.md) для полного описания workflow и правил работы.

## Project Structure

- `front/` - React + Vite + TypeScript frontend (Windows 95 UI styling)
- `back/` - NestJS backend (MongoDB + S3-compatible storage)
- `docs/core/` - Основные документы проекта (sources of truth)
  - См. [docs/README.md](./docs/README.md) для навигации
- `docs/fps/` - Feature Pack файлы (единый файл для каждого FP)
  - См. [docs/fps/README.md](./docs/fps/README.md)
- `ai/agents/` - Агенты-специалисты (6 агентов: Product Lead, Designer, Analyst, Engineer, Delivery, Compliance)
  - См. [ai/agents/README.md](./ai/agents/README.md)
- `ai/roles/` - Workflow-роли (4 этапа: plan, design, build, release) + audit-роли
  - См. [ai/roles/README.md](./ai/roles/README.md)
- `ai/roles/audit/` - Аудит-роли (analyst, inspector, supervisor)
- `docs/fps/` - Feature Pack файлы (единый файл для каждого FP)
  - См. [docs/fps/README.md](./docs/fps/README.md)
- `.cursor/rules/` - Правила для Cursor
  - См. [.cursor/rules/README.md](./.cursor/rules/README.md)
- `artifacts/` - Test logs, coverage, and evidence (not committed to git)
- `.codex/skills/` - Codex skills (vendor and project-specific)

## Technology Stack

### Frontend
- React 18.2.0
- Vite 5.1.0
- TypeScript 5.4.0
- React Router 6.22.0
- Vitest for testing
- Windows 95 styled UI components (custom)

### Backend
- NestJS 10.3.0
- MongoDB 6
- S3-compatible storage (MinIO)
- JWT authentication (@nestjs/jwt)
- bcrypt for password hashing
- nodemailer for email (password recovery)

### Infrastructure
- Docker Compose for local development
- MongoDB for data storage
- MinIO for S3-compatible object storage
- Node.js runtime
