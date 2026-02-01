# FP7 Test Contract

**Purpose:** This document defines what we test in FP7 and why, ensuring tests are deterministic and aligned with FP7 contract requirements.

**Last Updated:** 2026-01-22

---

## Test Strategy

### Deterministic Selectors

**Rule:** Never use ambiguous text queries that can match multiple panes (tree/grid/desktop).

**Pattern:**
- Use `within(container)` + `data-testid` for all item queries
- Containers: `explorer-tree`, `explorer-grid`, `desktop-icons`
- Items: path-based `data-testid` (e.g., `tree-item-/Disk C`, `explorer-grid-item-/Disk C/desktop`, `desktop-icon-/Disk C/desktop/help.txt`)

**Why:**
- Prevents flaky tests when same text appears in multiple panes
- Makes tests self-documenting (path-based testids show exact location)
- Aligns with FP7 contract: Explorer shows same content in tree and grid

### Test Structure

All FP7 tests follow this structure:

```typescript
// 1. Get container using data-testid
const treeView = screen.getByTestId('explorer-tree');
const gridView = screen.getByTestId('explorer-grid');
const desktopIcons = screen.getByTestId('desktop-icons');

// 2. Query items within container using path-based data-testid
const diskC = within(treeView).getByTestId('tree-item-/Disk C');
const desktopFolder = within(gridView).getByTestId('explorer-grid-item-/Disk C/desktop');
const helpFile = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt');
```

---

## What We Test

### 1. Shell Boot & Platform Context

**Tests:**
- `shell.boot.desktop.test.tsx`: ShellRoot determines Desktop on boot
- `shell.boot.mobile.test.tsx`: ShellRoot determines Mobile on boot
- `shell.platform-context.test.tsx`: Platform Context fixed for session

**Why:** FP7 requires shell-only navigation (no react-router). Platform context determines Desktop vs Mobile experience.

**Contract:** ShellRoot is single entry point, determines context on boot, fixes for session.

---

### 2. Desktop Icons

**Tests:**
- `desktop.icons.render.test.tsx`: Icons render from VFS `/Disk C/desktop`
- `desktop.icons.open.test.tsx`: Double-click opens window
- `desktop.icons.from-desktop-only.test.tsx`: Icons only from `/Disk C/desktop` (not other locations)

**Why:** FP7 contract: Desktop Icons read strictly from `/Disk C/desktop` system folder. Cannot be moved to arbitrary folders.

**Contract:**
- Source: `/Disk C/desktop` (immutable system folder)
- Single-click: selection
- Double-click: open window/app
- Filtering: `admin_help.txt` visible only to Organizer

**Selectors:**
```typescript
const desktopIcons = screen.getByTestId('desktop-icons');
const icon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url');
```

---

### 3. Explorer (Tree + Grid)

**Tests:**
- `explorer.tree-view.test.tsx`: Tree shows folder hierarchy
- `explorer.grid-view.test.tsx`: Grid shows folder contents
- `explorer.navigate.test.tsx`: Click in tree updates grid
- `explorer.vfs-sync.test.tsx`: VFS changes reflect in Explorer
- `explorer.root-tree.includes-system-folders.test.tsx`: Root tree always shows system folders (`/Disk A`, `/Disk B`, `/Disk C`)

**Why:** FP7 contract: Explorer navigates entire VFS tree from root. Tree and Grid must stay synchronized.

**Contract:**
- Tree view (left): hierarchy from root (`/`) to any depth
- Grid view (right): contents of selected folder
- Synchronization: VFS events update both views instantly
- Root always shows system folders: `/Disk A`, `/Disk B`, `/Disk C`

**Selectors:**
```typescript
// Tree items
const treeView = screen.getByTestId('explorer-tree');
const diskC = within(treeView).getByTestId('tree-item-/Disk C');

// Grid items
const gridView = screen.getByTestId('explorer-grid');
const desktopFolder = within(gridView).getByTestId('explorer-grid-item-/Disk C/desktop');
```

---

### 4. VFS Operations & RBAC

**Tests:**
- `vfs.read-only-guest.test.tsx`: Guest cannot write to VFS
- `vfs.organizer-full-control.test.tsx`: Organizer can create/upload/move/delete in subtree
- `vfs.system-folders.immutable.test.tsx`: Root-level system folders cannot be deleted/renamed/moved
- `vfs.organizer.nested-ops.test.tsx`: Organizer can create deep nested structure inside system folders

