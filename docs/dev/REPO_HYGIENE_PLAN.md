# Repo Hygiene Plan — REPO_HYGIENE

**Purpose:** Привести репозиторий Birdmaid_v2 к человеко-читаемой структуре и поставить "заслон" от мусора.  
**Mode:** build (структурные изменения + tooling + docs, без изменения логики кода).  
**Constraints:** НЕ менять публичные теги, НЕ делать релиз. Коммиты создаёт пользователь.

---

## Target Tree (from STRUCTURE.md + Birdmaid product)

```
/
├── .gitignore
├── AGENTS.md
├── README.md
├── STRUCTURE.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig*.json
├── eslint.config.js
├── vite.config.ts
├── vitest.config.ts
├── vitest.api.config.ts
├── playwright.config.ts
├── .editorconfig
├── .lintstagedrc.json
├── .prettierrc.json
├── .stylelintrc.json
├── commitlint.config.js
├── .github/workflows/ci.yml
│
├── ai/
├── .cursor/rules/
├── .codex/skills/
│
├── docs/
│   ├── README.md
│   ├── agents/
│   ├── dev/
│   ├── fps/
│   ├── core/
│   ├── style/
│   ├── tests/
│   └── audit/
│
├── infra/
│   ├── docker-compose.dev.yml    # canonical compose
│   ├── Dockerfile.dev
│   ├── smoke.sh
│   └── minio/
│
├── front/
├── back/
├── e2e/
│
├── tools/
│   ├── README.md
│   └── check-doc-links.cjs
│
├── scripts/                       # style/guardrail checks
│   ├── check-inline-styles.cjs
│   └── check-primitives-enforcement.cjs
│
└── archive/
```

**Root = entrypoints only.** Никаких дублей compose, артефактов (evidence/, playwright-report/, test-results/), node_modules в подкаталогах.

---

## Migration Plan (3 waves)

### W1: Cleanup + moves + .gitignore (NO logic changes)

| Action                   | Details                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Remove duplicate compose | Root `docker-compose.dev.yml` → delete. Canonical: `infra/docker-compose.dev.yml`                   |
| Move scripts             | `check-inline-styles.cjs`, `check-primitives-enforcement.cjs` → `scripts/`                          |
| Root cleanup             | evidence/ → archive/ (if old artifacts) or .gitignore                                               |
| .gitignore               | Ensure: node_modules/, dist/, coverage/, playwright-report/, test-results/, .env, .DS_Store, \*.log |
| back/node_modules        | If tracked → `git rm -r --cached`; else ensure .gitignore                                           |

**DoD:** Repo root cleaned, no duplicates, .gitignore blocks runtime junk.

---

### W2: Tooling (husky + lint-staged + guardrails)

| Action                 | Details                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Husky + lint-staged    | pre-commit → `pnpm lint:staged`                                      |
| Scripts paths          | .lintstagedrc.json: `scripts/check-inline-styles.cjs` (path correct) |
| package.json scripts   | lint, format, lint:staged, test:api, test:e2e                        |
| Style guardrails       | check-inline-styles, stylelint (px, !important), eslint              |
| test:canary            | Document or add front/**tests**/style-guardrails/\*                  |
| docs/dev/GUARDRAILS.md | Add "Enforcement" section                                            |

**DoD:** Husky + lint-staged enforced; style guardrails block violations.

---

## W2 Enforcement Checklist

**Commands that MUST PASS:**

- `pnpm lint` — ESLint + Stylelint (max-warnings=0)
- `pnpm format:check` — Prettier check
- `pnpm test:api` — API integration tests (16/16)
- `./infra/smoke.sh` — PLATFORM OK
- `bash .husky/pre-commit` — lint-staged on staged files

**Pre-commit:** Must run `pnpm lint:staged` (no full test:api on pre-commit).

---

## Definition of DONE (W2)

- [ ] Husky installed, pre-commit runs lint-staged
- [ ] Lint-staged uses ONLY paths inside repo (no `../../`)
- [ ] `pnpm lint` PASS on clean clone (eslint, stylelint in devDependencies)
- [ ] Container `test:api` PASS: `docker run ... node:22-alpine sh -c "corepack enable pnpm && pnpm install && pnpm test:api"`

### W2.4 PNPM policy (chosen: C — Pin toolchain + corepack)

- Node ≥22, pnpm via corepack
- Container command: `corepack enable pnpm && pnpm install && pnpm test:api`
- If optional deps (rollup, esbuild) fail: run `pnpm install` on host first, or add `pnpm approve-builds` step in CI (see GUARDRAILS.md)

---

## W2 Evidence (completed)

### Changed/Added

| Action  | Path                                         |
| ------- | -------------------------------------------- |
| ADDED   | scripts/check-asset-provenance.cjs           |
| ADDED   | .husky/pre-commit                            |
| ADDED   | .stylelintignore (front/index.css until FP7) |
| UPDATED | .lintstagedrc.json (../../ → scripts/)       |
| UPDATED | package.json (scripts, devDependencies)      |
| UPDATED | docs/dev/GUARDRAILS.md (Enforcement section) |
| UPDATED | docs/dev/REPO_HYGIENE_PLAN.md (W2 DoD)       |
| UPDATED | docs/dev/REPO_DRIFT_REPORT.md (W2 audit)     |
| ADDED   | .npmrc, .prettierignore                      |
| UPDATED | docs/core/API.yaml (YAML fix)                |

