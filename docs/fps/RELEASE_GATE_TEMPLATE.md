# Release Gate Template

**Role:** @Delivery  
**Mode:** FP=&lt;id&gt; mode=release  
**Purpose:** Checklist to verify readiness for release. Copy and adapt for each FP.  
**Reference:** [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md) § Gate Semantics.

## Gate goal

Verify that the FP meets critical criteria before marking as released. **PASS only when all checks are green.** No "PASS with known failures", no "Partial PASS".

## Result

- **PASS** — all critical checks passed; FP is ready for release.
- **REJECT** — any check failed; fix before re-running gate.

**Rule:** If `Actual exit != 0` for any required command → **REJECT**.

---

## 1. Gate Commands (canonical)

Each FP **MUST** fill this table. **Canonical execution:** container scripts (`./infra/*.sh`). **Host-only:** `git status`, `./infra/smoke.sh`. Host `pnpm lint/test/etc` prohibited for gate. Evidence = link to log/output.

| Command                        | Expected exit             | Actual exit | Evidence |
| ------------------------------ | ------------------------- | ----------- | -------- |
| `git status --porcelain`       | 0 (empty)                 |             |          |
| `./infra/smoke.sh`             | 0 (PLATFORM OK)           |             |          |
| `./infra/test-lint.sh`         | 0                         |             |          |
| `./infra/test-unit.sh`         | 0 (if FP has unit in DoD) |             |          |
| `./infra/test-api-fp.sh FP<N>` | 0 (if FP has API in DoD)  |             |          |
| `./infra/test-e2e.sh`          | 0 (if FP has E2E in DoD)  |             |          |

**Exit codes:** All commands MUST exit 0 for PASS. Non-zero exit → REJECT. No exceptions.

**Prohibited:** "PASS (but…)", "PASS with known failures", "Partial PASS", "skipped allowed" for FP tests. Host-only lint/format/test runs for gate verification.

**API scoping:** FP2 gate uses `./infra/test-api-fp.sh FP2` (FP2 tests only). FP3 gate uses `./infra/test-api-fp.sh FP3` (FP2+FP3). Full suite: `./infra/test-api.sh`.

---

## 2. Environment

- [ ] Required services (DB, APIs, etc.) are up.
- [ ] App (frontend/backend) starts and responds (e.g. health endpoint).

**Commands (example):**

```bash
# Start dependencies (adapt to your stack)
# docker compose up -d ...

# Smoke
./infra/smoke.sh
```

---

## 3. Critical flows

- [ ] Main user journey works end-to-end.
- [ ] Auth (if applicable): login, role, permissions.
- [ ] Key actions from UX Map for this FP are implemented and tested.

---

## 4. Quality & compliance

- [ ] Tests pass (unit, integration, E2E as defined). **No skipped FP tests.**
- [ ] Lint / style checks pass (if configured).
- [ ] No known security or compliance blockers.
- [ ] Docs (FP file, ADRs) updated.

---

## 5. Evidence

- [ ] Demo notes or screenshot/video if needed.
- [ ] Links to PR(s), CI, coverage (if applicable).
- [ ] Update `docs/fps/FP<N>.md`: Status = released, Evidence section filled.
- [ ] All AC/DoD items have evidence (file paths + verification commands).

After gate: update the FP file with status and evidence; optionally move to an "examples" or "released" area per your process.
