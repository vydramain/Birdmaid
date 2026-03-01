<!-- TEMP(FP5.1): M0 BUILD AUDIT — audit only, no code changes -->

# FP5 M0 Build Audit — Injection Points & Implementation Map

**Date:** 2026-03-01  
**Mode:** FP=FP5 mode=build M0 (AUDIT + IMPLEMENTATION MAP)  
**Scope:** No code changes; baseline gate + injection points + minimal patch plan.

---

## 1. Baseline Gate Evidence

| Command                  | Expected    | Actual      | Notes                                                |
| ------------------------ | ----------- | ----------- | ---------------------------------------------------- |
| `git status --porcelain` | empty       | non-empty   | M/D/?? FP5 design docs, modified core docs           |
| `./infra/smoke.sh`       | PLATFORM OK | PLATFORM OK | exit 0                                               |
| `pnpm lint`              | 0           | 2           | stylelint: front/index.css, front/shared/fs-tile.css |
| `pnpm format:check`      | 0           | 1           | docs/audit/FP5_AUDIT_REPORT.md                       |
| `pnpm test --run`        | 0           | 1           | 7 failed (FP4 min-size: 320→640, 240→480)            |

**Baseline status:** NOT GREEN. Lint, format, and unit tests have pre-existing failures. Queue-safety: fix these before M1 implementation.

---

## 2. Injection Points (Current Code)

### 2.1 Explorer: isApp (directory = app)

| Location                                                             | What                                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `back/src/fs.ts`                                                     | `checkIsApp()` — HEAD on `{dir}/index.html`; used in `listItems()`, `statItem()` |
| `back/src/fs.ts`                                                     | `listItems()` line 89 — `isApp` per dir in list response                         |
| `back/src/fs.ts`                                                     | `statItem()` line 189 — `isApp` for dir on 404→list fallback                     |
| `infra/minio/fixtures/DISK_C/Program Files/Explorer/main.ts`         | `item.isApp ?? checkIsApp(apiPath)` — double-click decision                      |
| `infra/minio/fixtures/DISK_C/Program Files/Explorer/_source/main.ts` | Same (source)                                                                    |

**Note:** Gateway already returns `isApp` for any dir with index.html. No change needed for discovery; FP5 user apps = same rule.

### 2.2 Shell: SHELL_OPEN { kind: "app" }

| Location                 | What                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `front/Shell.tsx`        | `handleShellOpen()` lines 166–232 — receives payload from AppHost                             |
| `front/Shell.tsx`        | `payload.kind === "app"` → `isUserAppPath()` → user app: `buildUserAppSrc()`; else open-url   |
| `front/Shell.tsx`        | User app: `wm.createWindow({ src: /apps/user/?path=... })` (line 175); system: open-url (195) |
| `front/core/AppHost.tsx` | `handleMessage` lines 156–167 — `SHELL_OPEN` only when `isExplorer && onShellOpen`            |
| `front/Shell.tsx`        | `isExplorerWindow(w.src)` → `onShellOpen` / `onShellOpenFile` passed only for Explorer        |

**Current flow:** Explorer sends SHELL_OPEN; Shell distinguishes user app (writable root) vs system app (Program Files). User app → hosted route; system app → open-url.

### 2.3 iframe src for app windows

| Location                      | What                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `front/Shell.tsx`             | `handleShellOpen` line 175 — user app: `wm.createWindow({ src: buildUserAppSrc(path), title })`                             |
| `front/Shell.tsx`             | `handleShellOpen` line 195 — system app: `wm.createWindow({ src: url, title })` where url = open-url response               |
| `front/core/WindowManager.ts` | `createWindow({ src, title, openFilePayload? })`                                                                            |
| `front/core/AppHost.tsx`      | `iframe` line 225 — `src={src}`, `sandbox={isExplorer && !isUserApp ? "allow-scripts allow-same-origin" : "allow-scripts"}` |
| `vite.config.ts`              | Lines 113–204: `/apps/user` route — path query, open-url fetch, path confinement (..), CSP on HTML                          |

**Current:** User app → `/apps/user/?path=...` → iframe. System app → open-url → S3 signed URL → iframe.

### 2.4 postMessage validation

| Location                 | What                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `front/core/AppHost.tsx` | `handleMessage` — origin allowlist, source→windowId map                                               |
| `front/core/AppHost.tsx` | APP_READY, WINDOW_TITLE, ERROR — accepted from all; SHELL_OPEN/SHELL_OPEN_FILE only when `isExplorer` |
| `front/core/AppHost.tsx` | Lines 151–155: `isUserApp` → PRIVILEGED_TYPES reject + analytics; allowlist implicit                  |
| `front/core/AppHost.tsx` | `createShellCaps(windowId, scale, theme, isExplorer && !isUserApp)` — no token for user app           |
| `front/core/protocol.ts` | `createShellCaps(isExplorer)` — token only when isExplorer                                            |
| `front/core/protocol.ts` | `ALLOWED_ORIGINS` — includes `null` for sandboxed viewers                                             |

**Current:** `isUserApp` classification present. User app: privileged types rejected; SHELL_OPEN/SHELL_OPEN_FILE never passed (onShellOpen only for Explorer).

### 2.5 System apps / viewers / app windows