**Why:** FP7 contract: Immutable root-level system folders, mutable subtree. RBAC enforced: Guest read-only, Organizer full control in subtree.

**Contract:**
- **Immutable:** Root-level system folders (`/Disk A`, `/Disk B`, `/Disk C`) cannot be deleted, renamed, or moved
- **Mutable:** Subtree (inside system folders) - Organizer has full control
- **RBAC:**
  - Guest: read-only (`readFile`, `readDir`, `stat`)
  - Participant: read-only (same as Guest)
  - Organizer: full control in subtree (`createFolder`, `uploadFile`, `moveItem`, `deleteItem`, `renameItem`)

**Backend Tests:**
- `back/__tests__/fp7/vfs.immutable-folders.test.ts`: Backend enforces immutable folders
- `back/__tests__/fp7/vfs.rbac.test.ts`: Backend enforces RBAC

---

### 5. Help Files Visibility

**Tests:**
- `desktop.help-files.test.tsx`: `help.txt` visible to all, `admin_help.txt` visible only to Organizer

**Why:** FP7 contract: `admin_help.txt` is filtered by role in DesktopPage. Guest/Participant see only `help.txt`.

**Contract:**
- `help.txt`: Visible to Guest, Participant, Organizer
- `admin_help.txt`: Visible only to Organizer
- Filtering happens in `DesktopPage` component (reads `vfs.getUserRole()`)

**Selectors:**
```typescript
const desktopIcons = screen.getByTestId('desktop-icons');
const helpFile = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt');
const adminHelp = within(desktopIcons).queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt');
// For Guest: adminHelp should be null
// For Organizer: adminHelp should be truthy
```

---

### 6. Auth Mode Gating

**Tests:**
- `back/__tests__/fp7/auth.mode-gating.test.ts`: `/api/auth/dev` only in `AUTH_MODE=dev`, `/api/auth/telegram` only in `AUTH_MODE=telegram`

**Why:** FP7 contract: Platform works in one of two modes: `dev` (local development) or `telegram` (production). DEV MODE must be blocked in production.

**Contract:**
- `AUTH_MODE=dev`: `/api/auth/dev` available, `/api/auth/telegram` blocked
- `AUTH_MODE=telegram`: `/api/auth/telegram` available, `/api/auth/dev` blocked
- Default (if not set): `telegram` mode

**Backend Tests:**
- `back/__tests__/fp7/auth.mode-gating.test.ts`: Tests mode gating for both endpoints

---

### 7. Content Opening

**Tests:**
- `content.image-opens-viewer.test.tsx`: `.png` opens in ImageViewer
- `content.video-opens-viewer.test.tsx`: `.mp4` opens in VideoViewer
- `content.txt-opens-notepad.test.tsx`: `.txt` opens in Notepad
- `content.html-opens-ie.test.tsx`: `.html` opens in Internet Explorer
- `content.webapp-opens-executor.test.tsx`: `.app` opens in Executor iframe

**Why:** FP7 contract: Content types map to specific Viewers via AppRegistry. Double-click opens correct viewer.

**Contract:**
- File type determined by extension or metadata
- AppRegistry resolves app for file type
- Double-click opens file in correct viewer window

---

### 8. Windowing

**Tests:**
- `window.viewport-boundary.test.tsx`: Windows cannot be dragged outside viewport
- `window.drag.test.tsx`: Drag works only on title bar
- `window.focus.test.tsx`: Click raises window to front (z-index)
- `window.open-close.test.tsx`: Open/close windows works

**Why:** FP7 contract: Windows must respect viewport boundaries. Focus model: active window (z-index 20) vs inactive (z-index 10).

**Contract:**
- Viewport boundary: windows cannot be dragged/resized outside viewport
- Drag: only on title bar
- Focus: click raises window, changes z-index and title bar color

---

## What We Don't Test (Legacy/Non-FP7)

### Deleted Tests

**Removed:**
- All tests for react-router routes (`/catalog`, `/games/:id`, etc.)
- All tests for CatalogPage, GamePage, TeamsPage, EditorPage
- All tests for email/password auth (replaced by Telegram auth)

**Why:** FP7 contract: Shell-only navigation. No react-router, no "site pages". Auth is Telegram-only (or DEV MODE for local development).

---

## Test Data & Fixtures

### VFS Setup

All tests reset VFS in `beforeEach`:

