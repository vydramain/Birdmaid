# FP7: Shell-only Platform Spec (v2)

**Status:** plan+design  
**Created:** 2026-01-22  
**Updated:** 2026-01-22  
**Version:** 2.1 (Contract Spec)

## Outcome

Платформа реализована как shell-only система: пользователь попадает на рабочий стол Windows 95 (desktop) или Windows Mobile 6.0 (mobile), где контент представлен как файловая система. Навигация происходит исключительно через Desktop Icons и Explorer — никакого "обычного сайта". Контент открывается в соответствующих окнах (ImageViewer, VideoViewer, Notepad, Internet Explorer, Executor). Организаторы могут создавать/размещать любой контент через VFS, синхронизированный с S3-совместимым хранилищем. Авторизация через Telegram. Окна не могут быть утащены за пределы viewport.

## Scope

### IN (Strict)

1. **Shell-only навигация:**
   - Desktop Icons как единственный способ запуска приложений/открытия контента
   - Explorer (Tree + Grid view) как единственный способ навигации по файловой структуре
   - Полный отказ от react-router и любой "сайт-навигации" в продуктовой поверхности

2. **Платформенная архитектура:**
   - Desktop Shell (Windows 95 стилистика): многооконная система с Desktop Icons, Explorer, Taskbar
   - Mobile Shell (Windows Mobile 6.0 стилистика): отдельное фронтенд-приложение, не "обычный сайт"
   - Platform Context: автоматическое определение Desktop/Mobile на boot, фиксация на сессию

3. **Виртуальная файловая система (VFS):**
   - In-memory VFS как источник правды для Explorer и Desktop Icons
   - Синхронизация с S3-совместимым хранилищем (list/read/upload/move/delete операции)
   - Event-driven модель для UI обновлений

4. **Типы контента и правила открытия:**
   - `image` → ImageViewer окно
   - `video` → VideoViewer окно
   - `txt` → Notepad окно (Windows 95 стилистика)
   - `html` → Internet Explorer окно (Windows 95 стилистика)
   - `webapp` → Executor/AppHost окно (iframe с sandbox)

5. **Роли и права:**
   - Guest: только просмотр (read-only VFS)
   - Participant: расширенный доступ (определяется политикой проекта)
   - Organizer: полный контроль контента (create/upload/move/delete папок и файлов)

6. **Windowing Constraints:**
   - Окна нельзя утащить за пределы viewport (жесткое ограничение координат)
   - Drag/resize ограничены границами видимой области

7. **Авторизация:**
   - Telegram auth как основной способ входа (production)
   - DEV MODE auth для локальной разработки и тестов
   - JWT токены для API доступа
   - Win95-style системная панель управления пользователем (Taskbar Tray + User Panel)

8. **Storage:**
   - S3-совместимое хранилище для файлов/пакетов/ресурсов
   - VFS синхронизируется с S3 через API операции

### OUT (Cutline)

