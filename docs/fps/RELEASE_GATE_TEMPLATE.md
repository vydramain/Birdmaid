# Release Gate Template

**Role:** @Delivery  
**Mode:** FP=&lt;id&gt; mode=release  
**Purpose:** Checklist to verify readiness for release. Copy and adapt for each FP.

## Gate goal

Verify that the FP meets critical criteria before marking as released. Adjust the sections below to your project (e.g. environment, smoke tests, security, compliance).

## Result

- **PASS** — all critical checks passed; FP is ready for release.
- **REJECT** — blockers found; fix before re-running gate.

---

## 1. Environment

- [ ] Required services (DB, APIs, etc.) are up.
- [ ] App (frontend/backend) starts and responds (e.g. health endpoint).

**Commands (example):**

```bash
# Start dependencies (adapt to your stack)
# docker compose up -d ...

# Start backend (if applicable)
# cd back && npm run start:dev

# Start frontend (if applicable)
# cd front && npm run dev
```

---

## 2. Critical flows

- [ ] Main user journey works end-to-end.
- [ ] Auth (if applicable): login, role, permissions.
- [ ] Key actions from UX Map for this FP are implemented and tested.

---

## 3. Quality & compliance

- [ ] Tests pass (unit, integration, E2E as defined).
- [ ] Lint / style checks pass (if configured).
- [ ] No known security or compliance blockers.
- [ ] Docs (FP file, ADRs) updated.

---

## 4. Evidence

- [ ] Demo notes or screenshot/video if needed.
- [ ] Links to PR(s), CI, coverage (if applicable).
- [ ] Update `docs/fps/FP<N>.md`: Status = released, Evidence section filled.

After gate: update the FP file with status and evidence; optionally move to an "examples" or "released" area per your process.
