<!-- TEMP(FP5.1): MUST MERGE/DELETE ON ARCHIVE FP5; source-of-truth = docs/fps/FP5.md + canonical docs/core/PROTOCOL_v0.md -->

# FP5 Test Plan — Build-Ready

**Purpose:** Test design for mode=build. tests-red → implement → tests-green.

---

## A. Discovery Tests

| ID  | Scenario                                    | Assert                                  |
| --- | ------------------------------------------- | --------------------------------------- |
| D1  | Folder with index.html                      | isApp=true; Explorer shows app icon     |
| D2  | Folder without index.html                   | isApp=false; Explorer shows folder icon |
| D3  | subdir/index.html only (no root index.html) | isApp=false (OUT of scope)              |

---

## B. Launch Tests

| ID  | Scenario                                      | Assert                                                               |
| --- | --------------------------------------------- | -------------------------------------------------------------------- |
| L1  | Double click app package                      | New window created; iframe src contains shell.local/apps/user/?path= |
| L2  | Double click app package                      | iframe loads; APP_READY received; SHELL_CAPS sent (no token)         |
| L3  | Broken package (no index.html)                | Controlled error state shown; Shell stable                           |
| L4  | Handshake timeout (app never sends APP_READY) | "App not responding" after 2000ms                                    |

---

## C. Confinement Tests

| ID  | Scenario                                            | Assert                         |
| --- | --------------------------------------------------- | ------------------------------ |
| C1  | Relative asset inside package root (./assets/x.png) | Loads successfully             |
| C2  | Parent traversal (../) in URL                       | 403 or 404; content not served |
| C3  | Encoded traversal (%2e%2e/)                         | Denied                         |
| C4  | Foreign package asset (path to other app)           | Denied                         |

---

## D. Hostile App Tests

| ID  | Scenario                    | Assert                            |
| --- | --------------------------- | --------------------------------- |
| H1  | App sends SHELL_OPEN        | Rejected / ignored; no new window |
| H2  | App sends SHELL_OPEN_FILE   | Rejected / ignored                |
| H3  | App attempts external fetch | Blocked (CSP or network)          |
| H4  | App attempts nested iframe  | Blocked (CSP frame-src)           |
| H5  | App attempts token access   | Impossible (never received)       |

---

## E. Isolation Tests

| ID  | Scenario                       | Assert                                             |
| --- | ------------------------------ | -------------------------------------------------- |
| I1  | App A and App B open           | Two windows; independent                           |
| I2  | App A cannot read App B assets | Request for App B path from App A context → denied |
| I3  | Close App A                    | App B unaffected                                   |

---

## Test Types

| Group | Type               | Location                   |
| ----- | ------------------ | -------------------------- |
| D1–D3 | Integration / E2E  | Explorer + Gateway         |
| L1–L4 | E2E / Integration  | Shell + AppHost            |
| C1–C4 | Integration        | Delivery route / proxy     |
| H1–H5 | Unit / Integration | Shell message handler; CSP |
| I1–I3 | E2E / Integration  | Multi-window               |

---

## Build Order

1. **Tests-red:** Write D1–D2, L1, L3, C1, C2, H1, I1 first
2. **Implement:** Discovery, launch, route, sandbox, confinement
3. **Tests-green:** All groups pass

---

## M1 Evidence (tests-red)

| ID            | File                                                      | Type        | Run                                                    | M1 Status   |
| ------------- | --------------------------------------------------------- | ----------- | ------------------------------------------------------ | ----------- |
| D1, D2, D3    | `back/__tests__/fp5/discovery.integration.test.ts`        | Integration | `pnpm test:api -- back/__tests__/fp5/discovery`        | GREEN       |
| L1            | `e2e/fp5-user-app.spec.ts`                                | E2E         | `pnpm test:e2e -- e2e/fp5-user-app.spec.ts`            | (needs E2E) |
| L1, L3        | `front/__tests__/fp5/launch-hosted-route.test.tsx`        | Unit        | `pnpm test -- front/__tests__/fp5/launch-hosted-route` | GREEN       |
| C1–C4, B      | `back/__tests__/fp5/delivery-route.integration.test.ts`   | Integration | `pnpm test:api -- back/__tests__/fp5/delivery-route`   | GREEN (M2)  |
| H1, H2, H5    | `front/__tests__/fp5/app-host-hostile.test.tsx`           | Unit        | `pnpm test -- front/__tests__/fp5/app-host-hostile`    | GREEN       |
| non-allowlist | `front/__tests__/fp5/app-host-hostile.test.tsx`           | Unit        | (same)                                                 | GREEN       |
| L4            | `front/__tests__/fp4/app-host-handshake-timeout.test.tsx` | Unit        | (existing)                                             | GREEN       |

**Fixtures:** `infra/minio/fixtures/DISK_C/My Documents/sample-app/index.html`, `subdir-only/nested/index.html`

**M2:** C1 green — gateway serve-user-app + Vite proxy; test-api-fp.sh FP5 brings up dev-server.

**M2 Evidence (core build):** Discovery, launch, hosted route, confinement implemented. FP5 tests green when run with `SHELL_BASE_URL=http://localhost:5173` (dev server) or via infra/test-api-fp.sh FP5 (shell.local).

**M3 Evidence (security hardening):** Sandbox allow-scripts only; CSP baseline (script-src, style-src, img-src, media-src, connect-src 'self'; frame-src 'none'); protocol allowlist (APP_READY, WINDOW_TITLE, ERROR); privileged types rejected+logged; no token in SHELL_CAPS to user app. H1, H2, H5, protocol, sandbox tests green.
