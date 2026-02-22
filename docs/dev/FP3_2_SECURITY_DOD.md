# FP3.2 Security DoD (Delta)

**Purpose:** Подтвердить, что изменения FP3.2 не расширяют доступ user apps к gateway.  
**Reference:** [FP3_SECURITY_DOD.md](FP3_SECURITY_DOD.md) — baseline без изменений.

---

## 1. Scope FP3.2

FP3.2 меняет:

- Explorer UI (roots view, toolbar, back icon, scroll, multi-instance state)
- Explorer logic (delete wiring, rename toPath)
- App open (retry при 404)
- Shell WindowManager (maximize)

**Никаких изменений в:**

- Sandbox matrix (Explorer / user app / viewer)
- Gateway authZ (Read vs Write, token)
- CORS, origin allowlist
- postMessage routing
- Path policy

---

## 2. Confirmation Checklist

| Check                                                   | Status      |
| ------------------------------------------------------- | ----------- |
| User app по-прежнему `sandbox="allow-scripts"` only     | ✓ Unchanged |
| Explorer по-прежнему `allow-scripts allow-same-origin`  | ✓ Unchanged |
| Gateway Write API требует X-System-App + X-System-Token | ✓ Unchanged |
| Token только в SHELL_CAPS для Explorer windows          | ✓ Unchanged |
| User app не получает token                              | ✓ Unchanged |
| CORS allowlist без `*`                                  | ✓ Unchanged |
| Path policy (writable только My Documents)              | ✓ Unchanged |
| Rename: same-parent only (gateway enforce)              | ✓ Unchanged |

---

## 3. FP3.2-Specific Notes

### Delete / Rename

- Вызываются только из Explorer (context menu).
- Используют `fetchWithToken` (X-System-App, X-System-Token).
- User app не имеет доступа к этим endpoints (no token, no same-origin).

### Open-url Retry

- Retry выполняется Explorer или Shell при 404.
- Запрос идёт с Shell origin (Explorer same-origin) или от Shell напрямую.
- User app не вызывает open-url (SHELL_OPEN только от Explorer).

### Maximize

- Изменение только в Shell/WindowManager (bounds, state).
- Не затрагивает gateway, postMessage, sandbox.

---

## 4. Conclusion

**FP3.2 не расширяет доступ user apps к gateway.** Все изменения — UX и logic внутри Explorer/Shell. Security model FP3 остаётся в силе.