| Location                    | What                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `front/Shell.tsx`           | `isExplorerWindow(src)` — Explorer: `/apps/explorer`, `Program Files/Explorer`      |
| `front/Shell.tsx`           | `isUserAppWindow(src)` — `src.includes("/apps/user/?path=")` (line 50)              |
| `front/Shell.tsx`           | Line 482: `isUserApp={isUserAppWindow(w.src)}` passed to AppHost                    |
| `front/Shell.tsx`           | `isExplorer` → AppHost gets onShellOpen, onShellOpenFile, allow-same-origin sandbox |
| `front/core/AppHost.tsx`    | `openFilePayload` → OPEN_FILE on APP_READY (viewer path)                            |
| `vite.config.ts`            | FIXTURE_APPS: explorer, image-viewer, media-player; `/apps/user/` route present     |
| `front/lib/fp5/user-app.ts` | `isUserAppPath()`, `buildUserAppSrc()` — writable root, not Program Files           |

**Classification today:** Explorer vs Viewer vs User app. User app distinguished by `isUserAppWindow(src)`.

---

## 3. Minimal Implementation Map (M1–M3)

| #   | Milestone | File(s)                     | Status  | Change                                                                                        |
| --- | --------- | --------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| 1   | M1        | `front/Shell.tsx`           | DONE    | handleShellOpen: isUserAppPath → buildUserAppSrc; system app → open-url                       |
| 2   | M1        | `vite.config.ts`            | DONE    | `/apps/user/` route: path query, open-url fetch, path confinement (..), CSP on HTML           |
| 3   | M1        | `front/Shell.tsx`           | DONE    | `isUserAppWindow(src)` — `src.includes("/apps/user/?path=")`                                  |
| 4   | M1        | `front/core/AppHost.tsx`    | DONE    | `isUserApp` prop; sandbox allow-scripts only; PRIVILEGED_TYPES reject; no token in SHELL_CAPS |
| 5   | M1        | `front/lib/fp5/user-app.ts` | DONE    | `isUserAppPath()`, `buildUserAppSrc()` — writable root, not Program Files                     |
| 6   | M2        | —                           | DONE    | Path validation in vite route (line 134: `..` deny); canonical check via isUserAppPath        |
| 7   | M2        | `vite.config.ts`            | DONE    | CSP: script-src, style-src, img-src, media-src, connect-src 'self'; frame-src 'none'          |
| 8   | M3        | Tests                       | PENDING | D1–D2, L1, L3, C1–C2, H1, I1 per FP5_TESTS.md — fix baseline first                            |

---

## 4. File Change Summary

| File                                         | M1     | M2     | M3                |
| -------------------------------------------- | ------ | ------ | ----------------- |
| `front/Shell.tsx`                            | ✓ DONE | —      | —                 |
| `front/core/AppHost.tsx`                     | ✓ DONE | —      | —                 |
| `front/lib/fp5/user-app.ts`                  | ✓ DONE | —      | —                 |
| `vite.config.ts`                             | ✓ DONE | ✓ DONE | —                 |
| `back/src/fs.ts`                             | —      | —      | (isApp unchanged) |
| Tests (discovery, launch, hostile, delivery) | —      | —      | ✓ write/run       |

---

## 5. Implementation Points Summary (Quick Reference)

| Point                        | File(s)                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Explorer: isApp (dir = app)  | `back/src/fs.ts` (checkIsApp, listItems, statItem); Explorer main.ts                                |
| Shell: SHELL_OPEN kind=app   | `front/Shell.tsx` (handleShellOpen); `front/core/AppHost.tsx` (handleMessage)                       |
| iframe src for app windows   | `front/Shell.tsx` (createWindow); `front/core/AppHost.tsx` (iframe); `vite.config.ts` (/apps/user/) |
| postMessage validation       | `front/core/AppHost.tsx` (handleMessage, isUserApp, PRIVILEGED_TYPES)                               |
| System vs viewer vs user app | `front/Shell.tsx` (isExplorerWindow, isUserAppWindow); `front/lib/fp5/user-app.ts` (isUserAppPath)  |

---

## 6. Minimal Patch Plan (M1–M3)

1. **Baseline:** Fix lint (stylelint front/index.css, fs-tile.css); format docs/audit/FP5_AUDIT_REPORT.md; fix FP4 min-size tests (320→640, 240→480).
2. **M1–M2:** Core implementation already present. No code changes for M0 audit.
3. **M3 Tests:** Run D1–D2 (discovery), L1 (launch E2E), L3 (broken package), C1–C2 (confinement), H1–H2 (hostile), I1 (isolation).
4. **User hosted route:** `vite.config.ts` lines 113–204 — `/apps/user/` with path query, open-url proxy, path confinement.
5. **Path confinement:** Vite route denies `..`, `path.includes("..")`; `fullPath.startsWith(root)` check.
6. **isUserApp classification:** `front/lib/fp5/user-app.ts` (isUserAppPath); `front/Shell.tsx` (isUserAppWindow); `front/core/AppHost.tsx` (isUserApp prop).

---

## 7. DoD Checklist (M0)

- [ ] baseline green (lint, format, tests)
- [x] implementation map ready
- [x] no code changes (audit only)
