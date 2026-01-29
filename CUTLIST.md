# CUTLIST: Что удалить из репозитория для FP7 v2

**Версия:** 1.0  
**Дата:** 2026-01-22  
**Связано с:** [docs/fps/FP7.md](./docs/fps/FP7.md) (FP7 v2 Contract Spec)

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

### remove immediately (после реализации Telegram auth)

**Backend:**
- `back/src/auth/dto/register.dto.ts`
  - **Причина:** Заменяется на Telegram auth
  - **Действие:** Удалить после реализации Telegram auth

- `back/src/auth/dto/login.dto.ts`
  - **Причина:** Заменяется на Telegram auth
  - **Действие:** Удалить после реализации Telegram auth

- `back/src/auth/dto/recovery-request.dto.ts`
- `back/src/auth/dto/recovery-verify.dto.ts`
  - **Причина:** Заменяется на Telegram auth
  - **Действие:** Удалить после реализации Telegram auth

- `back/src/auth/email.service.ts` (если есть)
  - **Причина:** Не нужен для Telegram auth
  - **Действие:** Удалить после реализации Telegram auth

**Frontend:**
- `front/src/components/AuthModal.tsx` (email/password версия)
  - **Причина:** Заменяется на Telegram auth
  - **Действие:** Переписать под Telegram auth или удалить и создать новый

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/recovery/request`
- `POST /api/auth/recovery/verify`
  - **Причина:** Заменяются на Telegram auth
  - **Действие:** Удалить после реализации Telegram auth

**Тесты:**
- `back/__tests__/fp4/auth.register.test.ts`
- `back/__tests__/fp4/auth.login.test.ts`
- `back/__tests__/fp4/auth.recovery.test.ts`
- `front/__tests__/fp4/auth.registration.test.tsx`
- `front/__tests__/fp4/auth.login.test.tsx`
  - **Причина:** Заменяются на Telegram auth тесты
  - **Действие:** Удалить после реализации Telegram auth тестов

---

## 3. Старые роли

### refactor later

**Backend:**
- `isSuperAdmin` поле в User модели
  - **Причина:** Заменяется на Guest/Participant/Organizer модель
  - **Действие:** Мигрировать существующих superAdmin в Organizer роль, затем удалить поле

**Frontend:**
- Использование `isSuperAdmin` в компонентах
  - **Причина:** Заменяется на Guest/Participant/Organizer модель
  - **Действие:** Заменить на проверку роли Organizer

**Guards:**
- `back/src/auth/guards/superadmin.guard.ts` (если есть)
  - **Причина:** Заменяется на роль-базированные guards
  - **Действие:** Переписать под Guest/Participant/Organizer модель

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

### refactor later

**Endpoints:**
- `GET /api/games` (список игр)
- `GET /api/games/:id` (детали игры)
- `GET /api/teams` (список команд)
- `POST /api/comments` (создание комментария)
  - **Причина:** Могут быть полезны для будущей интеграции с VFS
  - **Действие:** Оставить, но не использовать в shell-only поверхности. Возможно, интегрировать через VFS метаданные

---

## 8. VFS базовая структура (если уже реализована)

### refactor later

**Файлы:**
- `front/src/os/fs/VirtualFileSystem.ts`
- `front/src/os/fs/vfs-init.ts`
  - **Причина:** Может быть полезен, но требует адаптации под новый контракт
  - **Действие:** Проверить соответствие новому контракту, адаптировать если нужно

---

## Итоговый план удаления

### Phase 1: Immediate (M0)
1. Удалить react-router маршруты из `App.tsx`
2. Удалить CatalogPage, GamePage, TeamsPage, EditorPage
3. Удалить dead code (WindowContext, старый WindowManager)
4. Удалить старые тесты для react-router

### Phase 2: After Telegram Auth (M4)
1. Удалить email/password auth код
2. Удалить старые auth тесты

### Phase 3: After Role Migration (M4)
1. Мигрировать isSuperAdmin в Organizer
2. Удалить isSuperAdmin поле

### Phase 4: Cleanup (после M5)
1. Удалить неиспользуемые зависимости
2. Финальная проверка dead code

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
