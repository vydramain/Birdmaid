# M3 Clean-State Prep — Action Plan

**Purpose:** Prepare clean-state for Gate PASS. User performs commit.  
**Milestone:** M3_CLEAN_STATE_PREP  
**Date:** 2025-02-22

---

## 1. Evidence: git inventory

### 1.1 git status --porcelain

```
 M docs/audit/CLEAN_STATE_INSTRUCTIONS.md
 M docs/audit/FP1_AUDIT_REPORT.md
 M docs/audit/FP2_AUDIT_REPORT.md
 M docs/audit/FP3_AUDIT_REPORT.md
 M docs/dev/DEV_DOMAIN.md
 M docs/dev/GUARDRAILS.md
 M docs/fps/FP1.md
 M docs/fps/FP2.md
 M docs/fps/FP3.md
 M docs/fps/RELEASE_GATE_TEMPLATE.md
 M e2e/fp3-explorer.spec.ts
 M front/apps/explorer/main.ts
 M front/core/AppHost.tsx
 M infra/README.md
 M infra/gate.sh
 M "infra/minio/fixtures/DISK_C/My Documents/user-app-deny/index.html"
 M infra/test-e2e.sh
?? infra/test-e2e-fp.sh
```

### 1.2 git diff --stat

```
 docs/audit/CLEAN_STATE_INSTRUCTIONS.md             |  74 ++++++-------
 docs/audit/FP1_AUDIT_REPORT.md                     |  85 ++++++++-------
 docs/audit/FP2_AUDIT_REPORT.md                     |  77 ++++++++------
 docs/audit/FP3_AUDIT_REPORT.md                     | 117 +++++++++++++--------
 docs/dev/DEV_DOMAIN.md                             |   2 +
 docs/dev/GUARDRAILS.md                             |  11 +-
 docs/fps/FP1.md                                    |  32 +++---
 docs/fps/FP2.md                                    |   2 +-
 docs/fps/FP3.md                                    |  18 ++--
 docs/fps/RELEASE_GATE_TEMPLATE.md                  |  29 +++--
 e2e/fp3-explorer.spec.ts                           |  71 +++++--------
 front/apps/explorer/main.ts                        |  33 +++++-
 front/core/AppHost.tsx                             |   9 +-
 infra/README.md                                    |  51 +++++----
 infra/gate.sh                                      |  47 ++++++---
 .../DISK_C/My Documents/user-app-deny/index.html   |  22 +++-
 infra/test-e2e.sh                                  |  29 ++++-
 17 files changed, 418 insertions(+), 291 deletions(-)
```

### 1.3 Untracked

| Path                 | Description                         |
| -------------------- | ----------------------------------- |
| infra/test-e2e-fp.sh | M1: scoped E2E per FP (FP1/FP2/FP3) |

**No generated/runtime dirs** in status. `playwright-report/`, `test-results/` already in .gitignore.

---

## 2. Grouping: path → action

### A) Mandatory (M1/M2 fixes)

| Path                                              | Action  | Rationale                                             |
| ------------------------------------------------- | ------- | ----------------------------------------------------- |
| infra/test-e2e-fp.sh                              | **add** | M1: scoped E2E (FP1/FP2/FP3)                          |
| infra/gate.sh                                     | **add** | M1: uses test-e2e-fp.sh, scoped gate                  |
| infra/test-e2e.sh                                 | **add** | Smoke + dev-server setup, Playwright v1.58.2          |
| e2e/fp3-explorer.spec.ts                          | **add** | M2: stable selectors, mockFsForM6, FETCH_RESULT       |
| front/apps/explorer/main.ts                       | **add** | M2: explorer-blank-area, menu testids, pathToStableId |
| front/core/AppHost.tsx                            | **add** | M2: FETCH_RESULT → \_\_lastFetchStatus                |
| infra/minio/fixtures/.../user-app-deny/index.html | **add** | M2: postMessage FETCH_RESULT on fetch complete        |

### B) Docs / audits

