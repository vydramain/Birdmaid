# CUTLIST: Что удалить из репозитория для FP7 v2

**Версия:** 2.0  
**Дата:** 2026-01-22  
**Связано с:** [docs/fps/FP7.md](./docs/fps/FP7.md) (FP7 v2 Contract Spec), [docs/audit/FP7_COMPLIANCE_REPORT.md](./audit/FP7_COMPLIANCE_REPORT.md)

## Приоритеты

- **P0 (Critical):** Блокирует FP7 compliance, удалить немедленно
- **P1 (High):** Должно быть исправлено перед release
- **P2 (Medium):** Следует исправить для полного compliance

## Классификация

- **remove immediately**: Точно не нужно в shell-only архитектуре, удалить сразу
- **keep as history docs only**: Полезно для истории, переместить в `docs/legacy/` или `front/src/legacy/`
- **refactor later**: Полезно, но сейчас мешает, требует рефакторинга перед использованием

---

## 1. React-router и сайт-навигация

### remove immediately

**Файлы:**
- `front/src/App.tsx` (старая версия с Routes/Route)
  - **Причина:** Противоречит shell-only контракту (FP7 v2, Product Surface Contract)
  - **Действие:** Удалить Routes/Route, оставить только ShellRoot или удалить файл полностью (если main.tsx уже использует ShellRoot)

**Компоненты:**
- `front/src/components/CatalogPage.tsx` (или где находится)
  - **Причина:** "Сайт-страница", противоречит shell-only контракту
  - **Действие:** Удалить

- `front/src/components/GamePage.tsx` (или где находится)
  - **Причина:** "Сайт-страница", противоречит shell-only контракту
  - **Действие:** Удалить

- `front/src/components/TeamsPage.tsx` (или где находится)
  - **Причина:** "Сайт-страница", противоречит shell-only контракту
  - **Действие:** Удалить

- `front/src/components/EditorPage.tsx` (или где находится)
  - **Причина:** "Сайт-страница", противоречит shell-only контракту
  - **Действие:** Удалить (или переместить в legacy, если нужен для истории)

