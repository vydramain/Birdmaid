# Requirements Traceability Matrix (RTM)

**Purpose:** Map Features → Code → Tests → Evidence for FP1-FP7  
**Last Updated:** 2026-01-22  
**Status:** Draft (FP6/FP7 complete, FP1-FP5 pending)

# Requirements Traceability Matrix (RTM)

**Purpose:** Map Features → Code → Tests → Evidence for FP1-FP7  
**Last Updated:** 2026-01-22  
**Status:** Draft (FP6/FP7 complete, FP1-FP5 pending)

## Summary

| Status | Count | Items |
|--------|-------|-------|
| KEEP | 9 | Backend endpoints (FP1: 7, FP6: 2) |
| REWRITE | 12 | FP6 frontend tests (placeholders, need FP7 architecture) |
| REMOVE+REPLACE | 5 | FP1 frontend tests (routes not accessible, need new platform-level tests) |
| MISSING | 19 | FP7 tests (VFS, WindowStore, AppRegistry, etc.) + FP1 Executor/AppHost tests + FP3 behavior tests (8) |
| DEAD | 7 | `App.tsx` routes, `WindowContext.tsx`, old `WindowManager.tsx`, `Window.tsx` |

## UI Entry Points Verified

### Active Entry Points
- ✅ `/` → `ShellRoot` → `DesktopPage` (FP7 unified shell)
- ✅ Desktop icons → `openWindow(appId)` → `WindowRegistry` → `AppRegistry`
- ✅ Registered apps: `explorer`, `help`, `landing`, `executor`

### Dead Entry Points
- ❌ `App.tsx` routes (`/catalog`, `/games/:id`, etc.) - Not used by `main.tsx`
- ❌ Old `WindowContext` - Replaced by `WindowRegistry`

## Legend

- **Status:**
  - `KEEP`: Feature exists, code is used, tests align with current behavior
  - `REWRITE`: Feature exists but UI/architecture changed (FP6/7); update tests
  - `REMOVE+REPLACE`: Feature removed/replaced; delete code+tests, add new contract test
  - `MISSING`: Feature documented but not implemented
  - `DEAD`: Code exists but not reachable via UI/routes

---

## FP3: Windows 95 UI Behavior Contracts

| Feature | UI Entry | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| **3.1 Window Chrome** |
| Window titlebar | All windows | `front/src/os/wm/WindowFrame.tsx`<br/>Lines 87-108 | None | MISSING | Need test for titlebar rendering |
| Window title with ◆ | WindowFrame | `WindowFrame.tsx` line 95-96 | None | MISSING | Need test for title format |
| Close button | WindowFrame | `WindowFrame.tsx` lines 98-107 | None | MISSING | Need test for close button |
| **3.2 Z-Order Management** |
| Focus updates z-index | Click window | `WindowRegistry.tsx` lines 93-110<br/>`focusWindow()` | `window.manager.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| Highest z-index = focused | WindowRegistry | `WindowRegistry.tsx` line 99-100 | `window.manager.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| **3.3 Focus Behavior** |
| Click brings to front | Click window | `WindowFrame.tsx` line 85<br/>`onMouseDown={() => focusWindow(id)}` | `window.manager.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| Visual focus indicator | Focused window | `WindowFrame.tsx` line 83<br/>`boxShadow` when `zIndex > 10` | None | MISSING | Need test for box-shadow |
| **3.4 Dragging Behavior** |
| Drag from titlebar only | Drag titlebar | `WindowFrame.tsx` lines 35-57<br/>Pointer events | `window.drag.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| Zero-lag drag (rAF) | Drag window | `WindowStore.ts` lines 126-189<br/>rAF loop | `window.drag.test.tsx` (placeholder) | REWRITE | Test needs performance verification |
| Transform-based positioning | Window position | `WindowFrame.tsx` line 29<br/>`translate3d()` | None | MISSING | Need test for transform usage |
| Drag ends on mouse up | Release mouse | `WindowStore.ts` lines 151-166<br/>`endDrag()` | `window.drag.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| **3.5 Window Controls** |
| Close button closes window | Click × | `WindowFrame.tsx` lines 59-63<br/>`handleClose()` | `window.manager.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| Controls not draggable | Drag controls | `WindowFrame.tsx` line 38<br/>`closest(".win-window-controls")` | None | MISSING | Need test for control drag prevention |

### FP3 Backend

