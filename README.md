# Birdmaid

## Agent workflow quickstart

- Start FP1 discovery: `FP=FP1 mode=discovery — начать`
- Provide ACK by updating `docs/WORKPLAN.yaml` (ack block)
- Artifacts live under `artifacts/<FP>/<date>/`
- Design-first includes Stitch reference generation and token capture (see UX baseline in `docs/REQUIREMENTS.md`).

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
  - Vendor skills live under `.codex/skills/vendor/**` (current vendor pack: `.codex/skills/agentic-code`).
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

- Create a team (Admin Teams page).
- Create a game (Admin Game Editor) and save.
- Upload a ZIP build that contains `index.html` at the root.
- Publish the game.
- Open the catalog and game page to play in the iframe.

### Test logs and artifacts

- Create artifact folders: `mkdir -p artifacts/FP1/$(date +%F)/{logs,coverage,evidence}`
- Capture front test log: `cd front && npm run test:ci | tee ../artifacts/FP1/$(date +%F)/logs/front-tests.log`
- Capture back test log: `cd back && npm run test:ci | tee ../artifacts/FP1/$(date +%F)/logs/back-tests.log`
- Copy coverage summary:\n  - `cp front/coverage/coverage-summary.json artifacts/FP1/$(date +%F)/coverage/coverage-front.json`\n  - `cp back/coverage/coverage-summary.json artifacts/FP1/$(date +%F)/coverage/coverage-back.json`
