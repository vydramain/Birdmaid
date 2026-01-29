# Rewrite Checklist: Порядок переписывания для FP7 v2

**Версия:** 1.0  
**Дата:** 2026-01-22  
**Связано с:** [docs/fps/FP7.md](./docs/fps/FP7.md) (FP7 v2 Contract Spec)

## Общие принципы

1. **Не утонуть:** Работать по milestones, не пытаться сделать всё сразу
2. **Тесты первыми:** Писать тесты перед реализацией (tests-red → implement → tests-green)
3. **Контракт соблюдать:** Каждое изменение должно соответствовать FP7 v2 контракту
4. **Dead code удалять:** Удалять старый код сразу после замены на новый

---

## Phase 1: Cleanup (M0) — Зачистка

**Цель:** Удалить старый код, не соответствующий shell-only контракту.

### 1.1 Удалить react-router из App.tsx
- [ ] Проверить, что `main.tsx` использует `ShellRoot` (не `App.tsx`)
- [ ] Удалить Routes/Route из `App.tsx` (если используется)
- [ ] Удалить импорты `react-router-dom` из `App.tsx`
- [ ] Проверить, что приложение запускается на `/`

### 1.2 Удалить сайт-страницы
- [ ] Найти все использования CatalogPage, GamePage, TeamsPage, EditorPage
- [ ] Удалить компоненты или переместить в `front/src/legacy/`
- [ ] Удалить импорты этих компонентов
- [ ] Проверить, что приложение не ломается

### 1.3 Удалить старые тесты для react-router
- [ ] Найти все тесты, тестирующие react-router маршруты
- [ ] Удалить тесты или переместить в `front/__tests__/legacy/`
- [ ] Проверить, что тесты не падают из-за отсутствующих компонентов

### 1.4 Удалить dead code
- [ ] Проверить использование `WindowContext.tsx`
- [ ] Удалить `WindowContext.tsx` (если не используется)
- [ ] Проверить использование старого `WindowManager.tsx`
- [ ] Удалить старый `WindowManager.tsx` (если заменен на `os/wm/WindowManager.tsx`)
- [ ] Проверить импорты, удалить неиспользуемые

### 1.5 Проверка
- [ ] Приложение запускается
- [ ] Нет ошибок в консоли
- [ ] Старые тесты удалены или перемещены

**DoD:** `App.tsx` не использует react-router, старые "сайт-страницы" удалены, dead code удален.

---

## Phase 2: Shell Kernel (M1) — Базовый Shell

**Цель:** Базовый Shell с Platform Context и Desktop/Mobile разделением.

### 2.1 ShellRoot с Platform Context
- [ ] Проверить существующий `ShellRoot.tsx`
- [ ] Убедиться, что Platform Context определяется правильно
- [ ] Убедиться, что режим фиксируется на сессию
- [ ] Написать тест: `shell.boot.desktop.test.tsx`
- [ ] Написать тест: `shell.boot.mobile.test.tsx`
- [ ] Написать тест: `shell.platform-context.test.tsx`

### 2.2 DesktopShell базовая реализация
- [ ] Проверить существующий `DesktopPage.tsx`
- [ ] Реализовать базовый Desktop (Wallpaper, Desktop Icons stub, WindowManager stub)
- [ ] Убедиться, что DesktopShell рендерится на Desktop платформе
- [ ] Проверить визуально

### 2.3 MobileShell stub
- [ ] Проверить существующий `MobilePage.tsx`
- [ ] Реализовать базовый Mobile stub (WM6 стилистика placeholder)
- [ ] Убедиться, что MobileShell рендерится на Mobile платформе
- [ ] Проверить визуально

### 2.4 Тесты
- [ ] Запустить тесты: `shell.boot.*.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** ShellRoot работает на `/`, Platform Context определяется правильно, DesktopShell и MobileShell рендерятся, тесты зеленые.

---

## Phase 3: VFS + Explorer (M2) — Файловая система

**Цель:** Виртуальная файловая система и Explorer для навигации.

### 3.1 VirtualFileSystem
- [ ] Проверить существующий `VirtualFileSystem.ts`
- [ ] Адаптировать под новый контракт (in-memory, event-driven)
- [ ] Реализовать методы: `readFile`, `readDir`, `stat`
- [ ] Реализовать EventEmitter для событий
- [ ] Написать тест: `vfs.read-only-guest.test.tsx`

### 3.2 VFS инициализация из S3
- [ ] Реализовать VFS инициализацию из S3 (list операция)
- [ ] Реализовать кэширование в памяти
- [ ] Проверить, что VFS инициализируется на boot

### 3.3 Explorer (Tree + Grid view)
- [ ] Реализовать Explorer компонент
- [ ] Реализовать Tree view (слева): иерархия папок
- [ ] Реализовать Grid view (справа): содержимое текущей папки
- [ ] Реализовать навигацию (клик по папке → обновление grid view)
- [ ] Написать тест: `explorer.tree-view.test.tsx`
- [ ] Написать тест: `explorer.grid-view.test.tsx`
- [ ] Написать тест: `explorer.navigate.test.tsx`

### 3.4 Explorer синхронизация с VFS
- [ ] Реализовать подписку Explorer на VFS события
- [ ] Убедиться, что изменения VFS отражаются в Explorer
- [ ] Написать тест: `explorer.vfs-sync.test.tsx`

### 3.5 Desktop Icons интеграция с VFS
- [ ] Реализовать чтение Desktop Icons из VFS `/desktop`
- [ ] Убедиться, что иконки рендерятся из VFS
- [ ] Написать тест: `desktop.icons.render.test.tsx`
- [ ] Написать тест: `desktop.icons.open.test.tsx`

### 3.6 Тесты
- [ ] Запустить тесты: `explorer.*.test.tsx`, `desktop.icons.*.test.tsx`, `vfs.*.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** VFS работает, Explorer показывает Tree + Grid view, изменения VFS отражаются в Explorer, Desktop Icons рендерятся из VFS, тесты зеленые.

