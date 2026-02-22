# FP3.2 Tests Plan — Explorer UX & Shell Maximize Fixes

**Purpose:** AC → test mapping for FP3.2 (10 issues: Explorer UI, app-discovery, FS write, Shell maximize).  
**Method:** E2E (Playwright), integration (API), unit (WindowManager).  
**Source of truth:** docs/fps/FP3_2.md.

---

## 1. AC → Test Mapping

| AC  | Test ID | Type | Description                                                     |
| --- | ------- | ---- | --------------------------------------------------------------- |
| A1  | T-A1    | E2E  | Roots view: only A:, C:, D:; no "Computer" tile                 |
| A2  | T-A2    | E2E  | Toolbar sticky; scroll only on file list                        |
| A3  | T-A3    | E2E  | Back button = icon (arrow left), not text                       |
| A4  | T-A4    | E2E  | Folders with index.html → app icon                              |
| A5  | T-A5    | Int  | First open after zip upload → 200 (no 404 race)                 |
| A6  | T-A6    | E2E  | Multi-explorer: path persists on focus change                   |
| A7  | T-A7    | Int  | Delete: request sent, item removed                              |
| A8  | T-A8    | Int  | Rename: toPath = same parent, new basename                      |
| A9  | T-A9    | E2E  | Roots view: no toolbar (address bar + back)                     |
| A10 | T-A10   | Unit | WindowManager: maximize → viewport bounds; unmaximize → restore |

---

## 2. E2E Tests (Explorer UX)

**Location:** `e2e/fp3-explorer.spec.ts` (extend existing) or `e2e/fp3-2-ux.spec.ts`

| Scenario                      | Steps                                                                           | AC  |
| ----------------------------- | ------------------------------------------------------------------------------- | --- |
| **T-A1: No Computer tile**    | Open My Computer, assert only A:, C:, D: visible; no "Computer" tile            | A1  |
| **T-A2: Sticky toolbar**      | Navigate to dir with many files, scroll down, assert address bar + back visible | A2  |
| **T-A3: Back icon**           | Assert back button has arrow icon (not text "Back")                             | A3  |
| **T-A4: App icon**            | Navigate to dir with index.html, assert app icon (not folder)                   | A4  |
| **T-A6: Path persist**        | Open 2 Explorer, navigate in each, switch focus, assert paths unchanged         | A6  |
| **T-A9: No toolbar in roots** | Open My Computer (roots view), assert no address bar, no back button            | A9  |

**Commands:** `pnpm test:e2e` or `./infra/test-e2e-fp.sh FP3`

---

## 3. Integration / API Tests

**Location:** `back/__tests__/fp3/` (extend) or `back/__tests__/fp3-2/`

| Scenario                     | Steps                                                                                         | AC  |
| ---------------------------- | --------------------------------------------------------------------------------------------- | --- |
| **T-A5: Open after zip**     | Upload zip app, immediately POST open-url for index.html; assert 200 (retry if 404)           | A5  |
| **T-A7: Delete**             | Create folder in My Documents, DELETE /api/fs/delete with token; assert 204; list → item gone | A7  |
| **T-A8: Rename same-parent** | PUT /api/fs/rename: fromPath=parent/old, toPath=parent/new; assert 200; no cross-parent       | A8  |

**Note:** T-A7 may require Explorer E2E if "request not sent" is purely UI — then E2E: right click Delete, assert network request. T-A8 is API: verify Explorer sends correct toPath.

**Commands:** `pnpm test:api` or `./infra/test-api-fp.sh FP3`

---

## 4. Unit Tests (WindowManager Maximize)

**Location:** `front/__tests__/fp1/WindowManager.test.ts` (extend) or `front/__tests__/fp3-2/WindowManager.maximize.test.ts`

| Scenario    | Steps                                                         | AC  |
| ----------- | ------------------------------------------------------------- | --- |
| **T-A10.1** | maximize(id, viewport) → bounds = viewport; state = maximized | A10 |
| **T-A10.2** | unmaximize(id) → bounds = prevBounds; state = normal          | A10 |
| **T-A10.3** | maximize → resize disabled (or no resize when maximized)      | A10 |

**Contract:** WindowManager.maximize(id, viewport: { width, height }) stores prevBounds, sets bounds to viewport. unmaximize restores prevBounds.

**Commands:** `pnpm test` or `./infra/test-unit.sh`

---

## 5. Commands Summary

| Command                      | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `./infra/test-unit.sh`       | Unit (WindowManager maximize)          |
| `./infra/test-api-fp.sh FP3` | Integration (delete, rename, open-url) |
| `./infra/test-e2e-fp.sh FP3` | E2E (Explorer UX)                      |
| `./infra/gate.sh FP3`        | Full gate (FP3 + FP3.2)                |

---

## 6. Test File Layout (proposed)

| File                                                   | Coverage                                   |
| ------------------------------------------------------ | ------------------------------------------ |
| `e2e/fp3-explorer.spec.ts`                             | Extend: T-A1, T-A2, T-A3, T-A4, T-A6, T-A9 |
| `back/__tests__/fp3/api-fs-write.integration.test.ts`  | Extend: T-A7 (delete), T-A8 (rename)       |
| `back/__tests__/fp3/open-url-race.integration.test.ts` | New: T-A5 (open after zip)                 |
| `front/__tests__/fp1/WindowManager.test.ts`            | Extend: T-A10 (maximize/unmaximize)        |
