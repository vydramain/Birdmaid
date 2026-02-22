# Repository Rules — Canonical

**Purpose:** Single source for repo structure, hygiene, gate semantics, and process. All agents must follow.

---

## 1. Structure (STRUCTURE)

- **Root:** entrypoints only (README, AGENTS, package.json, configs). No duplicate compose, no evidence/, test-results/ in root.
- **Canonical compose:** `infra/docker-compose.dev.yml` only.
- **Scripts:** `scripts/` for style/guardrail checks.
- **Docs:** `docs/core/`, `docs/fps/`, `docs/dev/`, `docs/style/`, `docs/tests/`, `docs/audit/`.

---

## 2. Gate Semantics (GUARDRAILS)

**PASS only when ALL conditions met. Otherwise → REJECT.**

| Condition | Command / Check |
|-----------|-----------------|
| Clean-state | `git status --porcelain` empty |
| Stack | `./infra/smoke.sh` → PLATFORM OK |
| Lint/format | `./infra/test-lint.sh` exit 0 |
| API tests | `./infra/test-api-fp.sh FP<N>` exit 0 (if in DoD) |
| E2E tests | `./infra/test-e2e-fp.sh FP<N>` exit 0 (if in DoD) |
| AC/DoD | All items in FP file have evidence |

**Prohibited:** Partial PASS, "PASS (but…)", known failing, skipped FP tests.

**Canonical execution:** Container scripts (`./infra/*.sh`). Host-only: `git status`, `./infra/smoke.sh`.

---

## 3. Twelve-Factor (Config)

- Config via env vars, not in code.
- `.env` in .gitignore; secrets via env.
- Build/release/run stages separate.
- Dev-prod parity (docker-compose.dev.yml).

---

## 4. Security

- No secrets in code; `.env` in .gitignore.
- Config via env vars (see § Twelve-Factor).
- `pnpm audit` in CI; pin versions in lockfile.
- CORS allowlist only (no `*`).
- Validate input; no stack traces to client in prod.

---

## 5. Commits (COMMITS)

- Conventional Commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`.
- Scope: `front`, `back`, `docs`, `infra`, `e2e`, `scripts`, `deps`, `dev`.
- commitlint in pre-commit.

---

## 6. Code Review (CODE_REVIEW)

- Small PRs; clear description.
- Checklist: lint, format:check, test pass.
- No patching docs to justify violations.

---

## 7. Release Gate

Per-FP command matrix (see docs/dev/GUARDRAILS.md). Commands: `git status`, `./infra/smoke.sh`, `./infra/test-lint.sh`, `./infra/test-api-fp.sh FP<N>`, `./infra/test-e2e-fp.sh FP<N>`. All exit 0 for PASS. Evidence: file paths + verification commands. Update FP status and Evidence section after gate.

---

## References

- [STYLE_GUIDE.md](STYLE_GUIDE.md)
- [GUIDE_STYLE.md](GUIDE_STYLE.md) — Win95 style, inline-style policy (same dir)
- [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md) — full enforcement details
- [docs/dev/ARCHITECTURE.md](../dev/ARCHITECTURE.md)