| Path                                   | Action  | Rationale                    |
| -------------------------------------- | ------- | ---------------------------- |
| docs/audit/CLEAN_STATE_INSTRUCTIONS.md | **add** | Audit artifact; table format |
| docs/audit/FP1_AUDIT_REPORT.md         | **add** | Gate Summary, commands       |
| docs/audit/FP2_AUDIT_REPORT.md         | **add** | Gate Summary, scoped API     |
| docs/audit/FP3_AUDIT_REPORT.md         | **add** | M2 root causes, evidence     |
| docs/dev/DEV_DOMAIN.md                 | **add** | E2E canonical note           |
| docs/dev/GUARDRAILS.md                 | **add** | test-e2e-fp.sh, scoped E2E   |
| docs/fps/FP1.md                        | **add** | Gate Commands, test-e2e-fp   |
| docs/fps/FP2.md                        | **add** | Gate Commands, test-e2e-fp   |
| docs/fps/FP3.md                        | **add** | Gate Commands, test-e2e-fp   |
| docs/fps/RELEASE_GATE_TEMPLATE.md      | **add** | Per-FP command matrix        |
| infra/README.md                        | **add** | test-e2e-fp.sh, commands     |

### C) Random / generated

**None.** All changes are product/docs. No restore, no ignore patch needed.

---

## 3. Clean-state action plan (no commit)

```bash
# Stage all mandatory + docs
git add infra/test-e2e-fp.sh
git add infra/gate.sh
git add infra/test-e2e.sh
git add e2e/fp3-explorer.spec.ts
git add front/apps/explorer/main.ts
git add front/core/AppHost.tsx
git add "infra/minio/fixtures/DISK_C/My Documents/user-app-deny/index.html"

git add docs/audit/CLEAN_STATE_INSTRUCTIONS.md
git add docs/audit/FP1_AUDIT_REPORT.md
git add docs/audit/FP2_AUDIT_REPORT.md
git add docs/audit/FP3_AUDIT_REPORT.md
git add docs/dev/DEV_DOMAIN.md
git add docs/dev/GUARDRAILS.md
git add docs/fps/FP1.md
git add docs/fps/FP2.md
git add docs/fps/FP3.md
git add docs/fps/RELEASE_GATE_TEMPLATE.md
git add infra/README.md

# Optional: stage this plan
git add docs/audit/M3_CLEAN_STATE_PREP.md

# Verify clean
git status --porcelain
# Expected: empty (or only M3_CLEAN_STATE_PREP if not staged)

# User performs: git commit -m "..."
```

**Restore:** none. All changes are intentional.

**Ignore patch:** none. No generated dirs in status.

---

## 4. Re-audit readiness: exact commands after commit

```bash
cd /path/to/Birdmaid_v2

# Prerequisite
docker compose -f infra/docker-compose.dev.yml up -d

# 1. Clean-state
git status --porcelain
# Expected: empty

# 2. Smoke
./infra/smoke.sh

# 3. Lint + format
./infra/test-lint.sh

# 4. API (FP2, FP3)
./infra/test-api-fp.sh FP2
./infra/test-api-fp.sh FP3

# 5. E2E (FP1, FP3)
./infra/test-e2e-fp.sh FP1
./infra/test-e2e-fp.sh FP3

# 6. Full gates
./infra/gate.sh FP1
./infra/gate.sh FP2
./infra/gate.sh FP3
```

---

## 5. DoD

**After commit, gate must PASS when tests are green:**

- [ ] `git status --porcelain` → empty
- [ ] `./infra/smoke.sh` → exit 0
- [ ] `./infra/test-lint.sh` → exit 0
- [ ] `./infra/test-api-fp.sh FP2` → exit 0
- [ ] `./infra/test-api-fp.sh FP3` → exit 0
- [ ] `./infra/test-e2e-fp.sh FP1` → exit 0
- [ ] `./infra/test-e2e-fp.sh FP2` → exit 0 (E2E not in DoD)
- [ ] `./infra/test-e2e-fp.sh FP3` → exit 0
- [ ] `./infra/gate.sh FP1` → GATE OK
- [ ] `./infra/gate.sh FP2` → GATE OK
- [ ] `./infra/gate.sh FP3` → GATE OK
