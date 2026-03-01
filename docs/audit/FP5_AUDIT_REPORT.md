# FP5 M4 Full Pass Audit Report

**Date:** 2026-03-01  
**Scope:** FP5 User App Packages — M4 (Full Pass Audit)  
**Verdict:** PASS

---

## 1. Commands Table

| #   | Command                                | Exit | Notes                   |
| --- | -------------------------------------- | ---- | ----------------------- |
| 1   | `git status --porcelain`               | 0    | Uncommitted FP5 changes |
| 2   | `./infra/smoke.sh`                     | 0    | PLATFORM OK             |
| 3   | `pnpm lint`                            | 0    | OK                      |
| 4   | `pnpm format:check`                    | 0    | Prettier OK             |
| 5   | FP5 required tests                     | 0    | 8 front + 8 integration |
| 6   | `node tools/check-doc-links.cjs docs/` | 0    | All links resolve       |

---

## 2. FP5 Required Tests (docs/tests/FP5_TESTS.md)

| Group      | File                                                      | Result | Notes                        |
| ---------- | --------------------------------------------------------- | ------ | ---------------------------- |
| D1–D3      | `back/__tests__/fp5/discovery.integration.test.ts`        | PASS   | 3 tests                      |
| L1, L3     | `front/__tests__/fp5/launch-hosted-route.test.tsx`        | PASS   | 2 tests                      |
| C1–C4, B   | `back/__tests__/fp5/delivery-route.integration.test.ts`   | PASS   | 5 tests (dev-server via FP5) |
| H1, H2, H5 | `front/__tests__/fp5/app-host-hostile.test.tsx`           | PASS   | 6 tests (protocol, sandbox)  |
| L4         | `front/__tests__/fp4/app-host-handshake-timeout.test.tsx` | PASS   | (existing)                   |

**FP5 front unit tests:** 8/8 PASS  
**FP5 integration:** 8/8 PASS (discovery 3 + delivery 5)  
**Run:** `vitest run front/__tests__/fp5` + `./infra/test-api-fp.sh FP5`

---

## 3. AC Evidence (docs/fps/FP5.md)

| AC                          | Evidence                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| AC1 Discovery               | D1–D3 `discovery.integration.test.ts`                               |
| AC2 Launch                  | L1 `launch-hosted-route.test.tsx`                                   |
| AC3 Directory confinement   | C1–C4 `delivery-route.integration.test.ts`                          |
| AC4 No privilege escalation | H1, H2, H5, protocol allowlist, sandbox `app-host-hostile.test.tsx` |
| AC5 Isolation               | C4 (foreign package denied); path confinement in delivery           |
| AC6 Failure safety          | L3 (broken package → controlled error)                              |

---

## 4. Security Checklist (docs/dev/FP5_SECURITY_DOD.md) — Evidence

| #   | Item                                | Evidence                                                                      |
| --- | ----------------------------------- | ----------------------------------------------------------------------------- |
| 1   | No token leakage to user app        | H5 test; `createShellCaps(..., isExplorer && !isUserApp)` (AppHost, protocol) |
| 2   | No privileged bridge                | H1, H2 tests; AppHost PRIVILEGED_TYPES reject + analytics.message_rejected    |
| 3   | No path traversal                   | C2 delivery-route; vite middleware; gateway path-policy                       |
| 4   | No cross-package reads              | C4; path confinement in serve-user-app                                        |
| 5   | No external fetch (CSP connect-src) | vite.config.ts, back/src/index.ts CSP                                         |
| 6   | No nested iframes (frame-src none)  | vite.config.ts, back/src/index.ts CSP                                         |
| 7   | Untrusted app cannot break Shell    | Sandbox allow-scripts only; protocol allowlist                                |
| 8   | postMessage allowlist enforced      | app-host-hostile protocol/non-allowlist tests                                 |

---

## 5. TEMP(FP5.1) Docs

| Doc                                           | Marked | Ready for merge/delete |
| --------------------------------------------- | ------ | ---------------------- |
| docs/tests/FP5_TESTS.md                       | Yes    | Yes                    |
| docs/dev/FP5_SECURITY_DOD.md                  | Yes    | Yes                    |
| docs/core/API_FP5_DELTA.md                    | Yes    | Yes                    |
| docs/core/UX_FP5_1.md                         | Yes    | Yes                    |
| docs/dev/DESIGN_LOG_FP5_1.md                  | Yes    | Yes                    |
| docs/dev/\_tmp/TEMP(FP5.1)\_M0_BUILD_AUDIT.md | Yes    | Yes                    |

All TEMP(FP5.1) docs: explicitly marked in header; source-of-truth = docs/fps/FP5.md + docs/core/PROTOCOL_v0.md; ready for merge/delete on archive FP5.

---

## 6. Evidence Files Updated

- `docs/audit/FP5_AUDIT_REPORT.md` (this file)