1. **React-router и сайт-навигация:**
   - Удалить все маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*`
   - Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности
   - Оставить только ShellRoot → DesktopShell/MobileShell

2. **Email/password auth:**
   - Удалить регистрацию через email/password
   - Удалить recovery flow через email
   - Заменить на Telegram auth

3. **Старые роли:**
   - Удалить `isSuperAdmin` как отдельную роль
   - Заменить на Guest/Participant/Organizer модель

4. **Контекстные меню и drag-and-drop файлов:**
   - Не входит в MVP: правый клик на файлах/папках
   - Не входит: перетаскивание файлов между папками (только drag окон)

5. **Сложные файловые операции:**
   - Не входит: Copy операция (только Move/Delete для Organizer)
   - Не входит: Batch операции

6. **Внешний браузер:**
   - Не входит: общий web browser (CORS proxy)
   - Только iframe для webapp/game контента

7. **Социальные функции:**
   - Не входит: комментарии, рейтинги, "соцсеть"
   - Расширяемость заложена через интерфейсы/плагины, но без реализации

## Definitions

- **Shell**: Единая точка входа в платформу (`ShellRoot`), определяющая Desktop/Mobile контекст
- **Desktop Shell**: Windows 95 стилизованная многооконная среда с Desktop Icons, Explorer, Taskbar
- **Mobile Shell**: Windows Mobile 6.0 стилизованное фронтенд-приложение (отдельное от Desktop)
- **Window**: Окно в Desktop Shell с заголовком, кнопками управления, содержимым
- **App**: Приложение, зарегистрированное в AppRegistry (Explorer, ImageViewer, VideoViewer, Notepad, Internet Explorer, Executor)
- **VFS (Virtual File System)**: In-memory файловая система, синхронизированная с S3, источник правды для UI
- **ContentItem**: Элемент контента в VFS (файл или папка)
- **Folder**: Папка в VFS (может содержать файлы и другие папки)
- **File**: Файл в VFS с типом (`image`, `video`, `txt`, `html`, `webapp`)
- **Viewer**: Системное приложение для просмотра контента (ImageViewer, VideoViewer, Notepad, Internet Explorer)
- **Executor/AppHost**: Iframe-хост для запуска webapp/game контента
- **Organizer**: Роль пользователя с полным контролем контента (create/upload/move/delete)
- **Participant**: Роль пользователя с расширенным доступом (определяется политикой)
- **Guest**: Роль пользователя только для просмотра (read-only)
- **Platform Context**: Контекст определения Desktop/Mobile на boot
- **Viewport Boundary**: Жесткое ограничение координат окон границами видимой области браузера
- **Taskbar Tray**: Область в Taskbar справа, отображающая системные иконки (User Icon, Clock)
- **User Panel**: Системное окно Windows 95 стилистики для управления пользователем (username, роль, logout)
- **AUTH_MODE**: Режим авторизации платформы (`dev` | `telegram`), определяет доступные методы входа

## Product Surface Contract

### Shell-only навигация (обязательное требование)

**Правило:** Вся навигация происходит через Desktop Icons и Explorer. Никаких URL-маршрутов, никаких "страниц сайта".

**Desktop Shell:**
- Пользователь видит Desktop с иконками
- Двойной клик по иконке → открывается окно приложения/контента
- Explorer открывается через иконку "My Computer" или аналогичную
- В Explorer: Tree view (слева) + Grid view (справа) для навигации по VFS
- Один клик → выделение, двойной клик → открытие

**Mobile Shell:**
- Отдельное фронтенд-приложение (не "обычный сайт")
- Навигация через экранные "приложения" в стиле Windows Mobile 6.0
- Контент открывается в соответствующих "приложениях" под WM6-стиль

**Запрещено:**
- React-router маршруты типа `/catalog`, `/games/:id`
- Компоненты CatalogPage, GamePage, TeamsPage, EditorPage в продуктовой поверхности
- Любые "обычные сайт-страницы" как альтернатива Desktop/Explorer

## UX Rules

### Desktop (Windows 95)

1. **Boot:**
   - URL всегда `/` (или `/desktop` для явного указания)
   - Platform Context определяет Desktop/Mobile на boot
   - Режим фиксируется на сессию (resize браузера не переключает режим)

2. **Desktop Environment:**
   - Wallpaper (фон рабочего стола)
   - Desktop Icons (иконки для запуска приложений/открытия контента)
   - Window Manager (управление окнами: открытие, закрытие, фокус, z-index)
   - Taskbar (список открытых окон, переключение между ними)
   - **Taskbar Tray** (справа): системные иконки
     - User Icon: отображает статус авторизации (авторизован/не авторизован)
     - Clock: отображает локальное время пользователя
     - Клик по User Icon → открывает User Panel окно

3. **Windowing:**
   - Окна имеют заголовок, кнопки управления (minimize, maximize, close)
   - Drag: только за заголовок окна
   - Focus: клик по окну → поднимает на передний план (z-index)
   - **Viewport Boundary:** Окна нельзя утащить за пределы viewport (координаты ограничены `[0, 0]` до `[viewportWidth - windowWidth, viewportHeight - windowHeight]`)

4. **Desktop Icons (контракт):**
   - Desktop Icons читаются **строго из фиксированной системной папки Desktop**
   - Источник: `/Disk C/desktop` (системная папка Desktop)
   - Запрет: Desktop Icons **не могут быть перенесены** в произвольные папки
   - Иконки рендерятся из содержимого папки `/Disk C/desktop`
   - Двойной клик по иконке → открывается соответствующим приложением/Viewer

5. **Explorer (контракт):**
   - Explorer обязан уметь навигировать по **всему дереву от root**
   - Tree view (слева): иерархия папок от root (`/`) до любого уровня вложенности
   - Grid view (справа): содержимое текущей папки
   - Синхронизация: изменения в VFS мгновенно отражаются в обоих видах
   - **Нет "жёстких" путей в UI** кроме системных папок 1-го уровня
   - Explorer показывает все системные папки первого уровня на root
   - Навигация работает для любой структуры, созданной Organizer'ом внутри системных папок

6. **Открытие контента:**
   - Двойной клик по файлу → открывается соответствующим Viewer/Executor
   - Тип файла определяется по расширению или метаданным VFS

7. **User Panel (системное окно):**
   - Открывается кликом по User Icon в Taskbar Tray
   - Windows 95 стилистика (отдельное окно, не Start Menu)
   - Отображает:
     - Username (имя пользователя)
     - Роль (Guest / Participant / Organizer)
     - Кнопку Log out
     - (для Organizer) ссылку/кнопку на Admin/Management функции (если реализованы)
   - Закрывается стандартными способами (кнопка [X], клик вне окна)

### Mobile (Windows Mobile 6.0)

1. **Boot:**
   - Отдельное фронтенд-приложение (не Desktop Shell)
   - Platform Context определяет Mobile на boot
   - UX и визуальная модель имитируют Windows Mobile 6.0

2. **Навигация:**
   - Экранные "приложения" в стиле WM6
   - Списки, элементы управления, поведение окна/экрана как в WM6
   - Контент по-прежнему воспринимается как файловая структура

3. **Открытие контента:**
   - Контент открывается "приложениями" под WM6-стиль
   - Те же типы контента, что и в Desktop, но с WM6 UI

## Content Model

### Структура VFS

VFS организована как иерархия папок и файлов с разделением на **immutable root-level system folders** и **mutable subtree**.

#### Root (My Computer)

**Root** (`/` или "My Computer") — это корневая сущность VFS, от которой начинается вся файловая система. Root не может быть удален, переименован или перемещен.

#### Root-Level System Folders (Immutable)

**Первый уровень папок** — это непосредственные дети root (`/`). Эти папки являются **системными** и **неизменяемыми**:

- **Нельзя удалять** root-level system folders
- **Нельзя переименовывать** root-level system folders
- **Нельзя перемещать** root-level system folders
- **Нельзя изменять набор** root-level system folders (добавлять/удалять системные папки)

**Список системных папок первого уровня (final):**

- `/Disk A` — системная папка (диск A)
- `/Disk B` — системная папка (диск B)
- `/Disk C` — системная папка (диск C)
  - Внутри Disk C могут быть системные подпапки:
    - `/Disk C/desktop` — системная папка Desktop (источник Desktop Icons)
    - `/Disk C/images` — системная папка для изображений
    - `/Disk C/videos` — системная папка для видео
    - `/Disk C/documents` — системная папка для документов/игр

**Важно:** Внутри системных папок первого уровня Organizer имеет **полную свободу** — может создавать любые подпапки, любую вложенность, загружать файлы, переименовывать/перемещать/удалять элементы.

#### Subtree (Mutable)

**Subtree** — это всё, что находится **ниже первого уровня** (внутри системных папок):

- Organizer может:
  - Создавать папки любой глубины вложенности
  - Загружать файлы в любые папки
  - Переименовывать файлы и папки (кроме root-level system folders)
  - Перемещать файлы и папки (кроме root-level system folders)
  - Удалять файлы и папки (кроме root-level system folders)
- Guest/Participant: read-only доступ к subtree

#### Пример структуры

```
/ My Computer (root)
  /Disk A (system folder, immutable)
    /... (любая структура, созданная Organizer'ом)
  /Disk B (system folder, immutable)
    /... (любая структура, созданная Organizer'ом)
  /Disk C (system folder, immutable)
    /desktop (system folder, immutable)
      My Computer (link to root for explorer)
      registration.html (html)
      help.txt (txt)
      /... (любая структура, созданная Organizer'ом)
    /images (system folder, immutable)
      /LD58 (folder, создана Organizer'ом)
        image1.png (image)
      /... (любая структура, созданная Organizer'ом)
    /videos (system folder, immutable)
      /LD62 (folder, создана Organizer'ом)
        video1.mp4 (video)
      /... (любая структура, созданная Organizer'ом)
    /documents (system folder, immutable)
      /LD59 (folder, создана Organizer'ом)
        /command1 (folder, создана Organizer'ом)
          game (executable game execute in iframe)
        /command2 (folder, создана Organizer'ом)
          game (link to another source to execute in iframe)
      /... (любая структура, созданная Organizer'ом)
```

**Примечание:** Структура внутри системных папок является примером и может быть любой — Organizer строит её самостоятельно.

### Типы контента

| Тип | Расширения | Открывается в | Описание |
|-----|-----------|---------------|----------|
| `image` | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | ImageViewer | Окно просмотра изображений (Windows 95 стилистика) |
| `video` | `.mp4`, `.webm`, `.ogg` | VideoViewer | Окно просмотра видео (Windows 95 стилистика) |
| `txt` | `.txt`, `.md` | Notepad | Окно "Блокнот" (Windows 95 стилистика), read-only |
| `html` | `.html`, `.htm` | Internet Explorer | Окно "Internet Explorer" (Windows 95 стилистика) |
| `webapp` | `.app`, или метаданные `type: webapp` | Executor/AppHost | Iframe-хост для запуска web-приложений/игр (Windows 95 frame для окна) |

### Правила открытия

1. **HTML help (`html`):**
   - Открывается в окне типа "Internet Explorer (Windows 95)"
   - Полноценная HTML страница с CSS inline стилями без возможности навигации, но с возможностью делать вызовы только к нашей api
   - Не может выйти за пределы окна (no top-level navigation)

2. **TXT файлы (`txt`):**
   - Открывается в окне типа "Notepad/Блокнот (Windows 95)"
   - Read-only просмотр текста (для Guest и Participant) и возможностью редактирования для Orginizer
   - Поддержка Markdown рендеринга (если `.md`)

3. **Webapp/Game (`webapp`):**
   - Открывается в Executor/AppHost окне
   - Iframe с sandbox политикой
   - Entrypoint: `index.html` или внешняя ссылка (в рамках модели хранения)

4. **Image/Video:**
   - Открываются в соответствующих Viewer окнах
   - Fit-to-window логика для изображений
   - Стандартные HTML5 video controls для видео

### Метаданные ContentItem

```typescript
interface ContentItem {
  name: string;
  type: 'file' | 'dir';
  contentType?: 'image' | 'video' | 'txt' | 'html' | 'webapp';
  path: string;
  size?: number;
  modified?: Date;
  children?: ContentItem[]; // только для dir
  s3Key?: string; // ключ в S3
  metadata?: Record<string, any>; // дополнительные метаданные
}
```

## Roles & Permissions

### Guest (Гость)

**Права:**
- Просмотр опубликованного/доступного контента
- Read-only доступ к VFS: `readFile`, `readDir`, `stat`
- Запрещено: `writeFile`, `mkdir`, `delete`, `move`

**Ограничения:**
- Не может создавать/загружать контент
- Не может изменять структуру папок

### Participant (Участник)

**Права:**
- Все права Guest
- Пока что только Read-only доступ к VFS: `readFile`, `readDir`, `stat`
- Без полного админства

**Ограничения:**
- Не может создавать структуру папок (только Organizer)
- Не может управлять доступом

### Organizer (Организатор)

**Права:**
- Полный контроль контента в **subtree** (внутри системных папок):
  - `createFolder` (создание папок любой глубины вложенности)
  - `uploadFile` (загрузка файлов в любые папки)
  - `moveItem` (перемещение файлов/папок внутри subtree)
  - `deleteItem` (удаление файлов/папок из subtree)
  - `renameItem` (переименование файлов/папок в subtree)
- Управление размещением контента (внутри системных папок)
- Управление доступом (в рамках предусмотренной модели)

**Ограничения:**
- **НЕ может изменять root-level system folders:**
  - Запрещено удалять root-level system folders (`/Disk A`, `/Disk B`, `/Disk C`, и т.д.)
  - Запрещено переименовывать root-level system folders
  - Запрещено перемещать root-level system folders
  - Запрещено изменять набор root-level system folders (добавлять/удалять системные папки)
- При попытке изменить root-level system folder → выбрасывается `PermissionDenied` ошибка

### Хранение ролей

**Backend как source of truth:**
- Роль пользователя хранится в БД как поле (например, `role: 'Guest' | 'Participant' | 'Organizer'`)
- Роль загружается при авторизации и включается в JWT токен
- Backend API проверяет роль из JWT токена перед выполнением операций

**Назначение роли Organizer:**
- Выполняется вручную через БД на текущем этапе
- UI для управления ролями не входит в MVP
- Backend считается единственным источником правды для ролей

### Реализация прав

Права проверяются на уровне:
1. **Backend API:** endpoints проверяют JWT токен и роль из токена перед выполнением операций (RBAC enforced на backend)
2. **VFS API:** методы VFS проверяют роль пользователя перед операциями (на основе роли из backend)
3. **UI:** кнопки/действия скрываются для пользователей без прав (на основе роли из backend)

## Storage & Sync

### S3-совместимое хранилище

**Контракт (без деталей реализации):**

Платформа использует S3-совместимое хранилище для файлов/пакетов/ресурсов. Конкретная реализация (MinIO, AWS S3, другой провайдер) не важна для контракта.

### Операции

| Операция | Кто может | Описание |
|----------|-----------|----------|
| `list(path)` | Guest, Participant, Organizer | Список файлов/папок по пути |
| `read(key)` | Guest, Participant, Organizer | Чтение файла по S3 ключу |
| `upload(key, file)` | Organizer | Загрузка файла в S3 |
| `move(oldKey, newKey)` | Organizer | Перемещение файла в S3 |
| `delete(key)` | Organizer | Удаление файла из S3 |

### Синхронизация VFS ↔ S3

1. **Boot:**
   - VFS инициализируется из S3 (list операция на root)
   - Кэшируется в памяти для быстрого доступа

2. **Изменения VFS (Organizer):**
   - Операции write/move/delete в VFS → синхронизация с S3 через API
   - После успешной синхронизации → VFS событие → UI обновление

3. **Внешние изменения S3:**
   - Polling или webhook для обнаружения изменений
   - Обновление VFS → событие → UI обновление

4. **Конфликты:**
   - VFS является источником правды для UI
   - S3 является источником правды для персистентности
   - При конфликте: последняя операция Organizer имеет приоритет

### Миграция S3 (Migration Notes)

**Маппинг S3 keys:**
- S3 keys должны маппиться как `root/system-folder/...` + произвольная вложенность
- Пример: `Disk C/desktop/help.txt`, `Disk C/images/LD58/image1.png`
- Структура в S3 соответствует структуре VFS: root → system folder → subtree

**Ограничения миграции:**
- **Запрещена миграция**, требующая изменения набора системных папок первого уровня
- Если существующая структура S3 не соответствует новому контракту (immutable system folders), требуется реализация мигратора
- Без мигратора: система не может быть обновлена, если структура S3 не соответствует контракту

## Architecture

### Компоненты

**Frontend (Shell-only):**

1. **ShellRoot** (`os/ShellRoot.tsx`)
   - Единая точка входа
   - Определяет Platform Context (Desktop/Mobile)
   - Рендерит DesktopShell или MobileShell

2. **DesktopShell** (`pages/DesktopPage.tsx`)
   - Wallpaper
   - Desktop Icons (читает из VFS `/desktop`)
   - WindowManager
   - Taskbar

3. **MobileShell** (`pages/MobilePage.tsx`)
   - Отдельное приложение для Mobile
   - WM6 стилистика

4. **WindowManager** (`os/wm/WindowManager.tsx`)
   - Управление окнами: открытие, закрытие, фокус, z-index
   - Viewport boundary enforcement

5. **WindowRegistry** (`os/wm/WindowRegistry.tsx`)
   - React state для списка окон
   - Z-index управление

6. **WindowStore** (`os/wm/WindowStore.ts`)
   - Mutable state для геометрии окон (x, y, width, height)
   - rAF-driven обновления для drag операций

7. **WindowFrame** (`os/wm/WindowFrame.tsx`)
   - Компонент окна с заголовком, кнопками, содержимым
   - Drag обработка (только заголовок)

8. **AppRegistry** (`os/apps/AppRegistry.ts`)
   - Реестр приложений (Explorer, ImageViewer, VideoViewer, Notepad, Internet Explorer, Executor)
   - Маппинг типов контента на приложения

9. **AppHost** (`os/apps/AppHost.tsx`)
   - Iframe-хост для Executor
   - Sandbox политика

10. **VirtualFileSystem** (`os/fs/VirtualFileSystem.ts`)
    - In-memory файловая система
    - Event-driven модель (EventEmitter)
    - Синхронизация с S3 через API

11. **Explorer** (`os/apps/Explorer.tsx` или аналогичный)
    - Tree view + Grid view
    - Навигация по VFS
    - Подписка на VFS события

12. **Viewers** (ImageViewer, VideoViewer, Notepad, Internet Explorer)
    - Системные приложения для просмотра контента
    - Windows 95 стилистика

13. **UserPanelApp** (`os/apps/UserPanelApp.tsx` или аналогичный)
    - Системное приложение для управления пользователем
    - Windows 95 стилистика
    - Отображает username, роль, кнопку Log out
    - (для Organizer) ссылку/кнопку на Admin/Management функции
    - Не управляет ролями (только отображение + logout)

14. **Taskbar** (`os/taskbar/Taskbar.tsx` или аналогичный)
    - Список открытых окон (слева)
    - **Tray Area** (справа):
      - User Icon (статус авторизации)
      - Clock (локальное время пользователя)

**Backend (API):**

1. **Auth Controller** (`auth/auth.controller.ts`)
   - Telegram auth endpoint (`/api/auth/telegram`)
   - DEV MODE auth endpoint (`/api/auth/dev`) — только для локальной разработки
   - JWT токен выдача
   - Роль пользователя загружается из БД и включается в JWT токен

2. **VFS/S3 Controller** (`vfs/vfs.controller.ts` или аналогичный)
   - `GET /api/vfs/list?path=...` → список файлов/папок
   - `GET /api/vfs/read?key=...` → чтение файла
   - `POST /api/vfs/upload` → загрузка файла (Organizer only)
   - `POST /api/vfs/move` → перемещение файла (Organizer only)
   - `DELETE /api/vfs/delete?key=...` → удаление файла (Organizer only)

3. **S3 Service** (`s3/s3.service.ts` или аналогичный)
   - Абстракция над S3-совместимым хранилищем
   - Операции: list, read, upload, move, delete

### Границы модулей

1. **Shell Kernel:**
   - ShellRoot, PlatformContext, DesktopShell, MobileShell
   - Не зависит от VFS или WindowManager

2. **Window System:**
   - WindowManager, WindowRegistry, WindowStore, WindowFrame
   - Независим от VFS или Apps

3. **VFS:**
   - VirtualFileSystem, VFS events
   - Независим от UI компонентов

4. **Apps:**
   - AppRegistry, AppHost, Viewers, Explorer
   - Зависит от Window System и VFS

5. **Storage:**
   - S3 Service, VFS/S3 Controller
   - Независим от Frontend

### Separation of Concerns

- **Handlers по типам контента:** Каждый тип контента имеет свой Viewer/Executor, регистрируется в AppRegistry
- **VFS как источник правды:** Все UI компоненты читают из VFS, подписываются на события
- **Window System независим:** WindowManager не знает о типах контента, только об окнах
- **Apps независимы:** Каждое приложение (Explorer, Viewer, Executor) независимо, общается через VFS и Window API

## Windowing Constraints

### Viewport Boundary (обязательное ограничение)

**Правило:** Окна нельзя утащить за пределы viewport браузера.

**Реализация:**

1. **Координаты ограничены:**
   - `x >= 0` и `x <= viewportWidth - windowWidth`
   - `y >= 0` и `y <= viewportHeight - windowHeight`

2. **Размеры ограничены:**
   - `width <= viewportWidth` (минимум: заголовок окна виден)
   - `height <= viewportHeight` (минимум: заголовок окна виден)

3. **Resize ограничен:**
   - При resize окно не может выйти за пределы viewport
   - Минимальный размер: заголовок + минимальное содержимое

4. **Drag ограничен:**
   - При drag координаты автоматически ограничиваются границами viewport
   - Если окно уже на границе, drag в направлении границы игнорируется

5. **Taskbar/системные панели:**
   - Если есть Taskbar, viewport height уменьшается на высоту Taskbar
   - Аналогично для других системных панелей

### Boundary Enforcement

WindowStore или WindowManager должен проверять координаты при каждом обновлении:

```typescript
function enforceViewportBoundary(win: WindowGeometry, viewport: ViewportSize): WindowGeometry {
  return {
    x: Math.max(0, Math.min(win.x, viewport.width - win.width)),
    y: Math.max(0, Math.min(win.y, viewport.height - win.height)),
    width: Math.min(win.width, viewport.width),
    height: Math.min(win.height, viewport.height),
  };
}
```

## Security

### Iframe Sandbox Policy

**Executor/AppHost** использует строгую sandbox политику:

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  src="..."
/>
```

**Разрешенные флаги:**
- `allow-scripts`: Требуется для логики игры/webapp
- `allow-same-origin`: Требуется для доступа к своим assets/localStorage
- `allow-forms`: Разрешено для базового ввода в игре
- `allow-popups`: Разрешено для внешних ссылок

**Запрещенные флаги:**
- `allow-top-navigation`: Запрещено (iframe не может перенаправить главное окно)
- `allow-top-navigation-by-user-activation`: Запрещено
- `allow-modals`: Запрещено

### PostMessage Policy

**Контракт (без деталей реализации):**

1. **Shell → Iframe:**
   - Shell отправляет сообщения в iframe с конкретным `targetOrigin`
   - Сообщения валидируются по схеме `{ type: string, payload: unknown }`

2. **Iframe → Shell:**
   - Сообщения от iframe валидируются по `event.origin`
   - Строгая схема валидации: только разрешенные типы сообщений
   - Игнорируются malformed сообщения

3. **Allowlist:**
   - Только разрешенные типы сообщений обрабатываются
   - Все остальные игнорируются

### VFS Access Control

1. **Guest Read-Only:**
   - VFS методы `writeFile`, `mkdir`, `delete`, `move` выбрасывают `PermissionDenied` для Guest
   - Проверка на уровне VFS API

2. **Organizer Full Control (с ограничениями):**
   - Все операции разрешены в **subtree** (внутри системных папок)
   - **Запрещено изменять root-level system folders:**
     - Попытка удалить/переименовать/переместить root-level system folder → выбрасывается `PermissionDenied`
     - Проверка на уровне VFS API и Backend API (JWT токен + роль)
   - Проверка на уровне Backend API (JWT токен + роль) для всех операций

### XSS Protection

1. **File Names:**
   - Все имена файлов экранируются при рендеринге в UI
   - Нет выполнения кода из имен файлов

2. **File Content:**
   - HTML файлы открываются в sandboxed iframe (Internet Explorer окно)
   - TXT файлы рендерятся как plain text (или безопасный Markdown)

3. **Webapp Content:**
   - Webapp контент изолирован в Executor iframe с sandbox политикой
   - Не может выйти за пределы iframe

## API Contracts

### Auth API

| Endpoint | Method | Request | Response | Auth | AUTH_MODE | Notes |
|----------|--------|---------|----------|------|-----------|-------|
| `/api/auth/telegram` | POST | `{ telegramId: string, hash: string, ... }` | `{ user: User, token: string }` | Public | `telegram` | Реальный Telegram auth, используется в production |
| `/api/auth/dev` | POST | `{ userId?: string, role?: 'Guest' \| 'Participant' \| 'Organizer' }` | `{ user: User, token: string }` | Public | `dev` | DEV MODE: выдаёт JWT без проверки Telegram signature. **ЗАПРЕЩЁН в production.** Только для локальной разработки и тестов. |
| `/api/auth/me` | GET | - | `{ user: User }` | JWT | `dev`, `telegram` | Возвращает текущего пользователя из JWT токена |

**AUTH_MODE:**
- Платформа работает в одном из режимов: `AUTH_MODE=dev` или `AUTH_MODE=telegram`
- В `AUTH_MODE=dev`: доступен `/api/auth/dev`, dev-auth выдаёт JWT без проверки Telegram signature
- В `AUTH_MODE=telegram`: используется реальный Telegram auth через `/api/auth/telegram`
- **DEV MODE ЗАПРЕЩЁН в production** (должен быть отключён или заблокирован)

**User объект в ответе:**
- Содержит `role: 'Guest' | 'Participant' | 'Organizer'` (загружается из БД)
- Роль включается в JWT токен для последующих проверок на backend

### VFS/S3 API

| Endpoint | Method | Request | Response | Auth | Role |
|----------|--------|---------|----------|------|------|
| `/api/vfs/list` | GET | `?path=/documents` | `{ items: ContentItem[] }` | JWT | Guest+ |
| `/api/vfs/read` | GET | `?key=s3://bucket/path/file.png` | `Blob` или redirect | JWT | Guest+ |
| `/api/vfs/upload` | POST | `FormData(file, path)` | `{ key: string, item: ContentItem }` | JWT | Organizer |
| `/api/vfs/move` | POST | `{ oldKey: string, newKey: string }` | `{ success: boolean }` | JWT | Organizer |
| `/api/vfs/delete` | DELETE | `?key=s3://bucket/path/file.png` | `{ success: boolean }` | JWT | Organizer |

**Примечание:** Конкретная реализация API (NestJS, Express, другой фреймворк) не важна для контракта. Важны только операции и права доступа.

## Tests Contract

### Полный reset тестов

**Удалить:**
- Все тесты для react-router маршрутов (`/catalog`, `/games/:id`, etc.)
- Все тесты для CatalogPage, GamePage, TeamsPage, EditorPage
- Все тесты для email/password auth (заменить на Telegram auth тесты)

**Обязательные тесты (10-20 smoke/contract tests):**

1. **Shell Boot:**
   - `shell.boot.desktop.test.tsx`: ShellRoot определяет Desktop на boot
   - `shell.boot.mobile.test.tsx`: ShellRoot определяет Mobile на boot
   - `shell.platform-context.test.tsx`: Platform Context фиксируется на сессию

2. **Desktop Icons:**
   - `desktop.icons.render.test.tsx`: Desktop Icons рендерятся из VFS `/Disk C/desktop`
   - `desktop.icons.open.test.tsx`: Двойной клик по иконке открывает окно
   - `desktop.icons.from-desktop-only.test.tsx`: Desktop Icons берутся только из системной Desktop-папки (`/Disk C/desktop`), перенос иконок в произвольные папки запрещен

3. **Explorer:**
   - `explorer.tree-view.test.tsx`: Tree view показывает иерархию папок
   - `explorer.grid-view.test.tsx`: Grid view показывает содержимое папки
   - `explorer.navigate.test.tsx`: Клик по папке обновляет grid view
   - `explorer.vfs-sync.test.tsx`: Изменения VFS отражаются в Explorer
   - `explorer.root-tree.includes-system-folders.test.tsx`: Tree на root всегда содержит системные папки первого уровня (`/Disk A`, `/Disk B`, `/Disk C`)

4. **Windowing:**
   - `window.viewport-boundary.test.tsx`: Окна нельзя утащить за пределы viewport
   - `window.drag.test.tsx`: Drag окна работает только за заголовок
   - `window.focus.test.tsx`: Клик по окну поднимает на передний план
   - `window.open-close.test.tsx`: Открытие/закрытие окон работает

5. **Content Opening:**
   - `content.image-opens-viewer.test.tsx`: `.png` файл открывается в ImageViewer
   - `content.video-opens-viewer.test.tsx`: `.mp4` файл открывается в VideoViewer
   - `content.txt-opens-notepad.test.tsx`: `.txt` файл открывается в Notepad
   - `content.html-opens-ie.test.tsx`: `.html` файл открывается в Internet Explorer окне
   - `content.webapp-opens-executor.test.tsx`: `.app` файл открывается в Executor iframe

6. **VFS:**
   - `vfs.read-only-guest.test.tsx`: Guest не может писать в VFS
   - `vfs.organizer-full-control.test.tsx`: Organizer может create/upload/move/delete в subtree
   - `vfs.sync-s3.test.tsx`: Изменения VFS синхронизируются с S3
   - `vfs.system-folders.immutable.test.tsx`: Попытка Organizer удалить/переименовать/переместить root-level system folder → PermissionDenied
   - `vfs.organizer.nested-ops.test.tsx`: Organizer может создать глубокую вложенность внутри system folder и управлять ей (mkdir/upload/move/delete)

7. **Security:**
   - `security.iframe-sandbox.test.tsx`: Executor iframe имеет sandbox политику
   - `security.postmessage.test.tsx`: PostMessage валидация работает
   - `security.xss.test.tsx`: Имена файлов экранируются

8. **Auth:**
   - `auth.telegram.test.tsx`: Telegram auth работает
   - `auth.dev-mode.test.tsx`: DEV MODE auth выдаёт JWT (только для локальной разработки)
   - `auth.roles.test.tsx`: Роль пользователя загружается из backend и определяется правильно
   - `auth.user-panel.test.tsx`: User Panel открывается как окно, отображает username и роль
   - `auth.logout.test.tsx`: Logout работает, пользователь разлогинивается

9. **UI Permissions:**
   - `ui.organizer-actions.test.tsx`: Organizer видит organizer-only UI actions (кнопки загрузки, удаления, etc.)
   - `ui.guest-participant-actions.test.tsx`: Guest/Participant не видят organizer actions (кнопки скрыты)

10. **Taskbar:**
    - `taskbar.tray.test.tsx`: Taskbar Tray отображает User Icon и Clock
    - `taskbar.auth-status.test.tsx`: Taskbar отображает статус авторизации (авторизован/не авторизован)

### Test Files Structure

```
front/__tests__/fp7/
  shell.boot.desktop.test.tsx
  shell.boot.mobile.test.tsx
  shell.platform-context.test.tsx
  desktop.icons.render.test.tsx
  desktop.icons.open.test.tsx
  desktop.icons.from-desktop-only.test.tsx
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
  vfs.sync-s3.test.tsx
  vfs.system-folders.immutable.test.tsx
  vfs.organizer.nested-ops.test.tsx
  security.iframe-sandbox.test.tsx
  security.postmessage.test.tsx
  security.xss.test.tsx
  auth.telegram.test.tsx
  auth.dev-mode.test.tsx
  auth.roles.test.tsx
  auth.user-panel.test.tsx
  auth.logout.test.tsx
  ui.organizer-actions.test.tsx
  ui.guest-participant-actions.test.tsx
  taskbar.tray.test.tsx
  taskbar.auth-status.test.tsx
```

## Plan

### M0: Зачистка (Cleanup)

**Цель:** Удалить старый код, не соответствующий shell-only контракту.

**Tasks:**
1. Удалить react-router маршруты из `App.tsx` (оставить только ShellRoot)
2. Удалить компоненты CatalogPage, GamePage, TeamsPage, EditorPage из продуктовой поверхности
3. Удалить старые тесты для react-router маршрутов
4. Удалить email/password auth код (заменить на Telegram auth stub)
5. Удалить dead code: `WindowContext.tsx`, старый `WindowManager.tsx` (если есть)

**DoD:**
- [ ] `App.tsx` не использует react-router
- [ ] Все старые "сайт-страницы" удалены или перемещены в legacy
- [ ] Старые тесты удалены
- [ ] Dead code удален

### M1: Shell Kernel

**Цель:** Базовый Shell с Platform Context и Desktop/Mobile разделением.

**Tasks:**
1. ShellRoot определяет Platform Context (Desktop/Mobile)
2. DesktopShell рендерит базовый Desktop (Wallpaper, Desktop Icons stub, WindowManager stub)
3. MobileShell рендерит базовый Mobile (WM6 стилистика stub)
4. Platform Context фиксируется на сессию

**DoD:**
- [ ] ShellRoot работает на `/`
- [ ] Platform Context определяется правильно
- [ ] DesktopShell и MobileShell рендерятся
- [ ] Тесты: `shell.boot.desktop.test.tsx`, `shell.boot.mobile.test.tsx`, `shell.platform-context.test.tsx` зеленые

### M2: VFS + Explorer

**Цель:** Виртуальная файловая система и Explorer для навигации.

**Tasks:**
1. VirtualFileSystem реализован (in-memory, event-driven)
2. VFS инициализируется из S3 (list операция)
3. Explorer реализован (Tree view + Grid view)
4. Explorer синхронизируется с VFS через события
5. Desktop Icons читают из VFS `/desktop`

**DoD:**
- [ ] VFS работает (read, list операции)
- [ ] Explorer показывает Tree + Grid view
- [ ] Изменения VFS отражаются в Explorer
- [ ] Desktop Icons рендерятся из VFS
- [ ] Тесты: `explorer.*.test.tsx`, `desktop.icons.*.test.tsx`, `vfs.*.test.tsx` зеленые

### M3: Viewers

**Цель:** Системные приложения для просмотра контента.

**Tasks:**
1. ImageViewer реализован (Windows 95 стилистика)
2. VideoViewer реализован (Windows 95 стилистика)
3. Notepad реализован (Windows 95 стилистика, read-only)
4. Internet Explorer реализован (Windows 95 стилистика, HTML просмотр)
5. AppRegistry регистрирует все Viewers
6. Правила открытия по типу контента работают

**DoD:**
- [ ] Все Viewers работают
- [ ] Контент открывается правильным Viewer по типу
- [ ] Тесты: `content.*-opens-*.test.tsx` зеленые

### M4: Content Ops + S3 Integration

**Цель:** Операции с контентом (Organizer) и синхронизация с S3.

**Tasks:**
1. Backend API для VFS/S3 операций (list, read, upload, move, delete)
2. S3 Service реализован (абстракция над S3-совместимым хранилищем)
3. VFS синхронизируется с S3 (boot, изменения, внешние изменения)
4. RBAC проверки (Guest read-only, Organizer full control)
5. UI для Organizer (загрузка, перемещение, удаление)

**DoD:**
- [ ] Backend API работает
- [ ] S3 синхронизация работает
- [ ] RBAC проверки работают
- [ ] Organizer может create/upload/move/delete
- [ ] Guest не может писать
- [ ] Тесты: `vfs.*.test.tsx`, `auth.roles.test.tsx` зеленые

### M5: Mobile App

**Цель:** Windows Mobile 6.0 стилизованное мобильное приложение.

**Tasks:**
1. MobileShell реализован (WM6 стилистика)
2. Навигация через экранные "приложения"
3. Контент открывается "приложениями" под WM6-стиль
4. Те же типы контента, что и Desktop

**DoD:**
- [ ] MobileShell работает
- [ ] WM6 стилистика применена
- [ ] Контент открывается правильно
- [ ] Тесты: `shell.boot.mobile.test.tsx` зеленые

## Risks & Mitigations

| # | Risk | Probability | Impact | Mitigation | Status |
|---|------|-------------|--------|------------|--------|
| 1 | Telegram auth интеграция сложнее email/password | Medium | High | Использовать Telegram Bot API или готовую библиотеку | open |
| 2 | S3 синхронизация может быть медленной на boot | Medium | Medium | Кэширование VFS в localStorage, lazy loading | open |
| 3 | Viewport boundary enforcement может конфликтовать с drag UX | Low | Medium | Мягкие границы с визуальной обратной связью | open |
| 4 | Mobile Shell требует отдельной реализации | High | High | Начать с Desktop, Mobile как отдельный milestone | open |
| 5 | Dead code удаление может сломать что-то работающее | Low | High | Тщательное тестирование перед удалением | open |
| 6 | VFS события могут привести к memory leaks | Medium | Medium | Строгая очистка подписок в useEffect | open |
| 7 | Iframe sandbox может сломать некоторые игры | Low | Medium | Тестирование на реальных играх, возможные исключения | open |
| 8 | S3 провайдер может измениться | Low | Low | Абстракция S3 Service позволяет менять провайдера | open |
| 9 | Роли Guest/Participant/Organizer могут быть недостаточными | Medium | Low | Расширяемость заложена через интерфейсы | open |
| 10 | Полный reset тестов может скрыть регрессии | Medium | Medium | Сохранить старые тесты как legacy, постепенно мигрировать | open |

## Evidence Checklist

**Что будет считаться доказательством готовности:**

### Functional Proof

- [ ] **Shell Boot:** ShellRoot работает на `/`, определяет Desktop/Mobile правильно
- [ ] **Desktop Icons:** Иконки рендерятся из VFS, двойной клик открывает окно
- [ ] **Explorer:** Tree + Grid view работают, навигация по VFS работает
- [ ] **Windowing:** Окна открываются/закрываются, drag работает, viewport boundary enforced
- [ ] **Content Opening:** Все типы контента открываются правильными Viewer/Executor
- [ ] **VFS Sync:** Изменения VFS отражаются в UI, синхронизация с S3 работает
- [ ] **RBAC:** Guest read-only, Organizer full control работают
- [ ] **Mobile Shell:** MobileShell работает, WM6 стилистика применена

### Technical Proof

- [ ] **Tests:** Все обязательные тесты (10-20) зеленые
- [ ] **Coverage:** Coverage > 70% для новых компонентов
- [ ] **Dead Code:** Старый код удален, нет react-router в продуктовой поверхности
- [ ] **Security:** Iframe sandbox проверен, PostMessage валидация работает
- [ ] **Performance:** Boot < 2s, VFS операции < 100ms

### Documentation Proof

- [ ] **FP7.md:** Полностью обновлен с контрактом
- [ ] **CUTLIST:** Список удаленного кода задокументирован
- [ ] **Rewrite Checklist:** Чеклист переписывания выполнен

## Cutline / Migration Notes

### Что считается dead/legacy

1. **React-router маршруты:**
   - `App.tsx` с Routes/Route компонентами
   - Маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*`
   - **Причина:** Противоречит shell-only контракту (FP7 v2, Product Surface Contract)

2. **Сайт-страницы:**
   - `CatalogPage`, `GamePage`, `TeamsPage`, `EditorPage` компоненты
   - **Причина:** Противоречит shell-only контракту (FP7 v2, Product Surface Contract)
   - **Действие:** Удалить или переместить в `front/src/legacy/` для истории

3. **Email/password auth:**
   - `auth/register`, `auth/login`, `auth/recovery` endpoints (backend)
   - `AuthModal` с email/password полями (frontend)
   - **Причина:** Заменяется на Telegram auth (FP7 v2, Scope OUT)
   - **Действие:** Удалить после реализации Telegram auth

4. **Старые роли:**
   - `isSuperAdmin` как отдельная роль
   - **Причина:** Заменяется на Guest/Participant/Organizer модель (FP7 v2, Roles & Permissions)
   - **Действие:** Мигрировать существующих superAdmin в Organizer роль

5. **Dead code:**
   - `contexts/WindowContext.tsx` (если не используется)
   - `components/WindowManager.tsx` (если заменен на `os/wm/WindowManager.tsx`)
   - Старые тесты для react-router маршрутов
   - **Причина:** Не используется в новой архитектуре (FP7 v2, Architecture)
   - **Действие:** Удалить

6. **Старые тесты:**
   - Все тесты в `front/__tests__/fp1/`, `fp2/`, `fp4/`, `fp5/`, `fp6/` для react-router маршрутов
   - **Причина:** Заменяются новыми тестами для shell-only контракта (FP7 v2, Tests Contract)
   - **Действие:** Удалить или переместить в `front/__tests__/legacy/`

### Миграционный путь

1. **M0 (Зачистка):** Удалить dead code, старые тесты, react-router маршруты
2. **M1-M5 (Реализация):** Построить новую архитектуру по контракту FP7 v2
3. **Постепенная миграция:** Старые тесты можно сохранить как legacy, постепенно мигрировать функциональность в shell-only модель

### Что сохранить

1. **Backend API структура:** Endpoints для games, teams, comments могут быть полезны для будущей интеграции
2. **Компоненты Win95:** Стилизованные компоненты можно переиспользовать
3. **VFS базовая структура:** Если уже реализована, можно адаптировать под новый контракт

---

## Appendix: Rewrite Checklist

**Порядок переписывания (по milestones):**

### Phase 1: Cleanup (M0)
- [ ] Удалить react-router из `App.tsx`
- [ ] Удалить CatalogPage, GamePage, TeamsPage, EditorPage
- [ ] Удалить старые тесты для react-router
- [ ] Удалить email/password auth код
- [ ] Удалить dead code (WindowContext, старый WindowManager)

### Phase 2: Shell Kernel (M1)
- [ ] Реализовать ShellRoot с Platform Context
- [ ] Реализовать DesktopShell (базовый)
- [ ] Реализовать MobileShell stub
- [ ] Написать тесты: `shell.boot.*.test.tsx`

### Phase 3: VFS + Explorer (M2)
- [ ] Реализовать VirtualFileSystem (in-memory, event-driven)
- [ ] Реализовать Explorer (Tree + Grid view)
- [ ] Интегрировать Desktop Icons с VFS
- [ ] Написать тесты: `explorer.*.test.tsx`, `desktop.icons.*.test.tsx`, `vfs.*.test.tsx`

### Phase 4: Viewers (M3)
- [ ] Реализовать ImageViewer
- [ ] Реализовать VideoViewer
- [ ] Реализовать Notepad
- [ ] Реализовать Internet Explorer
- [ ] Реализовать AppRegistry и правила открытия
- [ ] Написать тесты: `content.*-opens-*.test.tsx`

### Phase 5: Content Ops + S3 (M4)
- [ ] Реализовать Backend API для VFS/S3
- [ ] Реализовать S3 Service
- [ ] Реализовать VFS ↔ S3 синхронизацию
- [ ] Реализовать RBAC проверки
- [ ] Реализовать UI для Organizer
- [ ] Написать тесты: `vfs.*.test.tsx`, `auth.roles.test.tsx`

### Phase 6: Mobile (M5)
- [ ] Реализовать MobileShell (WM6 стилистика)
- [ ] Реализовать навигацию через экранные "приложения"
- [ ] Интегрировать контент открытие
- [ ] Написать тесты: `shell.boot.mobile.test.tsx`

### Phase 7: Security + Polish
- [ ] Реализовать iframe sandbox политику
- [ ] Реализовать PostMessage валидацию
- [ ] Реализовать viewport boundary enforcement
- [ ] Написать тесты: `security.*.test.tsx`, `window.viewport-boundary.test.tsx`

### Phase 8: Telegram Auth
- [ ] Реализовать Telegram auth endpoint
- [ ] Заменить email/password auth на Telegram
- [ ] Написать тесты: `auth.telegram.test.tsx`

---

---

## CHANGELOG

### Version 2.1 (2026-01-22)

**Добавлено:**

1. **DEV MODE авторизация:**
   - Добавлен режим `AUTH_MODE=dev | telegram` для платформы
   - Добавлен endpoint `/api/auth/dev` для локальной разработки и тестов
   - DEV MODE выдаёт JWT без проверки Telegram signature
   - **ЗАПРЕЩЁН в production** (явно указано в контракте)
   - **Раздел изменён:** API Contracts → Auth API

2. **Хранение ролей в БД:**
   - Уточнено, что роль пользователя хранится в БД как поле (`role: 'Guest' | 'Participant' | 'Organizer'`)
   - Зафиксировано, что назначение Organizer выполняется вручную через БД
   - Зафиксировано, что UI управления ролями не входит в MVP
   - Backend считается source of truth для ролей
   - **Раздел изменён:** Roles & Permissions → Хранение ролей

3. **Win95-style Auth & Control UI:**
   - Добавлено описание Taskbar Tray (справа в Taskbar)
     - User Icon: отображает статус авторизации
     - Clock: отображает локальное время пользователя
   - Добавлено описание системного окна User Panel:
     - Открывается кликом по User Icon в Tray
     - Windows 95 стилистика (отдельное окно, не Start Menu)
     - Отображает username, роль, кнопку Log out
     - (для Organizer) ссылку/кнопку на Admin/Management функции
   - **Раздел изменён:** UX Rules → Desktop (Windows 95) → пункт 2 и 6

4. **Архитектурные компоненты:**
   - Добавлен `UserPanelApp` как системное приложение
   - Уточнено, что Taskbar содержит Tray Area
   - Зафиксировано, что UserPanel не управляет ролями (только отображение + logout)
   - **Раздел изменён:** Architecture → Components → Frontend

5. **Тесты:**
   - Добавлены обязательные тесты:
     - `auth.dev-mode.test.tsx`: DEV MODE auth выдаёт JWT
     - `auth.user-panel.test.tsx`: User Panel открывается как окно
     - `auth.logout.test.tsx`: Logout работает
     - `ui.organizer-actions.test.tsx`: Organizer видит organizer-only UI actions
     - `ui.guest-participant-actions.test.tsx`: Guest/Participant не видят organizer actions
     - `taskbar.tray.test.tsx`: Taskbar Tray отображает User Icon и Clock
     - `taskbar.auth-status.test.tsx`: Taskbar отображает статус авторизации
   - Обновлён тест `auth.roles.test.tsx`: роль загружается из backend
   - **Раздел изменён:** Tests Contract → обязательные тесты

6. **Definitions:**
   - Добавлены термины: Taskbar Tray, User Panel, AUTH_MODE
   - **Раздел изменён:** Definitions

**Почему:**
- DEV MODE необходим для локальной разработки и тестирования без реального Telegram auth
- Хранение ролей в БД и ручное назначение Organizer — текущий этап MVP, UI управления ролями не требуется
- Win95-style системная панель управления пользователем обеспечивает единообразный UX и соответствует стилистике платформы

**End of FP7 v2.1 Contract Spec**
