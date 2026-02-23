# FP4 M2 — Viewer Boot/Handshake Fix (Evidence)

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** build, milestone=M2  
**Role:** @Engineer

---

## 1. Why "App not responding" Occurred

**Root cause:** Race between Shell's message listener and viewer's APP_READY:

1. **Listener timing:** Shell used `useEffect` to add the `message` listener. Effects run after paint. With a cached viewer iframe, the iframe could load and send APP_READY before the listener was attached → message dropped → handshake timeout (2000ms) → "App not responding".

2. **Single APP_READY:** Viewer sent APP_READY only once (inline script). If that send was missed, no retry.

3. **React StrictMode:** Double-mount could exacerbate the race (unmount → cleanup → remount → new timer; iframe reloads but timing remains tight).

---

## 2. What Changed

| File                                              | Change                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `front/core/AppHost.tsx`                          | `useEffect` → `useLayoutEffect` for message listener. Listener attached synchronously after DOM commit, before paint, so it is ready before iframe can load. |
| `front/apps/image-viewer/index.html`              | Add DOMContentLoaded fallback: send APP_READY again when DOM is parsed, if first send was missed.                                                            |
| `front/apps/media-player/index.html`              | Same as image-viewer.                                                                                                                                        |
| `front/__tests__/fp4/app-host-handshake.test.tsx` | Add T-FP4-M2-STRICT: handshake under StrictMode (double-mount).                                                                                              |

---

## 3. Commands and Exit Codes

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/test-unit.sh`       | 0    |
| `pnpm lint`                  | 0    |
| `pnpm format:check`          | 0    |
| `./infra/smoke.sh`           | 0    |

---

## 4. Evidence: Changed Files

| Path                                              | Purpose                               |
| ------------------------------------------------- | ------------------------------------- |
| `front/core/AppHost.tsx`                          | useLayoutEffect for message listener  |
| `front/apps/image-viewer/index.html`              | APP_READY + DOMContentLoaded fallback |
| `front/apps/media-player/index.html`              | APP_READY + DOMContentLoaded fallback |
| `front/__tests__/fp4/app-host-handshake.test.tsx` | T-FP4-M2-STRICT test                  |