| Feature | Endpoint | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| CSP headers | All endpoints | `back/src/csp.middleware.ts` | `back/__tests__/fp2/csp.headers.test.ts` | KEEP | Security test, should work |

---

## FP6: Desktop Workspace & Window Manager

| Feature | UI Entry | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| **6.1 Desktop "Рабочий стол"** |
| Desktop with clickable icons | `/` → `ShellRoot` → `DesktopPage` | `front/src/pages/DesktopPage.tsx`<br/>`front/src/components/DesktopIcon.tsx` | `front/__tests__/fp6/desktop.workspace.test.tsx`<br/>`front/__tests__/fp6/desktop.icons.test.tsx` | REWRITE | Tests are placeholders; implementation uses FP7 VFS |
| Desktop icons from VFS | Desktop icons grid | `DesktopPage.tsx` (lines 19-53)<br/>Reads from `vfs.readDir('/desktop')` | None | MISSING | VFS integration not tested |
| Landing window auto-open | Auto-opens on first visit | `DesktopPage.tsx` (lines 55-62)<br/>`localStorage.getItem("birdmaid_landing_seen")` | `desktop.workspace.test.tsx` (placeholder) | REWRITE | Test needs implementation |
| **6.2 Window Manager** |
| Window open/close | Via `openWindow()` from registry | `front/src/os/wm/WindowRegistry.tsx`<br/>`front/src/os/wm/WindowManager.tsx` | `front/__tests__/fp6/window.manager.test.tsx` | REWRITE | Tests are placeholders; FP7 refactored to WindowRegistry + WindowStore |
| Window focus/z-index | Click window header | `WindowFrame.tsx` (line 85)<br/>`WindowRegistry.focusWindow()` | `window.manager.test.tsx` (placeholder) | REWRITE | FP7 uses WindowStore for geometry |
| Window drag (zero-lag) | Drag window header | `WindowFrame.tsx` (lines 90-92)<br/>`WindowStore.startDrag()` (rAF loop) | `front/__tests__/fp6/window.drag.test.tsx` | REWRITE | FP7 performance refactor; test needs update |
| **6.3 Windows Mobile режим** |
| Mobile mode detection | `PlatformContext` | `front/src/contexts/PlatformContext.tsx`<br/>`ShellRoot.tsx` (lines 7-19) | `front/__tests__/fp6/mobile.mode.test.tsx` | REWRITE | Mobile shows placeholder; test needs update |
| **6.4 Explorer (базовая версия)** |
| Explorer window | Desktop icon → `openWindow('explorer')` | `front/src/components/ExplorerWindow.tsx`<br/>Registered in `registry-init.tsx` | `front/__tests__/fp6/explorer.tree.test.tsx` | REWRITE | FP7 uses VFS; test expects jams/years/games tree (not implemented) |
| Explorer tree navigation | Click folders/files | `ExplorerWindow.tsx` (lines 25-51)<br/>Uses VFS `readDir()` | `explorer.tree.test.tsx` (placeholder) | REWRITE | VFS-based, not jams/years/games |
| **6.5 HELP.TXT** |
| Help window | Desktop icon → `openWindow('help')` | `front/src/components/HelpWindow.tsx`<br/>Registered in `registry-init.tsx` | `front/__tests__/fp6/help.txt.test.tsx` | REWRITE | Uses `GET /help` endpoint; test needs implementation |
| **6.6 "Говно - не открывать"** |
| Shit folder | Not implemented | None | None | MISSING | Not in scope per FP6 docs |

### FP6 Backend

| Feature | Endpoint | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| GET /jam/current | `GET /jam/current` | `back/src/jam/jam.controller.ts`<br/>`back/src/jam/jam.service.ts` | `back/__tests__/fp6/jam.current.test.ts` | KEEP | Tests exist and pass |
| GET /help | `GET /help` | `back/src/help/help.controller.ts`<br/>`back/src/help/help.service.ts` | `back/__tests__/fp6/help.content.test.ts` | KEEP | Tests exist and pass |

---

## FP7: Explorer & Media Viewers (Performance & VFS)