---

## Phase 4: Viewers (M3) — Системные приложения

**Цель:** Системные приложения для просмотра контента.

### 4.1 ImageViewer
- [ ] Реализовать ImageViewer компонент (Windows 95 стилистика)
- [ ] Реализовать fit-to-window логику
- [ ] Зарегистрировать в AppRegistry
- [ ] Написать тест: `content.image-opens-viewer.test.tsx`

### 4.2 VideoViewer
- [ ] Реализовать VideoViewer компонент (Windows 95 стилистика)
- [ ] Реализовать HTML5 video controls
- [ ] Зарегистрировать в AppRegistry
- [ ] Написать тест: `content.video-opens-viewer.test.tsx`

### 4.3 Notepad
- [ ] Реализовать Notepad компонент (Windows 95 стилистика)
- [ ] Реализовать read-only просмотр текста
- [ ] Реализовать Markdown рендеринг (если `.md`)
- [ ] Зарегистрировать в AppRegistry
- [ ] Написать тест: `content.txt-opens-notepad.test.tsx`

### 4.4 Internet Explorer
- [ ] Реализовать Internet Explorer компонент (Windows 95 стилистика)
- [ ] Реализовать HTML просмотр в iframe (sandboxed)
- [ ] Реализовать навигацию по ссылкам внутри окна
- [ ] Зарегистрировать в AppRegistry
- [ ] Написать тест: `content.html-opens-ie.test.tsx`

### 4.5 Executor/AppHost
- [ ] Проверить существующий `AppHost.tsx`
- [ ] Убедиться, что iframe sandbox политика работает
- [ ] Зарегистрировать в AppRegistry
- [ ] Написать тест: `content.webapp-opens-executor.test.tsx`

### 4.6 AppRegistry и правила открытия
- [ ] Проверить существующий `AppRegistry.ts`
- [ ] Реализовать маппинг типов контента на приложения
- [ ] Реализовать правила открытия по расширению/типу
- [ ] Убедиться, что двойной клик по файлу открывает правильный Viewer/Executor

### 4.7 Тесты
- [ ] Запустить тесты: `content.*-opens-*.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** Все Viewers работают, контент открывается правильным Viewer по типу, тесты зеленые.

---

## Phase 5: Content Ops + S3 Integration (M4) — Операции с контентом

**Цель:** Операции с контентом (Organizer) и синхронизация с S3.

### 5.1 Backend API для VFS/S3
- [ ] Реализовать `GET /api/vfs/list?path=...` → список файлов/папок
- [ ] Реализовать `GET /api/vfs/read?key=...` → чтение файла
- [ ] Реализовать `POST /api/vfs/upload` → загрузка файла (Organizer only)
- [ ] Реализовать `POST /api/vfs/move` → перемещение файла (Organizer only)
- [ ] Реализовать `DELETE /api/vfs/delete?key=...` → удаление файла (Organizer only)
- [ ] Написать тесты для endpoints

### 5.2 S3 Service
- [ ] Реализовать S3 Service (абстракция над S3-совместимым хранилищем)
- [ ] Реализовать операции: list, read, upload, move, delete
- [ ] Убедиться, что работает с MinIO (локально) и AWS S3 (продакшн)

### 5.3 VFS ↔ S3 синхронизация
- [ ] Реализовать синхронизацию VFS с S3 на boot
- [ ] Реализовать синхронизацию изменений VFS с S3
- [ ] Реализовать обнаружение внешних изменений S3 (polling или webhook)
- [ ] Написать тест: `vfs.sync-s3.test.tsx`

### 5.4 RBAC проверки
- [ ] Реализовать проверку роли Guest (read-only)
- [ ] Реализовать проверку роли Organizer (full control)
- [ ] Реализовать проверку на уровне VFS API
- [ ] Реализовать проверку на уровне Backend API (JWT токен + роль)
- [ ] Написать тест: `vfs.read-only-guest.test.tsx`
- [ ] Написать тест: `vfs.organizer-full-control.test.tsx`
- [ ] Написать тест: `auth.roles.test.tsx`

### 5.5 UI для Organizer
- [ ] Реализовать UI для загрузки файлов (Organizer only)
- [ ] Реализовать UI для перемещения файлов (Organizer only)
- [ ] Реализовать UI для удаления файлов (Organizer only)
- [ ] Убедиться, что UI скрывается для Guest/Participant

### 5.6 Тесты
- [ ] Запустить тесты: `vfs.*.test.tsx`, `auth.roles.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** Backend API работает, S3 синхронизация работает, RBAC проверки работают, Organizer может create/upload/move/delete, Guest не может писать, тесты зеленые.

