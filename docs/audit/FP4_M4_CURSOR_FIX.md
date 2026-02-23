# FP4 M4: Cursor / Embedded Browser Fix

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Status:** Implemented

## Problem

1. **Cursor Simple Browser:** При открытии shell.local через Cursor ничего не работало — Explorer не передавал SHELL_OPEN_FILE в Shell.
2. **Firefox:** Окна открывались, но контент мог не загружаться (кэш viewer HTML с устаревшим postMessage targetOrigin).
3. **Prev/Next:** Плейлист должен работать для 2+ файлов в директории.

## Root Cause

**Explorer postMessage targetOrigin:** Explorer использовал `window.location.origin` для postMessage. Когда родительское окно в embedded-контексте (Cursor Simple Browser, Electron webview), origin родителя может отличаться, и браузер не доставляет сообщение из-за несовпадения targetOrigin.

**Viewer cache:** Ранее исправлено в M1/M2 — viewer использует `"*"` и Cache-Control: no-store для HTML.

## Fix

### 1. Explorer: targetOrigin `"*"`

```diff
- window.parent.postMessage({ type, payload, timestamp: Date.now() }, window.location.origin);
+ window.parent.postMessage({ type, payload, timestamp: Date.now() }, "*");
```

Shell по-прежнему проверяет `event.source === iframe.contentWindow` для маршрутизации, безопасность сохранена.

### 2. Тест T-FP4-M4-EXPLORER-TARGET

Добавлен unit-тест `front/__tests__/fp4/explorer-postmessage-target.test.ts`, проверяющий что Explorer использует `"*"` в postMessage.

## Verification

- `pnpm test` — 101 тестов PASS (16 файлов)
- API/integration тесты требуют `docker compose -f infra/docker-compose.dev.yml up -d`

## Files Changed

- `front/apps/explorer/main.ts` — send() использует `"*"`
- `front/__tests__/fp4/explorer-postmessage-target.test.ts` — новый тест
