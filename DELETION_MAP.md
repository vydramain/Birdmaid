# DELETION MAP: Аудит репозитория для FP7 shell-only зачистки

**Версия:** 1.0  
**Дата:** 2026-01-22  
**Аудитор:** @Inspector (audit)  
**Контракт:** [docs/fps/FP7.md](./docs/fps/FP7.md) (FP7 v2 Contract Spec)  
**Связанные документы:** [CUTLIST.md](./CUTLIST.md), [REWRITE_CHECKLIST.md](./REWRITE_CHECKLIST.md), [STRUCTURE.md](./STRUCTURE.md)

## Классификация

- **remove immediately**: Точно не нужно в shell-only архитектуре, удалить сразу
- **legacy**: Полезно для истории, переместить в `legacy/` директорию
- **refactor later**: Полезно, но сейчас мешает, требует рефакторинга перед использованием

---

## 1. React-router и сайт-навигация

### remove immediately

#### 1.1 React-router маршруты в App.tsx

**Файл:** `front/src/App.tsx`

**Проблема:**
- Содержит Routes/Route компоненты для маршрутов `/catalog`, `/games/:id`, `/teams`, `/editor/*`
- Противоречит shell-only контракту (FP7 v2, Product Surface Contract, строки 113-133)
- `main.tsx` уже использует `ShellRoot`, но `App.tsx` все еще используется через react-router

**Конфликт с контрактом:**
- FP7 v2, Product Surface Contract: "Вся навигация происходит через Desktop Icons и Explorer. Никаких URL-маршрутов, никаких 'страниц сайта'."
- FP7 v2, Scope OUT: "Удалить все маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*`"

**Риск удаления:**
- **Высокий**: `App.tsx` содержит много логики (1900+ строк), включая компоненты страниц
- Может сломать тесты, которые используют `renderAppRoot({ route: "/catalog" })`
- Нужно проверить, используется ли `App.tsx` где-то еще

**Как проверить что не сломали:**
```bash
# 1. Проверить импорты App.tsx
grep -r "import.*App" front/src/
grep -r "from.*App" front/src/

# 2. Проверить использование в тестах
grep -r "App" front/__tests__/

# 3. Проверить, что main.tsx использует ShellRoot (уже проверено - использует)
cat front/src/main.tsx

# 4. После удаления: проверить что приложение запускается
cd front && npm run dev
# Должен открыться ShellRoot на /
```

**Действие:**
- Удалить Routes/Route из `App.tsx` (строки 1909-1918)
- Удалить импорты `react-router-dom` (строка 2, 1902)
- Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из `App.tsx` (строки 220-1889)
- Удалить NotFound компонент (строки 1891-1897)
- Удалить WindowShell компонент (строки 73-145) - используется только в старых страницах
- Удалить CoverImageWithLoader (строки 147-218) - используется только в старых страницах
- Удалить WindowControls (строки 59-71) - используется только в WindowShell
- Удалить useLocation (строка 1902)
- **Альтернатива**: Удалить весь `App.tsx`, если он больше не используется (проверить импорты)

**Проверка после удаления:**
- [ ] Приложение запускается на `/`
- [ ] ShellRoot рендерится
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в консоли терминала

---

#### 1.2 React-router-dom зависимость

**Файл:** `front/package.json`

**Проблема:**
- Зависимость `react-router-dom: ^6.22.0` (строка 19)
- Не нужна в shell-only архитектуре

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить все маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*`"
- Если нет маршрутов, нет нужды в react-router-dom

**Риск удаления:**
- **Средний**: Нужно проверить, используется ли где-то еще (например, в тестах через MemoryRouter)

**Как проверить что не сломали:**
```bash
# 1. Проверить все импорты react-router-dom
grep -r "react-router" front/src/
grep -r "react-router" front/__tests__/

