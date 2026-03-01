# Release Prep Audit — FP=REPO mode=build R0

**Date:** 2026-03-01  
**Scope:** Release readiness audit (no product changes)  
**Mode:** R0 (audit only, no fixes)  
**References:** AGENTS.md, docs/agents/WORKFLOW.md, docs/dev/GUARDRAILS.md, STRUCTURE.md, REPO_RULES.md

---

## 0. Release Blockers (DoD)

| # | Blocker | Evidence |
|---|---------|----------|
| 1 | **Baseline gate RED** — `./infra/test-lint.sh` exit 1 | `pnpm format:check` fails on 4 files: `docs/dev/FP5_SECURITY_DOD.md`, `docs/fps/FP5.md`, `eslint.config.js`, `package.json` |
| 2 | **git pull** — no tracking branch | Branch `FP7_RENAMED` has no upstream; `git pull --rebase` fails |

**Queue-safety:** Per R0 rules, no code fixes in this milestone. Blockers must be fixed in R1 before any release prep work.

---

## 1. Findings — Four Tables

### 1.A Repo Cleanup

| Item | Path / Pattern | Action | Notes |
|------|----------------|--------|-------|
| TEMP(FP5.1) docs in _tmp | `docs/dev/_tmp/TEMP(FP5.1)_M0_BUILD_AUDIT.md` | Move to archive or delete on FP5 archive | Explicitly marked TEMP(FP5.1) |
| TEMP docs in _tmp | `docs/dev/_tmp/TEMP_M0_TEST_POLLUTION_AUDIT.md` | Move to archive or delete | M0 baseline; full audit in REPO_M4 |
| Entire _tmp dir | `docs/dev/_tmp/*` | Remove or archive | 2 files; dev-only audit artifacts |
| TEMP(FP5.1) in docs | `docs/dev/FP5_SECURITY_DOD.md`, `docs/dev/DESIGN_LOG_FP5_1.md`, `docs/core/UX_FP5_1.md`, `docs/core/API_FP5_DELTA.md`, `docs/tests/FP5_TESTS.md` | Merge into FP5.md or archive on FP5 release | Marked "MUST MERGE/DELETE ON ARCHIVE FP5" |
| Outdated audit notes | `docs/audit/REPO_A0_LINT_BASELINE_AUDIT.md`, `REPO_A1_LINT_FIX_EVIDENCE.md`, `REPO_A2_LINT_REAUDIT.md` | Archive or consolidate | Lint baseline history; superseded by current state |
| evidence/ tombstone | `evidence/README.md` | Keep; fix broken link | Links to `archive/FP1/evidence/demo-notes.md` — archive/FP1/ does not exist |
| Scripts | `scripts/*.cjs`, `tools/check-doc-links.cjs` | Keep | Canonical per GUARDRAILS; part of lint/CI |

---

### 1.B Documentation Integrity

| Item | Path / Pattern | Severity | Notes |
|------|----------------|----------|-------|
| Broken link | `evidence/README.md` → `archive/FP1/evidence/demo-notes.md` | High | archive/FP1/ does not exist |
| Missing file | `docs/audit/FP2_AUDIT_REPORT.md` | Medium | Referenced in FP2.md, evidence/README.md |
| Missing file | `docs/audit/FP3_AUDIT_REPORT.md` | Medium | Referenced in FP3.md § Docs consolidation |
| Duplicate row | docs/README.md § Feature Packs | Low | `fps/FP3.md` and `fps/FP_EXAMPLE.md` each listed twice |
| Old audit path ref | `REPO_M4_TEST_POLLUTION_AUDIT.md` → `docs/dev/_tmp/TEMP_M0_TEST_POLLUTION_AUDIT.md` | Low | M0 baseline; _tmp may be removed |
| Doc links | `node tools/check-doc-links.cjs docs/` | OK | All internal doc links resolve |

**README vs docs/README consistency:**
- Root README: "FP1 (Shell MVP), FP2 (Gateway + FS contract) released" — omits FP3, FP4
- docs/README: Lists FP1–FP4; no FP5 in Feature Packs table
- WORKPLAN.yaml: FP1–FP5 all "plan"/"pending" — outdated vs actual FP1–FP4 released

---

### 1.C Product Documentation Coverage

| Aspect | Status | Gap |
|--------|--------|-----|
| Current functionality | Partial | REQUIREMENTS.md FR-1..FR-7 checked; UX_MAP Overview shows FP1/FP3 "plan" — contradicts FP1–FP4 released |
| UX_MAP | Stale | Overview table: FP1, FP3 status = "plan"; CTA table status = "todo" — all implemented |
| FP specs | Good | FP1–FP5 have scope, DoD, evidence; FP4 archived |
| API/MODEL | Good | core/API.yaml, PROTOCOL_v0.md, THEMING.md present |
| Gap implemented vs documented | Yes | UX_MAP, WORKPLAN.yaml not synced with FP1–FP4 release state |

---

### 1.D Release Presentation Readiness