```typescript
beforeEach(() => {
  (vfs as any).root = {
    name: '',
    type: 'dir',
    children: [],
  };
  (vfs as any).initializeSystemFolders();
  vfs.setUserRole('Organizer'); // For write operations
});
```

### Role Testing

Tests verify behavior for each role:
- Guest: read-only, cannot see `admin_help.txt`
- Participant: read-only, cannot see `admin_help.txt`
- Organizer: full control in subtree, can see `admin_help.txt`

---

## Test Files Structure

```
front/__tests__/fp7/
  shell.boot.desktop.test.tsx
  shell.boot.mobile.test.tsx
  shell.platform-context.test.tsx
  desktop.icons.render.test.tsx
  desktop.icons.open.test.tsx
  desktop.icons.from-desktop-only.test.tsx
  desktop.help-files.test.tsx
  explorer.tree-view.test.tsx
  explorer.grid-view.test.tsx
  explorer.navigate.test.tsx
  explorer.vfs-sync.test.tsx
  explorer.root-tree.includes-system-folders.test.tsx
  window.viewport-boundary.test.tsx
  window.drag.test.tsx
  window.focus.test.tsx
  window.open-close.test.tsx
  content.image-opens-viewer.test.tsx
  content.video-opens-viewer.test.tsx
  content.txt-opens-notepad.test.tsx
  content.html-opens-ie.test.tsx
  content.webapp-opens-executor.test.tsx
  vfs.read-only-guest.test.tsx
  vfs.organizer-full-control.test.tsx
  vfs.system-folders.immutable.test.tsx
  vfs.organizer.nested-ops.test.tsx
  auth.telegram.test.tsx
  auth.dev-mode.test.tsx
  auth.roles.test.tsx
  auth.user-panel.test.tsx
  auth.logout.test.tsx
  ui.organizer-actions.test.tsx
  ui.guest-participant-actions.test.tsx
  taskbar.tray.test.tsx
  taskbar.auth-status.test.tsx

back/__tests__/fp7/
  auth.dev.test.ts
  auth.integration.test.ts
  auth.mode-gating.test.ts
  vfs.rbac.test.ts
  vfs.immutable-folders.test.ts
```

---

## Best Practices

### 1. Always Use `within()` for Container Queries

**Bad:**
```typescript
screen.getByText('Disk C'); // Ambiguous - could be in tree or grid
```

**Good:**
```typescript
const treeView = screen.getByTestId('explorer-tree');
const diskC = within(treeView).getByTestId('tree-item-/Disk C');
```

### 2. Use Path-Based `data-testid`

**Bad:**
```typescript
data-testid="explorer-grid-item-file.txt" // Ambiguous if multiple files with same name
```

**Good:**
```typescript
data-testid="explorer-grid-item-/Disk C/documents/file.txt" // Unique path
```

### 3. Test Role-Based Behavior

Always test for each role (Guest, Participant, Organizer) when behavior differs:

```typescript
it('should show admin_help.txt only for Organizer', async () => {
  vfs.setUserRole('Organizer');
  // ... test
});

it('should NOT show admin_help.txt for Guest', async () => {
  vfs.setUserRole('Guest');
  // ... test
});
```

### 4. Use `waitFor()` for Async VFS Updates

VFS events are async. Use `waitFor()` when testing VFS changes:

```typescript
vfs.writeFile('/Disk C/desktop/new-file.txt', 'content');
await waitFor(() => {
  const desktopIcons = screen.getByTestId('desktop-icons');
  expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/new-file.txt')).toBeInTheDocument();
});
```

---

## Summary

**Key Principles:**
1. **Deterministic:** Use `within()` + `data-testid` (path-based) for all item queries
2. **Contract-Aligned:** Test only FP7 behaviors (shell-only, immutable folders, RBAC, auth mode gating)
3. **Role-Aware:** Test behavior for each role (Guest, Participant, Organizer)
4. **No Legacy:** Delete tests for react-router, email/password auth, old "site pages"

**Test Coverage:**
- Shell boot & platform context
- Desktop Icons (source: `/Disk C/desktop`, role filtering)
- Explorer (tree + grid, VFS sync)
- VFS operations & RBAC (immutable folders, subtree freedom)
- Help files visibility (role-based)
- Auth mode gating (dev vs telegram)
- Content opening (type → viewer mapping)
- Windowing (viewport boundary, focus, drag)

---

**End of FP7_TEST_CONTRACT.md**