**Маршруты:**
- Все маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*` из `App.tsx`
  - **Причина:** Противоречат shell-only контракту
  - **Действие:** Удалить из Routes

**Зависимости:**
- `react-router-dom` (если больше не используется)
  - **Причина:** Не нужен в shell-only архитектуре
  - **Действие:** Удалить из `package.json`, проверить импорты

---

## 2. Email/password auth

### P0 (Critical) - remove immediately

**Why (FP7 clause):** FP7.md line 245-248: "Удалить регистрацию через email/password", "Заменить на Telegram auth". FP7.md line 860-862: Only `/api/auth/dev`, `/api/auth/telegram`, `/api/auth/me` should exist.

**Backend DTOs:**
- `back/src/auth/dto/register.dto.ts` (DELETE)
  - **Paths:** `back/src/auth/dto/register.dto.ts`
  - **How to verify removal:**
    ```bash
    test ! -f back/src/auth/dto/register.dto.ts && echo "✅ Deleted" || echo "❌ Still exists"
    grep -r "RegisterDto" back/src/ --exclude-dir=node_modules && echo "❌ Still referenced" || echo "✅ No references"
    ```

- `back/src/auth/dto/login.dto.ts` (DELETE)
  - **Paths:** `back/src/auth/dto/login.dto.ts`
  - **How to verify removal:**
    ```bash
    test ! -f back/src/auth/dto/login.dto.ts && echo "✅ Deleted" || echo "❌ Still exists"
    grep -r "LoginDto" back/src/ --exclude-dir=node_modules && echo "❌ Still referenced" || echo "✅ No references"
    ```

- `back/src/auth/dto/recovery-request.dto.ts` (DELETE)
- `back/src/auth/dto/recovery-verify.dto.ts` (DELETE)
  - **Paths:** `back/src/auth/dto/recovery-request.dto.ts`, `back/src/auth/dto/recovery-verify.dto.ts`
  - **How to verify removal:**
    ```bash
    test ! -f back/src/auth/dto/recovery-request.dto.ts && \
    test ! -f back/src/auth/dto/recovery-verify.dto.ts && \
    echo "✅ Deleted" || echo "❌ Still exists"
    ```

**Backend Endpoints:**
- `POST /api/auth/register` (DELETE from controller)
- `POST /api/auth/login` (DELETE from controller)
- `POST /api/auth/recovery/request` (DELETE from controller)
- `POST /api/auth/recovery/verify` (DELETE from controller)
  - **Paths:** `back/src/auth/auth.controller.ts` (lines 15-33)
  - **How to verify removal:**
    ```bash
    grep -q "@Post(\"register\")\|@Post(\"login\")\|@Post(\"recovery\")" \
    back/src/auth/auth.controller.ts && echo "❌ Endpoints still exist" || echo "✅ Endpoints removed"
    ```

**Backend Service Methods:**
- `register`, `login`, `requestRecovery`, `verifyRecovery`, `hashPassword` (DELETE from service)
  - **Paths:** `back/src/auth/auth.service.ts` (lines 38-112)
  - **How to verify removal:**
    ```bash
    grep -q "async register\|async login\|async requestRecovery\|async verifyRecovery" \
    back/src/auth/auth.service.ts && echo "❌ Methods still exist" || echo "✅ Methods removed"
    ```

**Backend Email Service:**
- `back/src/auth/email.service.ts` (DELETE) - **P1**
  - **Paths:** `back/src/auth/email.service.ts`
  - **Why (FP7 clause):** Not needed for Telegram auth (FP7.md line 245-248)
  - **How to verify removal:**
    ```bash
    test ! -f back/src/auth/email.service.ts && echo "✅ Deleted" || echo "❌ Still exists"
    grep -r "EmailService" back/src/auth/ --exclude-dir=node_modules && echo "❌ Still referenced" || echo "✅ No references"
    ```

**Frontend:**
- `front/src/components/AuthModal.tsx` (REWRITE for Telegram)
  - **Paths:** `front/src/components/AuthModal.tsx` (lines 12-291)
  - **How to verify removal:**
    ```bash
    grep -q "email\|password\|identifier" front/src/components/AuthModal.tsx | \
    grep -v "Telegram\|comment\|//" && echo "❌ Email/password fields found" || echo "✅ Fields removed"
    grep -q "Telegram\|telegramAuth" front/src/components/AuthModal.tsx && \
    echo "✅ Telegram auth UI found" || echo "❌ No Telegram auth UI"
    ```

- `front/src/contexts/AuthContext.tsx` (REWRITE for Telegram)
  - **Paths:** `front/src/contexts/AuthContext.tsx` (lines 27-132)
  - **How to verify removal:**
    ```bash
    grep -q "login.*identifier.*password\|register.*email.*password\|requestRecovery\|verifyRecovery" \
    front/src/contexts/AuthContext.tsx && echo "❌ Methods found" || echo "✅ Methods removed"
    grep -q "telegramAuth\|telegram.*auth" front/src/contexts/AuthContext.tsx && \
    echo "✅ Telegram auth method found" || echo "❌ No Telegram auth method"
    ```

**Tests:**
- `back/__tests__/fp4/auth.register.test.ts` (DELETE)
- `back/__tests__/fp4/auth.login.test.ts` (DELETE)
- `back/__tests__/fp4/auth.recovery.test.ts` (DELETE)
- `front/__tests__/fp4/auth.flows.test.tsx` (DELETE if exists)
  - **Paths:** `back/__tests__/fp4/`, `front/__tests__/fp4/`
  - **How to verify removal:**
    ```bash
    test ! -f back/__tests__/fp4/auth.register.test.ts && \
    test ! -f back/__tests__/fp4/auth.login.test.ts && \
    test ! -f back/__tests__/fp4/auth.recovery.test.ts && \
    echo "✅ Tests deleted" || echo "❌ Tests still exist"
    ```

---

## 3. Старые роли (isSuperAdmin)

### P0 (Critical) - refactor immediately

**Why (FP7 clause):** FP7.md line 250-252: "Удалить `isSuperAdmin` как отдельную роль. Заменить на Guest/Participant/Organizer модель"

**Backend:**
- `isSuperAdmin` поле в User модели (REPLACE with role checks)
  - **Paths:** `back/src/users/users.repository.ts` (line 11), `back/src/auth/auth.service.ts` (lines 24-200), `back/src/auth/auth.controller.ts` (line 55), `back/src/vfs/vfs.controller.ts` (line 18), `back/src/games/games.service.ts` (lines 12-264), `back/src/games/games.controller.ts` (lines 72-828)
  - **How to verify removal:**
    ```bash
    grep -r "isSuperAdmin" back/src/ --exclude-dir=node_modules | \
    grep -v "deprecated\|//\|role.*isSuperAdmin.*Organizer" && \
    echo "❌ isSuperAdmin still used" || echo "✅ Replaced with role checks"
    grep -q "role.*===.*Organizer\|role.*!==.*Organizer" back/src/auth/auth.service.ts && \
    echo "✅ Role checks found" || echo "❌ No role checks"
    ```

**Frontend:**
- Использование `isSuperAdmin` в компонентах (REPLACE with role checks)
  - **Paths:** `front/src/contexts/AuthContext.tsx` (lines 10-114), `front/src/os/apps/UserPanelApp.tsx` (line 19), `front/src/test/mocks/mockApi.ts` (lines 228-268), `front/src/test/fixtures/user.ts` (lines 9-20)
  - **How to verify removal:**
    ```bash
    grep -r "isSuperAdmin" front/src/ --exclude-dir=legacy --exclude-dir=node_modules | \
    grep -v "deprecated\|//" && echo "❌ isSuperAdmin still used" || echo "✅ Replaced with role checks"
    grep -q "role.*===.*Organizer\|role.*!==.*Organizer" front/src/os/apps/UserPanelApp.tsx && \
    echo "✅ Role checks found" || echo "❌ No role checks"
    ```

**Guards:**
- `back/src/auth/guards/superadmin.guard.ts` (DELETE if exists, REPLACE with role-based guards)
  - **Paths:** `back/src/auth/guards/` (if exists)
  - **How to verify removal:**
    ```bash
    test ! -f back/src/auth/guards/superadmin.guard.ts && \
    echo "✅ Guard deleted" || echo "⚠️  Guard still exists (check if replaced)"
    ```

---

## 4. Dead code

### remove immediately

**Контексты:**
- `front/src/contexts/WindowContext.tsx` (если не используется)
  - **Причина:** Заменен на WindowRegistry/WindowStore
  - **Действие:** Удалить, проверить импорты

**Компоненты:**
- `front/src/components/WindowManager.tsx` (старая версия, если есть)
  - **Причина:** Заменен на `os/wm/WindowManager.tsx`
  - **Действие:** Удалить, проверить импорты

- `front/src/components/Window.tsx` (старая версия, если есть)
  - **Причина:** Заменен на `os/wm/WindowFrame.tsx`
  - **Действие:** Удалить, проверить импорты

**Импорты:**
- Все неиспользуемые импорты `react-router-dom` в компонентах
  - **Причина:** Не нужен в shell-only архитектуре
  - **Действие:** Удалить

---

## 5. Старые тесты

### remove immediately (после написания новых тестов)

**Frontend тесты для react-router:**
- `front/__tests__/fp1/`
- `front/__tests__/fp2/`
- `front/__tests__/fp4/`
- `front/__tests__/fp5/`
- `front/__tests__/fp6/`
  - **Причина:** Заменяются новыми тестами для shell-only контракта
  - **Действие:** Удалить или переместить в `front/__tests__/legacy/` для истории

**Backend тесты:**
- Тесты для endpoints, которые больше не нужны (если есть)
  - **Причина:** Заменяются новыми тестами
  - **Действие:** Удалить или переместить в `back/__tests__/legacy/`

---

## 6. Компоненты, которые можно переиспользовать

### keep as history docs only (или refactor later)

**Win95 компоненты:**
- `front/src/components/win95/HourglassLoader.tsx`
- `front/src/components/win95/Win95Button.tsx`
- `front/src/components/win95/Win95Input.tsx`
- `front/src/components/win95/Win95Textarea.tsx`
- `front/src/components/win95/Win95Modal.tsx`
  - **Причина:** Полезны для переиспользования в новой архитектуре
  - **Действие:** Оставить, использовать в новых компонентах

**Стили:**
- `front/src/retro.css`
  - **Причина:** Полезен для Windows 95 стилистики
  - **Действие:** Оставить, возможно расширить для новых компонентов

---

## 7. Backend API, который может быть полезен

### P1 (High) - verify scope first

**Why (FP7 clause):** FP7.md line 266-268: "Не входит: комментарии, рейтинги, 'соцсеть'"

**Endpoints (VERIFY if OUT of FP7 scope, DELETE if confirmed):**
- `GET /api/games` (список игр)
- `GET /api/games/:id` (детали игры)
  - **Paths:** `back/src/games/` (entire folder)
  - **How to verify removal:**
    ```bash
    # Manual review: Check if games are social feature only or used by VFS/Explorer
    # If OUT of scope:
    test ! -d back/src/games && echo "✅ Deleted" || echo "❌ Still exists"
    ```

- `GET /api/teams` (список команд)
  - **Paths:** `back/src/teams/` (entire folder)
  - **How to verify removal:**
    ```bash
    # Manual review: Check if teams are social feature only or used by VFS/Explorer
    # If OUT of scope:
    test ! -d back/src/teams && echo "✅ Deleted" || echo "❌ Still exists"
    ```

- `POST /api/comments` (создание комментария)
  - **Paths:** `back/src/comments/` (entire folder)
  - **How to verify removal:**
    ```bash
    # Manual review: Check if comments are used by VFS/Explorer or only for games
    # If OUT of scope:
    test ! -d back/src/comments && echo "✅ Deleted" || echo "❌ Still exists"
    ```

---

## 8. VFS базовая структура (если уже реализована)

### refactor later

**Файлы:**
- `front/src/os/fs/VirtualFileSystem.ts`
- `front/src/os/fs/vfs-init.ts`
  - **Причина:** Может быть полезен, но требует адаптации под новый контракт
  - **Действие:** Проверить соответствие новому контракту, адаптировать если нужно

---

## Итоговый план удаления (по приоритетам)

### P0 (Critical) - Immediate
1. ✅ Delete email/password auth DTOs (`register.dto.ts`, `login.dto.ts`, `recovery-*.dto.ts`)
2. ✅ Delete email/password auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/recovery/*`)
3. ✅ Delete email/password auth service methods (`register`, `login`, `requestRecovery`, `verifyRecovery`)
4. ✅ Delete email/password auth tests (`auth.register.test.ts`, `auth.login.test.ts`, `auth.recovery.test.ts`)
5. ✅ Replace `isSuperAdmin` with role checks (backend + frontend)
6. ✅ Rewrite `AuthModal.tsx` for Telegram auth
7. ✅ Rewrite `AuthContext.tsx` for Telegram auth
8. ✅ Add Telegram auth endpoint (`/api/auth/telegram`)

### P1 (High) - Before Release
1. ✅ Delete email service (`email.service.ts`)
2. ✅ Verify legacy pages not used (`front/src/legacy/pages.tsx`)
3. ✅ Rewrite help endpoint to read from VFS (`/Disk C/desktop/help.txt`)
4. ✅ Add `admin_help.txt` for Organizer role
5. ✅ Verify Games/Teams/Comments scope (DELETE if OUT of FP7)

### P2 (Medium) - Full Compliance
- None identified

## Execution Plan

See [docs/CUTLINE_PLAN.md](./CUTLINE_PLAN.md) for detailed commit-by-commit execution plan.

---

## Проверка перед удалением

Перед удалением каждого файла/компонента:

1. **Проверить импорты:**
   ```bash
   grep -r "import.*ComponentName" front/src/
   ```

2. **Проверить использование:**
   ```bash
   grep -r "ComponentName" front/src/
   ```

3. **Проверить тесты:**
   ```bash
   grep -r "ComponentName" front/__tests__/
   ```

4. **Проверить документацию:**
   - Упоминания в README, документации

---

**End of CUTLIST**