| Feature | UI Entry | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| **M1: Perf Core** |
| Unified Shell entry | `/` → `ShellRoot` | `front/src/os/ShellRoot.tsx`<br/>`front/src/main.tsx` (line 14) | None | MISSING | No tests for ShellRoot routing |
| WindowStore (mutable state) | Used by WindowFrame | `front/src/os/wm/WindowStore.ts` | None | MISSING | Performance tests missing |
| WindowFrame (rAF-driven drag) | All windows | `front/src/os/wm/WindowFrame.tsx` | `window.drag.test.tsx` (FP6 placeholder) | REWRITE | Needs performance verification |
| **M2: Unified Shell** |
| Platform Context | Boot detection | `front/src/contexts/PlatformContext.tsx` | None | MISSING | No tests for platform detection |
| No-redirect routing | URL stays `/` | `main.tsx` (no router)<br/>`ShellRoot.tsx` | None | MISSING | Routing tests missing |
| **M3: Windowing & Apps** |
| AppRegistry | App registration | `front/src/os/apps/AppRegistry.ts`<br/>`front/src/os/apps/registry-init.tsx` | None | MISSING | No tests for app registry |
| AppHost (iframe sandbox) | Executor app | `front/src/os/apps/AppHost.tsx` | None | MISSING | Security tests missing |
| **M4: VFS & Sync** |
| VirtualFileSystem | Event-driven VFS | `front/src/os/fs/VirtualFileSystem.ts` | None | MISSING | No VFS tests |
| VFS Desktop sync | Desktop icons read VFS | `DesktopPage.tsx` (lines 19-53)<br/>`vfs.subscribe('/desktop')` | None | MISSING | VFS integration not tested |
| Explorer VFS integration | Explorer reads VFS | `ExplorerWindow.tsx` (lines 10-23)<br/>`vfs.readDir()` | None | MISSING | Explorer-VFS sync not tested |
| **M5: Theme v1** |
| Chicago95 theme | CSS variables | `front/src/retro.css` | None | MISSING | Visual regression tests missing |

### FP7 Backend

| Feature | Endpoint | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| None | N/A | N/A | N/A | N/A | FP7 is frontend-only refactor |

---

## Summary by Status

### KEEP (3 items)
- `GET /jam/current` endpoint + tests
- `GET /help` endpoint + tests

### REWRITE (12 items)
- All FP6 frontend tests (placeholders, need implementation)
- Window Manager tests (FP7 refactor)
- Explorer tests (VFS-based, not jams/years/games)
- Mobile mode tests (placeholder implementation)

### MISSING (10 items)
- ShellRoot routing tests
- WindowStore performance tests
- Platform Context tests
- AppRegistry tests
- AppHost security tests
- VFS core tests
- VFS Desktop sync tests
- Explorer VFS sync tests
- Theme visual regression tests
- "Говно - не открывать" feature (not implemented)

### DEAD (7 items)
- `App.tsx` routes (CatalogPage, GamePage, TeamsPage, EditorPage)
- Old `WindowContext.tsx` and related components

---

## FP2: Team System and Game Editing

| Feature | UI Entry | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| **2.1 Teams Management** |
| Create team | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (TeamsPage, lines 734-1121)<br/>Route: `/teams` | `front/__tests__/fp2/admin.authoring.test.tsx` | REMOVE+REPLACE | Route not used by `main.tsx` (uses ShellRoot). Backend endpoint works: `POST /teams` (JWT) |
| Update team name | ❌ NOT ACCESSIBLE | `TeamsPage.tsx`<br/>Uses `PATCH /teams/:id` | None | MISSING | Route not accessible. Backend endpoint works |
| Add team member | ❌ NOT ACCESSIBLE | `TeamsPage.tsx`<br/>Uses `POST /teams/:id/members` | None | MISSING | Route not accessible. Backend endpoint works |
| Remove team member | ❌ NOT ACCESSIBLE | `TeamsPage.tsx`<br/>Uses `DELETE /teams/:id/members/:userId` | None | MISSING | Route not accessible. Backend endpoint works |
| Transfer leadership | ❌ NOT ACCESSIBLE | `TeamsPage.tsx`<br/>Uses `POST /teams/:id/leader` | None | MISSING | Route not accessible. Backend endpoint works |
| **2.2 Game Editing** |
| Create/edit game | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (EditorPage, lines 1123-1889)<br/>Route: `/editor/games/:id` | `front/__tests__/fp2/admin.authoring.test.tsx`<br/>`front/__tests__/fp2/admin.publish-validation.test.tsx`<br/>`front/__tests__/fp2/admin.status-validation.test.tsx`<br/>`front/__tests__/fp2/admin.tags-ui.test.tsx`<br/>`front/__tests__/fp2/admin.status-remark.test.tsx`<br/>`front/__tests__/fp2/admin.publish-gating.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Upload build | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /games/:id/build` | `front/__tests__/fp2/admin.authoring.test.tsx` | REMOVE+REPLACE | Route not accessible. Backend endpoint works |
| Publish game | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /games/:id/publish` | `front/__tests__/fp2/admin.publish-validation.test.tsx`<br/>`front/__tests__/fp2/admin.publish-gating.test.tsx` | REMOVE+REPLACE | Route not accessible. Backend endpoint works |
| Set tags | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `PATCH /games/:id/tags` | `front/__tests__/fp2/admin.tags-ui.test.tsx` | REMOVE+REPLACE | Route not accessible. Backend endpoint works |
| Force status change | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /games/:id/status` (super admin only) | `front/__tests__/fp2/admin.status-validation.test.tsx`<br/>`front/__tests__/fp2/admin.status-remark.test.tsx` | REMOVE+REPLACE | Route not accessible. Backend endpoint works |