| Item | Status | Notes |
|------|--------|-------|
| Quickstart | OK | README § Quickstart (dev): stack, smoke, API tests, front dev, full stack |
| Demo flow | Missing | No step-by-step "how to demo to team" (e.g. open Shell → My Computer → Explorer → open file → viewer) |
| Feature summary | Partial | README: "Browser-based window manager + taskbar + AppHost"; no FP1–FP4 feature list |
| Known limitations | Partial | FP5.md has Known Limitations; no repo-level summary (Godot HTTPS, sandbox warning, etc.) |
| Troubleshooting | OK | README § Troubleshooting; FP5 § Troubleshooting |

---

## 2. Release-Prep Backlog

### Delete
- None in R0 (audit only). Defer to R1+: `docs/dev/_tmp/*` after archiving or merging.

### Archive / Move
| From | To | When |
|------|-----|------|
| `docs/dev/_tmp/TEMP(FP5.1)_M0_BUILD_AUDIT.md` | `archive/FP5/` (on FP5 archive) | R4 |
| `docs/dev/_tmp/TEMP_M0_TEST_POLLUTION_AUDIT.md` | `archive/REPO/` or delete | R2 |
| `docs/audit/REPO_A0_*.md`, `REPO_A1_*.md`, `REPO_A2_*.md` | `archive/audit/` (optional) | R3 |

### Update
| File | Change |
|------|--------|
| `evidence/README.md` | Fix link: archive/FP1/ → either create archive/FP1/ or point to docs/audit/FP4 or remove dead ref |
| `docs/README.md` | Remove duplicate rows; add FP5 to Feature Packs if in scope |
| `README.md` | Add FP3, FP4 to "released" line; or add Feature summary table |
| `docs/core/UX_MAP.md` | Sync Overview: FP1–FP4 status = done/released |
| `docs/core/WORKPLAN.yaml` | Sync FP1–FP4 status = released |
| `docs/fps/FP2.md` | Either create FP2_AUDIT_REPORT.md or remove reference |
| `docs/fps/FP3.md` | Either create FP3_AUDIT_REPORT.md or change to "evidence in FP3.md" |

### Create (only if necessary)
| Artifact | Purpose |
|----------|---------|
| `docs/DEMO_FLOW.md` | Step-by-step demo script for team presentation |
| `docs/FEATURE_SUMMARY.md` | One-page FP1–FP4 feature list + known limitations |
| `archive/FP1/` | If FP1 evidence is to be canonical (evidence/README references it) |

---

## 3. Minimal Patch Plan — Milestones R1..R5

| Milestone | Scope | DoD |
|-----------|-------|-----|
| **R1** | Fix release blockers | format:check pass; git tracking set or documented |
| **R2** | Repo cleanup | Remove/archive docs/dev/_tmp/*; fix evidence/README link |
| **R3** | Documentation integrity | Fix broken links; create or remove FP2/FP3 audit refs; dedupe docs/README |
| **R4** | Product docs sync | UX_MAP, WORKPLAN status; README feature summary |
| **R5** | Demo readiness | DEMO_FLOW.md or equivalent; known limitations at repo level |

---

## 4. Evidence

| Artifact | Path |
|----------|------|
| Audit report | `docs/audit/RELEASE_PREP_AUDIT.md` |

**Commands run (R0):**
- `git pull --rebase` — exit 1 (no tracking)
- `git status --porcelain` — exit 0, empty
- `./infra/smoke.sh` — background (stack bring-up)
- `./infra/test-lint.sh` — exit 1 (format:check)
- `node tools/check-doc-links.cjs docs/` — exit 0

---

## 5. DoD Checklist (R0)

- [x] Release blockers enumerated
- [x] Nothing changed except audit report
- [x] Four tables: cleanup / docs / product coverage / demo readiness
- [x] Minimal patch plan R1..R5

---

## 6. R1 Cleanup Evidence (2026-03-01)

### Deleted / Moved

| Action | From | To |
|--------|------|-----|
| Moved | `docs/dev/_tmp/TEMP(FP5.1)_M0_BUILD_AUDIT.md` | `archive/REPO/` |
| Moved | `docs/dev/_tmp/TEMP_M0_TEST_POLLUTION_AUDIT.md` | `archive/REPO/` |
| Moved | `docs/audit/REPO_A0_LINT_BASELINE_AUDIT.md` | `archive/REPO/` |
| Moved | `docs/audit/REPO_A1_LINT_FIX_EVIDENCE.md` | `archive/REPO/` |
| Moved | `docs/audit/REPO_A2_LINT_REAUDIT.md` | `archive/REPO/` |
| Removed | `docs/dev/_tmp/` | (empty dir) |

### References Updated

- `docs/audit/REPO_M4_TEST_POLLUTION_AUDIT.md` — M0 baseline path → archive/REPO/
- `docs/audit/FP5_AUDIT_REPORT.md` — TEMP(FP5.1) path → archive/REPO/
