# Repo Drift Report — REPO_HYGIENE

**Purpose:** Отчёт "что сейчас не по структуре" для миграции.  
**Date:** 2025-02-20

---

## 1. Duplicates

| Item                   | Location 1                        | Location 2                     | Canonical                      |
| ---------------------- | --------------------------------- | ------------------------------ | ------------------------------ |
| docker-compose.dev.yml | `./docker-compose.dev.yml` (root) | `infra/docker-compose.dev.yml` | `infra/docker-compose.dev.yml` |

**Root compose:** outdated (traefik v3.2, no MinIO, no gateway). infra/ has FP2 stack (traefik v3.6.8, MinIO, gateway).

---

## 2. Artifacts to Ignore

| Path                 | Status                | Action               |
| -------------------- | --------------------- | -------------------- |
| `node_modules/`      | Already in .gitignore | ✓                    |
| `**/node_modules/`   | Already in .gitignore | ✓                    |
| `.pnpm-store/`       | Already in .gitignore | ✓                    |
| `dist/`              | Already in .gitignore | ✓                    |
| `coverage/`          | Already in .gitignore | ✓                    |
| `playwright-report/` | Already in .gitignore | ✓                    |
| `test-results/`      | Already in .gitignore | ✓                    |
| `.DS_Store`          | Already in .gitignore | ✓                    |
| `*.log`              | Already in .gitignore | ✓                    |
| `.env`               | Already in .gitignore | ✓                    |
| `back/node_modules`  | Not tracked           | ✓ (gitignore covers) |

**Conclusion:** .gitignore already adequate. Minor additions if needed (e.g. `.env.*` explicit).

---

## 3. Docs "Not in Right Place"

| Item           | Current | Expected             | Notes                                                                                                                                                                                                                |
| -------------- | ------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GUIDE_STYLE.md | Root    | docs/style/ or docs/ | FP7 style guide; STRUCTURE shows docs/style/STYLE_GUIDE.md. Root GUIDE_STYLE.md may be intentional (quick ref). Per plan: root = entrypoints; style guide could stay in docs/style/ or root if referenced by agents. |
| evidence/      | Root    | archive/             | Root evidence/demo-notes.md is stub → archive/FP1/evidence/. Redundant.                                                                                                                                              |

**Decision:** evidence/ in root — delete (archive/FP1/evidence/ is canonical). GUIDE_STYLE.md — keep in root for now (referenced by GUIDE_STYLE.md in many places); or move to docs/style/ and add symlink/redirect. Plan says "root = entrypoints only" — GUIDE_STYLE is product style, not entrypoint. For W1 we don't move GUIDE_STYLE (low risk); document in move map as optional W3.

---

## 4. Scripts Path Mismatch

| Script                           | Current | lint-staged expects               | Action                           |
| -------------------------------- | ------- | --------------------------------- | -------------------------------- |
| check-inline-styles.cjs          | Root    | `scripts/check-inline-styles.cjs` | Move to scripts/                 |
| check-primitives-enforcement.cjs | Root    | (not in lint-staged)              | Move to scripts/ for consistency |

---

## 5. Source of Truth

| Doc        | Path                         | Content                                         |
| ---------- | ---------------------------- | ----------------------------------------------- |
| Dev domain | docs/dev/DEV_DOMAIN.md       | /etc/hosts, smoke, compose path                 |
| Infra      | infra/README.md              | Canonical compose: infra/docker-compose.dev.yml |
| Compose    | infra/docker-compose.dev.yml | Traefik + MinIO + Gateway + dev-server          |

---

## 6. Minimal Move Map

| From                             | To                                       | Rationale                                  | Risk |
| -------------------------------- | ---------------------------------------- | ------------------------------------------ | ---- |
| docker-compose.dev.yml (root)    | DELETE                                   | Duplicate; canonical in infra/             | low  |
| check-inline-styles.cjs          | scripts/check-inline-styles.cjs          | lint-staged path; consolidate scripts      | low  |
| check-primitives-enforcement.cjs | scripts/check-primitives-enforcement.cjs | Consistency                                | low  |
| evidence/ (root)                 | DELETE                                   | Redundant; archive/FP1/evidence/ canonical | low  |

**Optional (W3):** GUIDE_STYLE.md → docs/style/GUIDE_STYLE.md (would require link updates).

---

## 7. Summary

- **Duplicates:** 1 (root docker-compose.dev.yml)
- **Moves:** 2 scripts → scripts/
- **Deletes:** root docker-compose.dev.yml, root evidence/
- **.gitignore:** Already sufficient; no changes required for W1

---

## W2 Audit (before changes)

### package.json scripts (current)

| Script   | Command                                                               |
| -------- | --------------------------------------------------------------------- |
| dev      | vite                                                                  |
| build    | tsc -b && vite build                                                  |
| preview  | vite preview                                                          |
| lint     | eslint front e2e vite.config.ts playwright.config.ts --max-warnings 0 |
| test     | vitest run                                                            |
| smoke    | bash infra/smoke.sh                                                   |
| test:api | vitest run --config vitest.api.config.ts                              |
| test:e2e | playwright test                                                       |

**Missing:** format, format:check, lint:staged, prepare.

### Linters installed / absent

| Tool        | In devDependencies                                           | Config             |
| ----------- | ------------------------------------------------------------ | ------------------ |
| eslint      | ❌ (only @eslint/js, typescript-eslint, eslint-plugin-react) | eslint.config.js   |
| stylelint   | ❌                                                           | .stylelintrc.json  |
| prettier    | ❌                                                           | .prettierrc.json   |
| lint-staged | ❌                                                           | .lintstagedrc.json |
| husky       | ❌                                                           | —                  |

**eslint** is invoked by lint script but not listed; likely transitive. Must add explicitly for reproducible lint.

### Lint-staged commands that may break

| Glob                                | Command                                         | Issue                                  |
| ----------------------------------- | ----------------------------------------------- | -------------------------------------- |
| front/public/\*_/_.{svg,...}        | `node ../../scripts/check-asset-provenance.cjs` | `../../` exits repo when run from root |
| docs/compliance/ASSET_PROVENANCE.md | `node ../../scripts/check-asset-provenance.cjs` | Same; script does not exist            |

**Fix:** Replace with `node scripts/check-asset-provenance.cjs`. Create script if missing.

### PNPM build scripts

- Gateway container runs `pnpm install && pnpm dev`; may see "Ignored build scripts: esbuild…" if pnpm blocks optional deps.
- `test:api` uses vitest; rollup/vite optional deps (e.g. @rollup/rollup-linux-x64-gnu) can fail in container.
- **Policy:** Document corepack + pnpm install; or add approve-builds step for CI/container.

---

## W2.1 Diagnostic (EACCES)

Host `pnpm install` fails with EACCES. Fix: `.npmrc` with `store-dir=.pnpm-store`. Container used as canonical. See GUARDRAILS Troubleshooting.
