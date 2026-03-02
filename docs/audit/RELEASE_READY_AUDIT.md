# Release Ready Audit — FP=REPO mode=audit R5

**Date:** 2026-03-01  
**Scope:** Full release-readiness audit after R1–R4 (cleanup, docs stitching, product docs, release pack)  
**Rule:** PASS or REJECT only. No "almost ready".

---

## Verdict: **REJECT**

---

## 1. Commands + Exit Codes

| # | Command | Expected | Actual | Evidence |
|---|---------|----------|--------|----------|
| 1 | `git status --porcelain` | empty | NOT empty | Uncommitted R1–R4 changes; untracked archive/REPO/, RELEASE_PREP_AUDIT |
| 2 | `./infra/smoke.sh` | PLATFORM OK | PLATFORM FAIL | Gateway health timeout after 60s |
| 3 | `pnpm lint` | 0 | 0 | PASS |
| 4 | `pnpm format:check` | 0 | 1 | 11 files: Prettier issues |
| 5 | `pnpm test:api` | 0 | 1 | 8 failed (ECONNREFUSED 5173, FP5 discovery 404) |
| 6 | `./infra/test-lint.sh` | 0 | 1 | format:check fails |
| 7 | `./infra/test-api.sh` | 0 | 1 | 8 failed, 6 passed, 106 skipped |
| 8 | `node tools/check-doc-links.cjs docs/` | 0 | 0 | PASS |

---

## 2. P0 Blockers (REJECT only)

| # | Blocker | Fix |
|---|---------|-----|
| 1 | **Clean-state** — `git status --porcelain` not empty | Commit all R1–R4 changes. Release gate requires clean state. |
| 2 | **format:check** — 11 files fail Prettier | Run `pnpm format --write` on: README.md, docs/README.md, docs/fps/README.md, docs/fps/FP5.md, docs/dev/FP5_SECURITY_DOD.md, docs/audit/FP5_AUDIT_REPORT.md, docs/audit/RELEASE_PREP_AUDIT.md, archive/FP4/README.md, archive/REPO/README.md, eslint.config.js, package.json |
| 3 | **smoke** — PLATFORM FAIL | Gateway /health not reachable. Check /etc/hosts, Docker network, Traefik routing. |
| 4 | **test:api** — 8 tests failed | ECONNREFUSED ::1:5173 (dev-server); FP5 discovery 404 (api.shell.local). Ensure stack up, gateway reachable from test container. |

---

## 3. Additional Checks (OK)

| Check | Result |
|-------|--------|
| Active docs TEMP/dev-only junk | OK — `docs/dev/_tmp/` removed (R1). TEMP(FP5.1) docs (FP5_SECURITY_DOD, etc.) are marked; kept until FP5 archive. |
| Archive preserved | OK — archive/FP4/, archive/REPO/ present; separate from active docs. |
| README + docs/README linked | OK — README → docs/README; docs/README → Feature Packs, Current functionality, Demo/review. |
| Demo flow exists | OK — README § Demo flow: 6 steps (Shell → Explorer → Image → Media → User app). |
| Demo flow matches reality | OK — Fixtures: My Documents/Images/sample.jpg, Videos/sample.mp4. |

---

## 4. Evidence

| Artifact | Path |
|----------|------|
| Audit report | `docs/audit/RELEASE_READY_AUDIT.md` |
| Previous audit | `docs/audit/RELEASE_PREP_AUDIT.md` |

---

## 5. DoD Checklist

- [ ] git status empty
- [ ] smoke → PLATFORM OK
- [ ] format:check exit 0
- [ ] test:api exit 0
- [x] doc links resolve
- [x] active docs not cluttered
- [x] archive preserved
- [x] README + docs/README linked
- [x] demo flow exists

---

## 6. Next Steps

1. Fix format: `pnpm format --write`
2. Commit R1–R4 changes
3. Verify smoke: `./infra/smoke.sh` → PLATFORM OK
4. Verify test:api: `./infra/test-api.sh` exit 0
5. Re-run audit