### W2 Status: **PASS** (container canonical)

Host `pnpm install` may fail (EACCES). Use container:

```bash
docker run --rm --add-host api.shell.local:host-gateway --add-host s3.shell.local:host-gateway \
  -v $(pwd):/app -w /app node:22 sh -c "git config --global --add safe.directory /app && corepack enable pnpm && pnpm install && pnpm lint && pnpm format:check && pnpm test:api && bash .husky/pre-commit"
```

**Prerequisite:** `./infra/smoke.sh` (stack up).

---

## W3 Evidence (completed)

### Changed/Added

| Action  | Path                                                                       |
| ------- | -------------------------------------------------------------------------- |
| UPDATED | README.md (Quickstart, verification matrix, troubleshooting)               |
| UPDATED | docs/README.md (Documentation Index)                                       |
| UPDATED | docs/dev/DEV_DOMAIN.md (Entrypoints section)                               |
| UPDATED | infra/README.md (stack, domains, fixtures, logs, smoke)                    |
| UPDATED | .prettierignore (heavy dirs)                                               |
| ADDED   | .dockerignore                                                              |
| UPDATED | docs/dev/GUARDRAILS.md (EACCES fix, format policy, pre-commit, asset TODO) |

### W3 Status: **PASS**

| Verification                           | Result       |
| -------------------------------------- | ------------ |
| `node tools/check-doc-links.cjs docs/` | PASS         |
| `./infra/smoke.sh`                     | PLATFORM OK  |
| Container `pnpm test:api`              | 16/16 passed |

---

### W3: Docs alignment + "how to run"

**Scope:** docs only, no code moves.

| Action                     | Details                                                        |
| -------------------------- | -------------------------------------------------------------- |
| Root README                | Quickstart (dev), canonical verification, troubleshooting      |
| docs/README.md             | Documentation Index (Start here, FPs, core, guardrails, audit) |
| docs/dev/DEV_DOMAIN.md     | Entrypoints section (front, gateway, MinIO, Traefik, fixtures) |
| infra/README.md            | What runs, domains, ports, fixtures, logs, smoke               |
| .gitignore/.prettierignore | Generated dirs, prevent dirty repo                             |
| GUARDRAILS                 | EACCES fix path, format policy, pre-commit honesty             |

**DoD:**

- [ ] Root README has Quickstart + canonical checks
- [ ] docs/README.md is navigation index
- [ ] DEV_DOMAIN has entrypoints
- [ ] infra/README explains stack + smoke
- [ ] Ignores prevent dirty repo
- [ ] `node tools/check-doc-links.cjs docs/` PASS
- [ ] `./infra/smoke.sh` PLATFORM OK

---

## Hard Rules

1. **No new folders** without reflection in STRUCTURE.md.
2. **Generated files** → dist/, coverage/, playwright-report/, test-results/ — all ignored.
3. **node_modules** — never committed (anywhere).
4. **Canonical dev compose** — `infra/docker-compose.dev.yml` only.
5. **Root docker-compose.dev.yml** — delete (preferred) or stub pointing to infra/.

---

## W1 Evidence (completed)

### Changed/Added/Deleted

| Action  | Path                                                      |
| ------- | --------------------------------------------------------- |
| ADDED   | docs/dev/REPO_HYGIENE_PLAN.md                             |
| ADDED   | docs/dev/REPO_DRIFT_REPORT.md                             |
| ADDED   | scripts/check-inline-styles.cjs                           |
| ADDED   | scripts/check-primitives-enforcement.cjs                  |
| DELETED | docker-compose.dev.yml (root)                             |
| DELETED | check-inline-styles.cjs (root)                            |
| DELETED | check-primitives-enforcement.cjs (root)                   |
| DELETED | evidence/demo-notes.md (content in archive/FP1/evidence/) |
| ADDED   | evidence/README.md (tombstone)                            |
| UPDATED | docs/fps/FP1.md (evidence paths, compose refs)            |

### Move Map

| From                             | To                                       |
| -------------------------------- | ---------------------------------------- |
| check-inline-styles.cjs          | scripts/check-inline-styles.cjs          |
| check-primitives-enforcement.cjs | scripts/check-primitives-enforcement.cjs |

### Commands

```bash
pnpm lint
pnpm test:api
./infra/smoke.sh
node tools/check-doc-links.cjs docs/
```

### DoD Checklist

- [x] Repo root cleaned (no duplicates)
- [x] .gitignore blocks runtime junk (already adequate)
- [ ] Husky + lint-staged enforced (W2)
- [ ] Style guardrails enforced (W2)
- [ ] FP2 test:api remains green (env: rollup deps; FP2 evidence 16/16)
- [x] Docs updated and links valid

---

---

## W4: Future — Nx affected (опционально)

При росте репо (pnpm workspace с несколькими пакетами, CI >5 мин) рассмотреть:

- **Nx** или **Turborepo** для affected builds
- Запускать lint/test/build только для затронутых проектов
- См. [Nx affected](https://nx.dev/concepts/affected)

---

## References

- [STRUCTURE.md](../../STRUCTURE.md)
- [GUIDE_STYLE.md](../../GUIDE_STYLE.md)
- [docs/audit/FP2_AUDIT_REPORT.md](../audit/FP2_AUDIT_REPORT.md)
- [.lintstagedrc.json](../../.lintstagedrc.json)