---

## Phase 6: Mobile (M5) — Мобильное приложение

**Цель:** Windows Mobile 6.0 стилизованное мобильное приложение.

### 6.1 MobileShell реализация
- [ ] Реализовать MobileShell (WM6 стилистика)
- [ ] Реализовать навигацию через экранные "приложения"
- [ ] Убедиться, что визуально соответствует WM6

### 6.2 Контент открытие в Mobile
- [ ] Реализовать открытие контента "приложениями" под WM6-стиль
- [ ] Убедиться, что те же типы контента, что и Desktop
- [ ] Проверить визуально

### 6.3 Тесты
- [ ] Написать тест: `shell.boot.mobile.test.tsx`
- [ ] Запустить тесты
- [ ] Убедиться, что все тесты зеленые

**DoD:** MobileShell работает, WM6 стилистика применена, контент открывается правильно, тесты зеленые.

---

## Phase 7: Security + Polish — Безопасность и полировка

**Цель:** Безопасность и финальная полировка.

### 7.1 Iframe sandbox политика
- [ ] Проверить, что Executor iframe имеет sandbox политику
- [ ] Убедиться, что запрещены `allow-top-navigation`, `allow-modals`
- [ ] Написать тест: `security.iframe-sandbox.test.tsx`

### 7.2 PostMessage валидация
- [ ] Реализовать валидацию PostMessage от iframe
- [ ] Реализовать allowlist разрешенных типов сообщений
- [ ] Написать тест: `security.postmessage.test.tsx`

### 7.3 Viewport boundary enforcement
- [ ] Реализовать проверку координат окон в WindowStore/WindowManager
- [ ] Убедиться, что окна нельзя утащить за пределы viewport
- [ ] Написать тест: `window.viewport-boundary.test.tsx`

### 7.4 XSS защита
- [ ] Убедиться, что имена файлов экранируются при рендеринге
- [ ] Убедиться, что HTML файлы открываются в sandboxed iframe
- [ ] Написать тест: `security.xss.test.tsx`

### 7.5 Windowing polish
- [ ] Убедиться, что drag работает только за заголовок
- [ ] Убедиться, что focus работает правильно
- [ ] Написать тест: `window.drag.test.tsx`
- [ ] Написать тест: `window.focus.test.tsx`
- [ ] Написать тест: `window.open-close.test.tsx`

### 7.6 Тесты
- [ ] Запустить тесты: `security.*.test.tsx`, `window.*.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** Iframe sandbox проверен, PostMessage валидация работает, viewport boundary enforced, XSS защита работает, тесты зеленые.

---

## Phase 8: Telegram Auth — Авторизация

**Цель:** Замена email/password auth на Telegram auth.

### 8.1 Telegram auth endpoint
- [ ] Реализовать `POST /api/auth/telegram` endpoint
- [ ] Реализовать валидацию Telegram hash
- [ ] Реализовать выдачу JWT токена
- [ ] Написать тест: `auth.telegram.test.tsx`

### 8.2 Замена email/password auth
- [ ] Удалить email/password auth код (см. CUTLIST.md)
- [ ] Обновить AuthContext для Telegram auth
- [ ] Обновить UI для Telegram auth
- [ ] Проверить, что старый auth код удален

### 8.3 Тесты
- [ ] Запустить тесты: `auth.telegram.test.tsx`
- [ ] Убедиться, что все тесты зеленые
- [ ] Проверить coverage

**DoD:** Telegram auth работает, email/password auth удален, тесты зеленые.

---

## Финальная проверка

### Функциональная проверка
- [ ] Shell Boot работает на `/`
- [ ] Desktop Icons рендерятся из VFS
- [ ] Explorer работает (Tree + Grid view)
- [ ] Windowing работает (открытие/закрытие, drag, focus, viewport boundary)
- [ ] Контент открывается правильными Viewer/Executor
- [ ] VFS синхронизируется с S3
- [ ] RBAC работает (Guest read-only, Organizer full control)
- [ ] Mobile Shell работает

### Техническая проверка
- [ ] Все обязательные тесты (10-20) зеленые
- [ ] Coverage > 70% для новых компонентов
- [ ] Dead code удален
- [ ] Security проверен

### Документация
- [ ] FP7.md полностью обновлен
- [ ] CUTLIST.md задокументирован
- [ ] Rewrite Checklist выполнен

---

**End of Rewrite Checklist**
