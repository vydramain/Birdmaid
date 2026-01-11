# Birdmaid

Birdmaid is an itch.io-at-home for the Omsk gamedev community: a small, hackathon-friendly catalog where teams can publish web builds and players can discover and play them in the browser.

## Current Status

- **FP1**: Browse & Play + Admin Authoring (status: implement)
- **FP2**: Added team system and game editing (status: completed)
- **FP3**: Added Windows 95 UI behavior (status: completed)
- **FP4**: User Accounts & Windows 95 UI (status: completed)
- **FP5**: UI/UX Fixes and Polish (status: gate, PASS - completed)


## Codex Skills

Skills live under `.codex/skills/**` and are opt-in: each role lists required skills and when to run them. If a skill is installed but not referenced by any role, it is considered unused and must be wired in or removed (out of scope to remove now).

| Skill name (folder) | Origin | Purpose | Used by roles |
| --- | --- | --- | --- |
| birdmaid-ux-modern-baseline | project | Enforce UX baseline in docs | design-first |
| fp-bootstrap | project | Bootstrap FP scope artifacts | discovery |
| ux-map-sync | project | Sync UX_MAP with API/MODEL | design-first |
| agentic-code/documentation-criteria | vendor | Doc quality checks | discovery, plan, design-first, tests-red, gate |
| agentic-code/testing-strategy | vendor | Shape UAT/BDD + RTM | tests-red |
| agentic-code/testing | vendor | Testing practices guidance | tests-red, tests-green |
| agentic-code/coding-rules | vendor | Coding rules guardrails | implement |
| agentic-code/implementation-approach | vendor | Implementation approach | implement |
| agentic-code/integration-e2e-testing | vendor | Integration/E2E testing | tests-green |
| agentic-code/ai-development-guide | vendor | General dev guidance | plan, implement |
| agentic-code/metacognition | vendor | Self-check and risk scan | gate |

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

## Project Structure

- `front/` - React + Vite + TypeScript frontend (Windows 95 UI styling)
- `back/` - NestJS backend (MongoDB + S3-compatible storage)
- `docs/` - Project documentation (REQUIREMENTS.md, API.yaml, UX_MAP.md, TESTS.md, etc.)
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