### FP2 Backend

| Feature | Endpoint | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| POST /teams | `POST /teams` | `back/src/teams/teams.controller.ts`<br/>`back/src/teams/teams.service.ts` | `back/__tests__/fp2/admin.teams.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| PATCH /teams/:id | `PATCH /teams/:id` | `back/src/teams/teams.controller.ts` | None | MISSING | Endpoint exists, no tests |
| POST /teams/:id/members | `POST /teams/:id/members` | `back/src/teams/teams.controller.ts` | None | MISSING | Endpoint exists, no tests |
| DELETE /teams/:id/members/:userId | `DELETE /teams/:id/members/:userId` | `back/src/teams/teams.controller.ts` | None | MISSING | Endpoint exists, no tests |
| POST /teams/:id/leader | `POST /teams/:id/leader` | `back/src/teams/teams.controller.ts` | None | MISSING | Endpoint exists, no tests |
| POST /games/:id/build | `POST /games/:id/build` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.games.build.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| POST /games/:id/publish | `POST /games/:id/publish` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.games.publish.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| POST /games/:id/status | `POST /games/:id/status` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.games.status.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| PATCH /games/:id/tags | `PATCH /games/:id/tags` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.games.tags.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| POST /games/:id/status (validation) | `POST /games/:id/status` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.status-validation.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| POST /games/:id/publish (validation) | `POST /games/:id/publish` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.publish-validation.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| POST /games/:id/build (limit) | `POST /games/:id/build` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.build-limit.test.ts` | REWRITE | Uses deprecated `x-admin-token`, needs JWT migration |
| PATCH /games/:id/tags (permissions) | `PATCH /games/:id/tags` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/admin.tags-permission.test.ts` | KEEP | Verify if uses JWT |
| Admin guard | Various | `back/src/auth/auth.guard.ts` | `back/__tests__/fp2/admin.guard.test.ts` | KEEP | Verify if uses JWT |
| Games visibility | `GET /games` | `back/src/games/games.controller.ts` | `back/__tests__/fp2/games.visibility.test.ts` | KEEP | Public endpoint, should work |
| CSP headers | Various | `back/src/csp.middleware.ts` | `back/__tests__/fp2/csp.headers.test.ts` | KEEP | Security test, should work |

### FP2 Frontend Tests

| Test File | Current Status | Action | Replacement Test |
|-----------|----------------|--------|------------------|
| `front/__tests__/fp2/admin.authoring.test.tsx` | Tests `/teams`, `/editor/*` routes | REMOVE+REPLACE | New: "Teams app allows creating team" (when app exists) OR mark feature removed |
| `front/__tests__/fp2/admin.guard.test.tsx` | Tests `/editor/*` route redirect | REWRITE | Update to DesktopPage semantics (already uses `renderAppRoot`) |
| `front/__tests__/fp2/admin.forbidden-states.test.tsx` | Tests `/editor/*` route redirect | REWRITE | Update to DesktopPage semantics (already uses `renderAppRoot`) |
| `front/__tests__/fp2/admin.publish-validation.test.tsx` | Tests `/editor/games/1` route | REMOVE+REPLACE | New: "Editor app validates publish requirements" (when app exists) |
| `front/__tests__/fp2/admin.status-validation.test.tsx` | Tests `/editor/games/1` route | REMOVE+REPLACE | New: "Editor app allows super admin status change" (when app exists) |
| `front/__tests__/fp2/admin.tags-ui.test.tsx` | Tests `/editor/games/1` route | REMOVE+REPLACE | New: "Editor app shows tags UI" (when app exists) |
| `front/__tests__/fp2/admin.status-remark.test.tsx` | Tests `/editor/games/1` route | REMOVE+REPLACE | New: "Editor app shows remark field for super admin" (when app exists) |
| `front/__tests__/fp2/admin.publish-gating.test.tsx` | Tests `/editor/*` route | REMOVE+REPLACE | New: "Editor app gates publish button" (when app exists) |
| `front/__tests__/fp2/game.visibility.test.tsx` | Tests public game access | KEEP | Verify if tests public access correctly |
| `front/__tests__/fp2/game.csp-sandbox.test.tsx` | Tests CSP sandbox | KEEP | Security test, should work |

### FP2 Dead Code

| File | Reason | Replacement |
|------|--------|-------------|
| `front/src/App.tsx` routes (`/teams`, `/editor/*`) | Not used by `main.tsx` (uses ShellRoot) | Need Teams/Editor apps or Explorer integration |
| Backend tests using `x-admin-token` | Deprecated auth method (FP2 → FP4 migration) | Use JWT tokens with `JwtAuthGuard` |

### FP2 Auth Migration

| Component | FP2 (Deprecated) | FP4 (Current) | Status |
|-----------|------------------|---------------|--------|
| Backend endpoints | `x-admin-token` header | JWT tokens (`Authorization: Bearer <token>`) | ✅ Migrated |
| Backend tests | `x-admin-token` header | JWT tokens | ❌ **Needs migration** (8 tests) |
| Frontend auth | Not applicable (routes not accessible) | JWT tokens in localStorage | N/A |
| Roles | Superuser only | Unauthenticated Visitor, Authenticated User, Super Admin | ✅ Migrated |

---

## FP1: Browse & Play + Admin Authoring

| Feature | UI Entry | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| **1.1 Public Catalog** |
| Browse catalog | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (CatalogPage, lines 220-488)<br/>Route: `/catalog` | `front/__tests__/fp1/catalog.states.test.tsx` | REMOVE+REPLACE | Route not used by `main.tsx` (uses ShellRoot). Need catalog app or Explorer integration |
| Filter by tags | ❌ NOT ACCESSIBLE | `CatalogPage.tsx` (lines 256-298)<br/>Uses `GET /games?tag=...` | `catalog.states.test.tsx` | REMOVE+REPLACE | Same as above |
| **1.2 Game Playback** |
| Open game page | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (GamePage, lines 490-732)<br/>Route: `/games/:id` | `front/__tests__/fp1/game.playback.test.tsx` | REMOVE+REPLACE | Route not used. Executor app exists but no way to open games |
| Play game (iframe) | ✅ Executor app | `front/src/os/apps/AppHost.tsx`<br/>`front/src/os/apps/registry-init.tsx` (executor app)<br/>`front/src/components/GameWindow.tsx` | None | MISSING | Executor app uses AppHost but no tests for game opening flow |
| **1.3 Admin Authoring** |
| Create team | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (TeamsPage)<br/>Route: `/teams` | `front/__tests__/fp1/admin.authoring.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Create/edit game | ❌ NOT ACCESSIBLE | `front/src/App.tsx` (EditorPage)<br/>Route: `/editor/games/:id` | `front/__tests__/fp1/admin.authoring.test.tsx`<br/>`front/__tests__/fp1/admin.publish-gating.test.tsx`<br/>`front/__tests__/fp1/admin.status-remark.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Upload build | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /admin/games/:id/build` | `admin.authoring.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Publish game | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /admin/games/:id/publish` | `admin.publish-gating.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Set tags | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /admin/games/:id/tags` | `admin.authoring.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |
| Change status | ❌ NOT ACCESSIBLE | `EditorPage.tsx`<br/>Uses `POST /admin/games/:id/status` | `admin.status-remark.test.tsx` | REMOVE+REPLACE | Route not used. Backend endpoints work |

### FP1 Backend

| Feature | Endpoint | Code Entry | Tests | Status | Evidence |
|---------|----------|------------|-------|--------|----------|
| GET /games (list) | `GET /games` | `back/src/games/games.controller.ts`<br/>`back/src/games/games.service.ts` | `back/__tests__/fp1/games.list.test.ts` | KEEP | Tests exist and pass |
| GET /games/:id | `GET /games/:id` | `back/src/games/games.controller.ts`<br/>`back/src/games/games.service.ts` | `back/__tests__/fp1/games.get.test.ts` | KEEP | Tests exist and pass |
| POST /admin/teams | `POST /admin/teams` | `back/src/teams/teams.controller.ts`<br/>`back/src/teams/teams.service.ts` | `back/__tests__/fp1/admin.teams.test.ts` | KEEP | Tests exist and pass |
| POST /admin/games/:id/build | `POST /admin/games/:id/build` | `back/src/games/games.controller.ts` | `back/__tests__/fp1/admin.games.build.test.ts` | KEEP | Tests exist and pass |
| POST /admin/games/:id/publish | `POST /admin/games/:id/publish` | `back/src/games/games.controller.ts` | `back/__tests__/fp1/admin.games.publish.test.ts` | KEEP | Tests exist and pass |
| POST /admin/games/:id/status | `POST /admin/games/:id/status` | `back/src/games/games.controller.ts` | `back/__tests__/fp1/admin.games.status.test.ts` | KEEP | Tests exist and pass |
| POST /admin/games/:id/tags | `POST /admin/games/:id/tags` | `back/src/games/games.controller.ts` | `back/__tests__/fp1/admin.games.tags.test.ts` | KEEP | Tests exist and pass |

### FP1 Dead Code

| File | Reason | Replacement |
|------|--------|-------------|
| `front/src/App.tsx` routes (`/catalog`, `/games/:id`, `/teams`, `/editor/*`) | Not used by `main.tsx` (uses ShellRoot) | Need catalog/admin apps or Explorer integration |
| `front/src/components/WindowManager.tsx` | Uses old `WindowContext` | Replaced by `front/src/os/wm/WindowManager.tsx` |
| `front/src/components/Window.tsx` | Uses old `WindowContext` | Replaced by `front/src/os/wm/WindowFrame.tsx` |
| `front/src/contexts/WindowContext.tsx` | Replaced by `WindowRegistry` | Replaced by `front/src/os/wm/WindowRegistry.tsx` |

### FP1 Test Reconciliation

| Test File | Current Status | Action | Replacement Test |
|-----------|----------------|--------|------------------|
| `front/__tests__/fp1/catalog.states.test.tsx` | Tests `/catalog` route | REMOVE+REPLACE | New: "Catalog app shows games from mockApi.games" (when catalog app exists) |
| `front/__tests__/fp1/game.playback.test.tsx` | Tests `/games/:id` route | REMOVE+REPLACE | New: "Executor app opens game with AppHost and respects iframe sandbox" |
| `front/__tests__/fp1/admin.authoring.test.tsx` | Tests `/teams`, `/editor/*` routes | REMOVE+REPLACE | New: "Admin app allows creating team/game" (when admin app exists) OR mark feature removed |
| `front/__tests__/fp1/admin.publish-gating.test.tsx` | Tests `/editor/*` route | REMOVE+REPLACE | Same as above |
| `front/__tests__/fp1/admin.status-remark.test.tsx` | Tests `/editor/*` route | REMOVE+REPLACE | Same as above |
| `back/__tests__/fp1/*` | All backend tests | KEEP | Backend endpoints still work, tests are valid |

---

## Next Steps

1. **FP6/FP7 Test Implementation:**
   - Implement placeholder tests in `front/__tests__/fp6/`
   - Add FP7-specific tests for VFS, WindowStore, AppRegistry
   - Add performance tests for WindowStore drag operations

2. **FP1-FP5 Analysis:**
   - Map FP1-FP5 features to current codebase
   - Identify deprecated routes/pages (e.g., old `App.tsx` routes)
   - Check if FP1-FP5 features still accessible via ShellRoot/Desktop

3. **Code Cleanup:**
   - Remove unused `App.tsx` routes if ShellRoot is the only entry point
   - Remove old `WindowContext.tsx` if WindowRegistry replaced it
   - Document migration path from FP6 to FP7 architecture

4. **Evidence Collection:**
   - Run tests and collect coverage
   - Document manual verification steps
   - Create demo videos for each feature

---

## Notes

- **Architecture Change:** FP7 refactored FP6's naive implementation. Tests written for FP6 may not reflect FP7 architecture.
- **VFS vs. Backend:** Explorer was supposed to show jams/years/games from backend, but FP7 uses VFS. Need to reconcile.
- **Mobile Mode:** Currently shows placeholder. FP6 docs say it should be functional.
- **Routing:** `App.tsx` still has routes, but `main.tsx` uses `ShellRoot` directly. Need to verify which is active.