# 2. После удаления: проверить что сборка работает
cd front && npm run build
```

**Действие:**
- Удалить `react-router-dom` из `package.json` после удаления всех импортов
- Запустить `npm install` для обновления lockfile

**Проверка после удаления:**
- [ ] `npm run build` проходит успешно
- [ ] Нет ошибок импорта react-router-dom

---

#### 1.3 MemoryRouter в тестах

**Файлы:**
- `front/src/test/utils/render.tsx` (строка 3)
- `front/__tests__/fp6/desktop.workspace.test.tsx` (строка 2)
- `front/__tests__/fp6/explorer.tree.test.tsx` (строка 2)
- `front/__tests__/fp6/mobile.mode.test.tsx` (строка 2)
- `front/__tests__/fp6/window.manager.test.tsx` (строка 2)
- `front/__tests__/fp6/help.txt.test.tsx` (строка 2)
- `front/__tests__/fp6/window.drag.test.tsx` (строка 2)

**Проблема:**
- Используется MemoryRouter для тестов
- В shell-only архитектуре не нужен (ShellRoot не использует react-router)

**Конфликт с контрактом:**
- FP7 v2, Tests Contract: "Удалить все тесты для react-router маршрутов"

**Риск удаления:**
- **Низкий**: Это только тесты, можно переписать под ShellRoot

**Действие:**
- Удалить импорты MemoryRouter из тестов
- Переписать тесты под ShellRoot (без react-router)

**Проверка после удаления:**
- [ ] Тесты запускаются без ошибок
- [ ] Тесты проверяют ShellRoot, а не маршруты

---

## 2. Сайт-страницы (компоненты)

### remove immediately

#### 2.1 CatalogPage

**Файл:** `front/src/App.tsx` (строки 220-488)

**Проблема:**
- Компонент CatalogPage - "сайт-страница" для каталога игр
- Противоречит shell-only контракту

**Конфликт с контрактом:**
- FP7 v2, Product Surface Contract: "Запрещено: React-router маршруты типа `/catalog`, `/games/:id`"
- FP7 v2, Scope OUT: "Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности"

**Риск удаления:**
- **Средний**: Используется только в App.tsx через Route

**Действие:**
- Удалить компонент CatalogPage из App.tsx
- Удалить Route для `/catalog`

**Проверка после удаления:**
- [ ] Нет импортов CatalogPage
- [ ] Нет маршрута `/catalog`

---

#### 2.2 GamePage

**Файл:** `front/src/App.tsx` (строки 490-732)

**Проблема:**
- Компонент GamePage - "сайт-страница" для деталей игры
- Противоречит shell-only контракту

**Конфликт с контрактом:**
- FP7 v2, Product Surface Contract: "Запрещено: React-router маршруты типа `/catalog`, `/games/:id`"
- FP7 v2, Scope OUT: "Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности"

**Риск удаления:**
- **Средний**: Используется только в App.tsx через Route

**Действие:**
- Удалить компонент GamePage из App.tsx
- Удалить Route для `/games/:gameId`

**Проверка после удаления:**
- [ ] Нет импортов GamePage
- [ ] Нет маршрута `/games/:id`

---

#### 2.3 TeamsPage

**Файл:** `front/src/App.tsx` (строки 734-1121)

**Проблема:**
- Компонент TeamsPage - "сайт-страница" для команд
- Противоречит shell-only контракту

**Конфликт с контрактом:**
- FP7 v2, Product Surface Contract: "Запрещено: React-router маршруты типа `/catalog`, `/games/:id`"
- FP7 v2, Scope OUT: "Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности"

**Риск удаления:**
- **Средний**: Используется только в App.tsx через Route

**Действие:**
- Удалить компонент TeamsPage из App.tsx
- Удалить Route для `/teams`

**Проверка после удаления:**
- [ ] Нет импортов TeamsPage
- [ ] Нет маршрута `/teams`

---

#### 2.4 EditorPage

**Файл:** `front/src/App.tsx` (строки 1123-1889)

**Проблема:**
- Компонент EditorPage - "сайт-страница" для редактирования игр
- Противоречит shell-only контракту

**Конфликт с контрактом:**
- FP7 v2, Product Surface Contract: "Запрещено: React-router маршруты типа `/editor/*`"
- FP7 v2, Scope OUT: "Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности"

**Риск удаления:**
- **Высокий**: EditorPage содержит много логики (редактирование игр, загрузка файлов, теги)
- Может быть полезен для будущей интеграции через VFS/Explorer

**Действие:**
- Удалить компонент EditorPage из App.tsx
- Удалить Route для `/editor/games/new` и `/editor/games/:gameId`
- **Альтернатива**: Переместить в `front/src/legacy/EditorPage.tsx` для истории

**Проверка после удаления:**
- [ ] Нет импортов EditorPage
- [ ] Нет маршрутов `/editor/*`

---

## 3. Email/password auth

### remove immediately (после реализации Telegram auth)

#### 3.1 Backend: DTO для email/password auth

**Файлы:**
- `back/src/auth/dto/register.dto.ts`
- `back/src/auth/dto/login.dto.ts`
- `back/src/auth/dto/recovery-request.dto.ts`
- `back/src/auth/dto/recovery-verify.dto.ts`

**Проблема:**
- DTO для email/password регистрации, входа и восстановления пароля
- Заменяется на Telegram auth

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить регистрацию через email/password", "Удалить recovery flow через email"
- FP7 v2, API Contracts: "Telegram auth как основной способ входа (production)"

**Риск удаления:**
- **Высокий**: Используется в auth.controller.ts и auth.service.ts
- Нужно сначала реализовать Telegram auth

**Действие:**
- Удалить после реализации Telegram auth
- Удалить импорты из `auth.controller.ts` и `auth.service.ts`

**Проверка после удаления:**
- [ ] Telegram auth работает
- [ ] Нет импортов RegisterDto, LoginDto, RecoveryRequestDto, RecoveryVerifyDto

---

#### 3.2 Backend: EmailService

**Файл:** `back/src/auth/email.service.ts`

**Проблема:**
- Сервис для отправки email (recovery codes)
- Не нужен для Telegram auth

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить recovery flow через email"

**Риск удаления:**
- **Средний**: Используется только в auth.service.ts для recovery

**Действие:**
- Удалить после реализации Telegram auth
- Удалить из providers в `auth.module.ts`

**Проверка после удаления:**
- [ ] Нет импортов EmailService
- [ ] auth.module.ts не содержит EmailService в providers

---

#### 3.3 Backend: Auth endpoints

**Файл:** `back/src/auth/auth.controller.ts`

**Проблема:**
- Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/recovery/request`, `POST /api/auth/recovery/verify`
- Заменяются на Telegram auth

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить регистрацию через email/password", "Удалить recovery flow через email"
- FP7 v2, API Contracts: "Telegram auth как основной способ входа (production)"

**Риск удаления:**
- **Высокий**: Используются в frontend (AuthModal)
- Нужно сначала реализовать Telegram auth

**Действие:**
- Удалить методы register, login, requestRecovery, verifyRecovery из auth.controller.ts
- Удалить после реализации Telegram auth

**Проверка после удаления:**
- [ ] Telegram auth endpoint работает
- [ ] Нет старых endpoints в API

---

#### 3.4 Backend: Auth service методы

**Файл:** `back/src/auth/auth.service.ts`

**Проблема:**
- Методы: register, login, requestRecovery, verifyRecovery, hashPassword, verifyPassword
- Заменяются на Telegram auth

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить регистрацию через email/password", "Удалить recovery flow через email"

**Риск удаления:**
- **Высокий**: Используются в auth.controller.ts
- Нужно сначала реализовать Telegram auth

**Действие:**
- Удалить методы после реализации Telegram auth
- Оставить generateToken (используется для Telegram auth тоже)

**Проверка после удаления:**
- [ ] Telegram auth работает
- [ ] Нет вызовов старых методов

---

#### 3.5 Frontend: AuthModal (email/password версия)

**Файл:** `front/src/components/AuthModal.tsx`

**Проблема:**
- Модальное окно для email/password авторизации
- Заменяется на Telegram auth

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить регистрацию через email/password"
- FP7 v2, UX Rules: "Авторизация через Telegram auth как основной способ входа"

**Риск удаления:**
- **Средний**: Используется в App.tsx (старые страницы)
- После удаления App.tsx страниц, можно переписать под Telegram

**Действие:**
- Переписать AuthModal под Telegram auth или удалить и создать новый
- Удалить email/password поля

**Проверка после удаления:**
- [ ] Telegram auth работает в UI
- [ ] Нет email/password полей

---

#### 3.6 Тесты для email/password auth

**Файлы:**
- `back/__tests__/fp4/auth.register.test.ts`
- `back/__tests__/fp4/auth.login.test.ts`
- `back/__tests__/fp4/auth.recovery.test.ts`
- `front/__tests__/fp4/auth.registration.test.tsx`
- `front/__tests__/fp4/auth.login.test.tsx`
- `front/__tests__/fp4/auth.recovery.test.tsx`

**Проблема:**
- Тесты для email/password auth
- Заменяются на Telegram auth тесты

**Конфликт с контрактом:**
- FP7 v2, Tests Contract: "Удалить все тесты для email/password auth (заменить на Telegram auth тесты)"

**Риск удаления:**
- **Низкий**: Это только тесты

**Действие:**
- Удалить после написания Telegram auth тестов
- Переместить в `back/__tests__/legacy/` и `front/__tests__/legacy/` для истории

**Проверка после удаления:**
- [ ] Telegram auth тесты написаны
- [ ] Старые тесты удалены или перемещены в legacy

---

## 4. Старые роли (isSuperAdmin)

### refactor later

#### 4.1 Backend: isSuperAdmin поле в User модели

**Файлы:**
- `back/src/users/users.repository.ts` (строка 9)
- Все места, где используется `isSuperAdmin` в backend

**Проблема:**
- Поле `isSuperAdmin` как отдельная роль
- Заменяется на Guest/Participant/Organizer модель

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить `isSuperAdmin` как отдельную роль"
- FP7 v2, Roles & Permissions: "Guest/Participant/Organizer модель"

**Риск удаления:**
- **Высокий**: Используется во многих местах (games.service.ts, games.controller.ts, auth.service.ts)
- Нужно сначала мигрировать существующих superAdmin в Organizer роль

**Действие:**
1. Мигрировать существующих superAdmin в Organizer роль (через БД)
2. Заменить проверки `isSuperAdmin` на проверки роли `Organizer`
3. Удалить поле `isSuperAdmin` из User модели

**Проверка после удаления:**
- [ ] Все superAdmin мигрированы в Organizer
- [ ] Проверки ролей используют Guest/Participant/Organizer
- [ ] Нет использования `isSuperAdmin`

---

#### 4.2 Frontend: isSuperAdmin использование

**Файлы:**
- `front/src/App.tsx` (множественные использования)
- `front/src/contexts/AuthContext.tsx` (строка 8, 40, 97)
- `front/src/test/fixtures/user.ts` (строка 9, 20)
- `front/src/test/mocks/mockApi.ts` (строки 228, 242, 268)
- Все тесты, которые используют `isSuperAdmin`

**Проблема:**
- Использование `isSuperAdmin` в frontend
- Заменяется на Guest/Participant/Organizer модель

**Конфликт с контрактом:**
- FP7 v2, Scope OUT: "Удалить `isSuperAdmin` как отдельную роль"
- FP7 v2, Roles & Permissions: "Guest/Participant/Organizer модель"

**Риск удаления:**
- **Средний**: Используется в UI для показа/скрытия элементов
- После удаления App.tsx страниц, можно заменить на проверки роли

**Действие:**
1. Заменить `auth.user?.isSuperAdmin` на `auth.user?.role === 'Organizer'`
2. Обновить AuthContext для работы с ролью вместо isSuperAdmin
3. Обновить тесты

**Проверка после удаления:**
- [ ] UI использует роль вместо isSuperAdmin
- [ ] Нет использования `isSuperAdmin` в frontend

---

## 5. Dead code

### remove immediately

#### 5.1 WindowContext (старый)

**Файл:** `front/src/contexts/WindowContext.tsx`

**Проблема:**
- Старый контекст для управления окнами
- Заменен на WindowRegistry + WindowStore

**Конфликт с контрактом:**
- FP7 v2, Architecture: "WindowRegistry + WindowStore" (не WindowContext)
- CUTLIST.md: "Удалить WindowContext.tsx (если не используется)"

**Риск удаления:**
- **Средний**: Используется в старых компонентах Window.tsx и WindowManager.tsx из components/
- Новый код использует WindowRegistry

**Как проверить что не сломали:**
```bash
# 1. Проверить использование WindowContext
grep -r "WindowContext\|useWindow\|WindowProvider" front/src/

# 2. Проверить, что новый код использует WindowRegistry
grep -r "WindowRegistry\|useWindowRegistry" front/src/
```

**Действие:**
- Удалить после удаления старых компонентов Window.tsx и WindowManager.tsx
- Проверить, что нет импортов

**Проверка после удаления:**
- [ ] Нет импортов WindowContext
- [ ] Новый код использует WindowRegistry

---

#### 5.2 WindowManager (старый из components/)

**Файл:** `front/src/components/WindowManager.tsx`

**Проблема:**
- Старый WindowManager из components/
- Заменен на `os/wm/WindowManager.tsx`

**Конфликт с контрактом:**
- FP7 v2, Architecture: "WindowManager (`os/wm/WindowManager.tsx`)"
- CUTLIST.md: "Удалить старый WindowManager.tsx (если заменен на os/wm/WindowManager.tsx)"

**Риск удаления:**
- **Низкий**: Используется только в старых компонентах через WindowContext
- Новый код использует `os/wm/WindowManager.tsx`

**Как проверить что не сломали:**
```bash
# 1. Проверить использование старого WindowManager
grep -r "from.*components/WindowManager\|import.*WindowManager.*components" front/src/

# 2. Проверить, что новый код использует os/wm/WindowManager
grep -r "from.*os/wm/WindowManager\|import.*WindowManager.*os/wm" front/src/
```

**Действие:**
- Удалить после удаления WindowContext
- Проверить, что нет импортов

**Проверка после удаления:**
- [ ] Нет импортов из components/WindowManager
- [ ] Новый код использует os/wm/WindowManager

---

#### 5.3 Window (старый из components/)

**Файл:** `front/src/components/Window.tsx`

**Проблема:**
- Старый компонент Window из components/
- Заменен на `os/wm/WindowFrame.tsx`

**Конфликт с контрактом:**
- FP7 v2, Architecture: "WindowFrame (`os/wm/WindowFrame.tsx`)"
- CUTLIST.md: "Удалить старый Window.tsx (если заменен на os/wm/WindowFrame.tsx)"

**Риск удаления:**
- **Низкий**: Используется только в старом WindowManager через WindowContext
- Новый код использует `os/wm/WindowFrame.tsx`

**Как проверить что не сломали:**
```bash
# 1. Проверить использование старого Window
grep -r "from.*components/Window\|import.*Window.*components" front/src/

# 2. Проверить, что новый код использует WindowFrame
grep -r "from.*os/wm/WindowFrame\|import.*WindowFrame" front/src/
```

**Действие:**
- Удалить после удаления WindowManager и WindowContext
- Проверить, что нет импортов

**Проверка после удаления:**
- [ ] Нет импортов из components/Window
- [ ] Новый код использует os/wm/WindowFrame

---

#### 5.4 WindowPositionContext

**Файл:** `front/src/contexts/WindowPositionContext.tsx`

**Проблема:**
- Контекст для позиции окна
- Используется только в App.tsx (WindowShell)
- В новой архитектуре позиция управляется через WindowStore

**Конфликт с контрактом:**
- FP7 v2, Architecture: "WindowStore управляет геометрией окон (x, y, width, height)"

**Риск удаления:**
- **Низкий**: Используется только в App.tsx (WindowShell)
- После удаления App.tsx страниц, можно удалить

**Действие:**
- Удалить после удаления App.tsx страниц
- Проверить, что нет импортов

**Проверка после удаления:**
- [ ] Нет импортов WindowPositionContext
- [ ] Позиция окон управляется через WindowStore

---

## 6. Старые тесты

### Классификация тестов

#### 6.1 Frontend тесты для react-router маршрутов

**Директории:**
- `front/__tests__/fp1/` (5 файлов)
- `front/__tests__/fp2/` (10 файлов)
- `front/__tests__/fp4/` (12 файлов)
- `front/__tests__/fp5/` (14 файлов)
- `front/__tests__/fp6/` (8 файлов)

**Проблема:**
- Тесты для react-router маршрутов (`/catalog`, `/games/:id`, `/teams`, `/editor/*`)
- Заменяются новыми тестами для shell-only контракта

**Конфликт с контрактом:**
- FP7 v2, Tests Contract: "Удалить все тесты для react-router маршрутов"
- FP7 v2, Tests Contract: "Обязательные тесты (10-20 smoke/contract tests)" для shell-only

**Классификация:**

**Удалить (remove immediately):**
- `front/__tests__/fp1/catalog.states.test.tsx` - тест для /catalog
- `front/__tests__/fp4/catalog.visibility.test.tsx` - тест для /catalog
- `front/__tests__/fp5/catalog.*.test.tsx` - все тесты для /catalog (3 файла)
- `front/__tests__/fp4/game.*.test.tsx` - тесты для /games/:id (4 файла)
- `front/__tests__/fp4/teams.*.test.tsx` - тесты для /teams (2 файла)
- `front/__tests__/fp5/teams.*.test.tsx` - все тесты для /teams (5 файлов)
- `front/__tests__/fp4/game.editor.test.tsx` - тест для /editor/*
- `front/__tests__/fp5/editor.*.test.tsx` - все тесты для /editor/* (2 файла)
- `front/__tests__/fp1/admin.*.test.tsx` - тесты для admin функций через /editor/* (3 файла)
- `front/__tests__/fp2/admin.*.test.tsx` - тесты для admin функций через /editor/* (8 файлов)
- `front/__tests__/fp4/auth.*.test.tsx` - тесты для email/password auth (4 файла)

**Legacy (переместить в legacy/):**
- Все тесты из fp1/, fp2/, fp4/, fp5/ можно переместить в `front/__tests__/legacy/` для истории

**Переписать (refactor later):**
- `front/__tests__/fp6/*.test.tsx` - тесты для shell-only, но используют MemoryRouter
  - Нужно переписать без MemoryRouter, используя ShellRoot напрямую

**Риск удаления:**
- **Низкий**: Это только тесты
- Новые тесты будут написаны для shell-only контракта

**Действие:**
1. Переместить все тесты из fp1/, fp2/, fp4/, fp5/ в `front/__tests__/legacy/`
2. Переписать тесты из fp6/ без MemoryRouter
3. Написать новые тесты для shell-only контракта (см. FP7 v2, Tests Contract)

**Проверка после удаления:**
- [ ] Старые тесты перемещены в legacy/
- [ ] Новые тесты написаны для shell-only
- [ ] Тесты запускаются без ошибок

---

#### 6.2 Backend тесты

**Директории:**
- `back/__tests__/fp1/` (7 файлов)
- `back/__tests__/fp2/` (12 файлов)
- `back/__tests__/fp4/` (13 файлов)
- `back/__tests__/fp5/` (4 файла)
- `back/__tests__/fp6/` (2 файла)

**Проблема:**
- Тесты для endpoints, которые могут быть не нужны в shell-only архитектуре
- Некоторые endpoints могут быть полезны для будущей интеграции

**Классификация:**

**Удалить (remove immediately):**
- `back/__tests__/fp4/auth.register.test.ts` - тест для email/password регистрации
- `back/__tests__/fp4/auth.login.test.ts` - тест для email/password входа
- `back/__tests__/fp4/auth.recovery.test.ts` - тест для email/password recovery
- `back/__tests__/fp4/games.status-superadmin.test.ts` - тест для isSuperAdmin (после миграции на роли)

**Legacy (переместить в legacy/):**
- Остальные тесты можно оставить или переместить в `back/__tests__/legacy/` для истории

**Переписать (refactor later):**
- Тесты для isSuperAdmin нужно переписать под Guest/Participant/Organizer модель

**Риск удаления:**
- **Низкий**: Это только тесты

**Действие:**
1. Удалить тесты для email/password auth
2. Переместить остальные тесты в legacy/ (опционально)
3. Переписать тесты для isSuperAdmin под роли

**Проверка после удаления:**
- [ ] Тесты для email/password auth удалены
- [ ] Тесты для ролей переписаны

---

## 7. Компоненты, которые можно переиспользовать

### keep as history docs only (или refactor later)

#### 7.1 Win95 компоненты

**Файлы:**
- `front/src/components/win95/HourglassLoader.tsx`
- `front/src/components/win95/Win95Button.tsx`
- `front/src/components/win95/Win95Input.tsx`
- `front/src/components/win95/Win95Textarea.tsx`
- `front/src/components/win95/Win95Modal.tsx`

**Проблема:**
- Полезны для переиспользования в новой архитектуре
- Используются в старых страницах (App.tsx)

**Конфликт с контрактом:**
- Нет конфликта - можно использовать в новой архитектуре

**Действие:**
- Оставить, использовать в новых компонентах
- Удалить импорты из App.tsx после удаления страниц

**Проверка после удаления:**
- [ ] Win95 компоненты используются в новой архитектуре
- [ ] Нет импортов из удаленных страниц

---

#### 7.2 Стили

**Файл:** `front/src/retro.css`

**Проблема:**
- Полезен для Windows 95 стилистики
- Используется в новой архитектуре

**Конфликт с контрактом:**
- Нет конфликта - нужен для Windows 95 стилистики

**Действие:**
- Оставить, возможно расширить для новых компонентов

**Проверка после удаления:**
- [ ] retro.css используется в новой архитектуре

---

## 8. Backend API, который может быть полезен

### refactor later

#### 8.1 Endpoints для games, teams, comments

**Файлы:**
- `back/src/games/games.controller.ts`
- `back/src/teams/teams.controller.ts`
- `back/src/comments/comments.controller.ts`

**Проблема:**
- Endpoints могут быть полезны для будущей интеграции с VFS
- Не используются в shell-only поверхности напрямую

**Конфликт с контрактом:**
- Нет прямого конфликта - можно оставить для будущей интеграции
- FP7 v2, CUTLIST.md: "Backend API, который может быть полезен: refactor later"

**Действие:**
- Оставить, но не использовать в shell-only поверхности
- Возможно, интегрировать через VFS метаданные в будущем

**Проверка после удаления:**
- [ ] Endpoints работают (если нужны для будущей интеграции)

---

## Итоговый план удаления (поэтапно)

### Phase 1: Immediate (M0) - React-router и сайт-страницы

**Цель:** Удалить react-router маршруты и сайт-страницы из продуктовой поверхности.

**Шаги:**

1. **Удалить Routes/Route из App.tsx**
   ```bash
   # Проверить использование App.tsx
   grep -r "import.*App\|from.*App" front/src/
   
   # Если App.tsx не используется, можно удалить полностью
   # Иначе удалить только Routes/Route и компоненты страниц
   ```

2. **Удалить компоненты страниц из App.tsx**
   - CatalogPage (строки 220-488)
   - GamePage (строки 490-732)
   - TeamsPage (строки 734-1121)
   - EditorPage (строки 1123-1889)
   - NotFound (строки 1891-1897)
   - WindowShell (строки 73-145)
   - CoverImageWithLoader (строки 147-218)
   - WindowControls (строки 59-71)

3. **Удалить импорты react-router-dom из App.tsx**
   - Удалить строку 2: `import { Link, Route, Routes, useParams, useNavigate } from "react-router-dom";`
   - Удалить строку 1902: `import { useLocation } from "react-router-dom";`

4. **Проверка:**
   - [ ] Приложение запускается на `/`
   - [ ] ShellRoot рендерится
   - [ ] Нет ошибок в консоли

---

### Phase 2: Dead code - WindowContext и старые компоненты

**Цель:** Удалить старые компоненты WindowContext, WindowManager, Window.

**Шаги:**

1. **Удалить старый WindowManager из components/**
   ```bash
   # Проверить использование
   grep -r "from.*components/WindowManager" front/src/
   
   # Удалить файл
   rm front/src/components/WindowManager.tsx
   ```

2. **Удалить старый Window из components/**
   ```bash
   # Проверить использование
   grep -r "from.*components/Window" front/src/
   
   # Удалить файл
   rm front/src/components/Window.tsx
   ```

3. **Удалить WindowContext**
   ```bash
   # Проверить использование
   grep -r "WindowContext\|useWindow\|WindowProvider" front/src/
   
   # Удалить файл
   rm front/src/contexts/WindowContext.tsx
   ```

4. **Удалить WindowPositionContext (после удаления App.tsx страниц)**
   ```bash
   # Проверить использование
   grep -r "WindowPositionContext\|useWindowPosition" front/src/
   
   # Удалить файл
   rm front/src/contexts/WindowPositionContext.tsx
   ```

5. **Проверка:**
   - [ ] Нет импортов старых компонентов
   - [ ] Новый код использует WindowRegistry/WindowStore/WindowFrame

---

### Phase 3: Тесты - перемещение в legacy

**Цель:** Переместить старые тесты в legacy/ для истории.

**Шаги:**

1. **Создать директорию legacy/**
   ```bash
   mkdir -p front/__tests__/legacy
   mkdir -p back/__tests__/legacy
   ```

2. **Переместить frontend тесты**
   ```bash
   # Переместить fp1, fp2, fp4, fp5
   mv front/__tests__/fp1 front/__tests__/legacy/
   mv front/__tests__/fp2 front/__tests__/legacy/
   mv front/__tests__/fp4 front/__tests__/legacy/
   mv front/__tests__/fp5 front/__tests__/legacy/
   
   # Переписать fp6 тесты без MemoryRouter (позже)
   ```

3. **Переместить backend тесты (опционально)**
   ```bash
   # Переместить тесты для email/password auth
   mv back/__tests__/fp4/auth.register.test.ts back/__tests__/legacy/
   mv back/__tests__/fp4/auth.login.test.ts back/__tests__/legacy/
   mv back/__tests__/fp4/auth.recovery.test.ts back/__tests__/legacy/
   ```

4. **Проверка:**
   - [ ] Старые тесты перемещены в legacy/
   - [ ] Новые тесты для shell-only написаны

---

### Phase 4: React-router-dom зависимость

**Цель:** Удалить react-router-dom из package.json.

**Шаги:**

1. **Проверить все импорты react-router-dom**
   ```bash
   grep -r "react-router" front/src/
   grep -r "react-router" front/__tests__/
   ```

2. **Удалить из package.json**
   ```bash
   # Удалить строку "react-router-dom": "^6.22.0" из front/package.json
   ```

3. **Обновить lockfile**
   ```bash
   cd front && npm install
   ```

4. **Проверка:**
   - [ ] Нет импортов react-router-dom
   - [ ] `npm run build` проходит успешно

---

### Phase 5: Email/password auth (после реализации Telegram auth)

**Цель:** Удалить email/password auth код после реализации Telegram auth.

**Шаги:**

1. **Удалить DTO**
   ```bash
   rm back/src/auth/dto/register.dto.ts
   rm back/src/auth/dto/login.dto.ts
   rm back/src/auth/dto/recovery-request.dto.ts
   rm back/src/auth/dto/recovery-verify.dto.ts
   ```

2. **Удалить EmailService**
   ```bash
   rm back/src/auth/email.service.ts
   # Удалить из providers в auth.module.ts
   ```

3. **Удалить методы из auth.controller.ts и auth.service.ts**
   - Удалить register, login, requestRecovery, verifyRecovery
   - Удалить hashPassword, verifyPassword (если не используются)

4. **Переписать AuthModal под Telegram auth**

5. **Проверка:**
   - [ ] Telegram auth работает
   - [ ] Нет старых endpoints
   - [ ] Нет импортов старых DTO

---

### Phase 6: isSuperAdmin → роли (после миграции)

**Цель:** Мигрировать isSuperAdmin на Guest/Participant/Organizer модель.

**Шаги:**

1. **Мигрировать существующих superAdmin в Organizer роль (через БД)**
   ```bash
   # Выполнить миграцию в БД
   # db.users.updateMany({ isSuperAdmin: true }, { $set: { role: "Organizer" } })
   ```

2. **Заменить проверки isSuperAdmin на проверки роли**
   - В backend: заменить `isSuperAdmin` на `role === 'Organizer'`
   - В frontend: заменить `auth.user?.isSuperAdmin` на `auth.user?.role === 'Organizer'`

3. **Удалить поле isSuperAdmin из User модели**

4. **Проверка:**
   - [ ] Все superAdmin мигрированы в Organizer
   - [ ] Проверки ролей используют Guest/Participant/Organizer
   - [ ] Нет использования isSuperAdmin

---

## Мини-чеклист "repo still boots" после каждого шага

### После Phase 1 (React-router удаление)

- [ ] `cd front && npm run dev` - приложение запускается
- [ ] Открыть `http://localhost:5173/` - ShellRoot рендерится
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в консоли терминала
- [ ] `cd front && npm run build` - сборка проходит успешно

### После Phase 2 (Dead code удаление)

- [ ] `cd front && npm run dev` - приложение запускается
- [ ] Desktop Icons работают
- [ ] Explorer открывается
- [ ] Окна открываются/закрываются
- [ ] Нет ошибок в консоли

### После Phase 3 (Тесты перемещение)

- [ ] `cd front && npm test` - тесты запускаются
- [ ] Новые тесты для shell-only написаны
- [ ] Старые тесты перемещены в legacy/

### После Phase 4 (React-router-dom удаление)

- [ ] `cd front && npm run build` - сборка проходит успешно
- [ ] Нет ошибок импорта react-router-dom
- [ ] `cd front && npm run dev` - приложение запускается

### После Phase 5 (Email/password auth удаление)

- [ ] `cd back && npm run test` - тесты проходят
- [ ] Telegram auth работает
- [ ] Нет старых endpoints в API
- [ ] `cd front && npm run dev` - приложение запускается

### После Phase 6 (isSuperAdmin миграция)

- [ ] `cd back && npm run test` - тесты проходят
- [ ] Проверки ролей работают
- [ ] Нет использования isSuperAdmin
- [ ] `cd front && npm run dev` - приложение запускается

---

## Команды для безопасного удаления

### Шаг 1: Создать backup ветку

```bash
git checkout -b backup/pre-fp7-cleanup
git push origin backup/pre-fp7-cleanup
git checkout main
```

### Шаг 2: Удалить react-router маршруты (Phase 1)

```bash
# 1. Проверить использование App.tsx
cd front/src
grep -r "import.*App\|from.*App" .

# 2. Если App.tsx не используется, удалить полностью
# Иначе отредактировать App.tsx вручную, удалив Routes/Route и компоненты страниц

# 3. Проверить что приложение запускается
cd ../..
npm run dev
```

### Шаг 3: Удалить dead code (Phase 2)

```bash
# 1. Удалить старые компоненты
rm front/src/components/WindowManager.tsx
rm front/src/components/Window.tsx
rm front/src/contexts/WindowContext.tsx

# 2. Проверить что нет импортов
grep -r "WindowContext\|components/WindowManager\|components/Window" front/src/

# 3. Проверить что приложение запускается
cd front && npm run dev
```

### Шаг 4: Переместить тесты (Phase 3)

```bash
# 1. Создать директорию legacy
mkdir -p front/__tests__/legacy
mkdir -p back/__tests__/legacy

# 2. Переместить тесты
mv front/__tests__/fp1 front/__tests__/legacy/
mv front/__tests__/fp2 front/__tests__/legacy/
mv front/__tests__/fp4 front/__tests__/legacy/
mv front/__tests__/fp5 front/__tests__/legacy/

# 3. Проверить что тесты запускаются
cd front && npm test
```

### Шаг 5: Удалить react-router-dom (Phase 4)

```bash
# 1. Проверить все импорты
grep -r "react-router" front/src/
grep -r "react-router" front/__tests__/

# 2. Удалить из package.json (вручную)
# Удалить строку "react-router-dom": "^6.22.0"

# 3. Обновить lockfile
cd front && npm install

# 4. Проверить сборку
npm run build
```

---

## Риски и митигации

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Удаление App.tsx сломает что-то работающее | Средняя | Высокое | Проверить все импорты перед удалением, создать backup ветку |
| Удаление тестов скроет регрессии | Средняя | Среднее | Сохранить тесты в legacy/, написать новые тесты для shell-only |
| Удаление email/password auth сломает авторизацию | Высокая | Высокое | Реализовать Telegram auth перед удалением |
| Миграция isSuperAdmin сломает права доступа | Средняя | Высокое | Мигрировать через БД, протестировать права доступа |
| Удаление WindowContext сломает окна | Низкая | Среднее | Проверить что новый код использует WindowRegistry |

---

## Ссылки на контракт

- **FP7 v2, Product Surface Contract (строки 113-133)**: Shell-only навигация
- **FP7 v2, Scope OUT (строки 59-88)**: Что удалить
- **FP7 v2, Tests Contract (строки 626-727)**: Какие тесты нужны
- **FP7 v2, Architecture (строки 367-485)**: Новая архитектура
- **FP7 v2, Cutline / Migration Notes (строки 878-926)**: Что считается dead/legacy

---

**End of DELETION MAP**
