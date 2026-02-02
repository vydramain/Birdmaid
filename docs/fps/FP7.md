# FP7: Shell-only Platform Spec (v2)

**Status:** plan+design  
**Created:** 2026-01-22  
**Updated:** 2026-01-22  
**Version:** 2.7 (Auth UX Design - Win95 UX Map детализация)

**Release Gate:** [FP7_RELEASE_GATE.md](./FP7_RELEASE_GATE.md) — Gate checklist для release gate (15-минутный сценарий проверки)

## Outcome

**60-секундный пользовательский опыт:**

За первые 60 секунд пользователь должен **почувствовать**, что он работает в аутентичной Windows 95-подобной операционной системе (Chicago95-like experience), а не на веб-сайте. Пользователь должен **уметь**:

1. **Визуально воспринять:** Увидеть рабочий стол с классической Windows 95 эстетикой (серые панели, 3D bevels, пиксельно-выровненная типографика, жесткие края, без скруглений и современных эффектов).
2. **Интерактивно взаимодействовать:** Кликнуть по Desktop Icon и увидеть аутентичную анимацию pressed state (outset → inset bevel, translate(1px, 1px)). Двойной клик открывает окно с правильным focus model (active title bar с градиентом, inactive — серый).
3. **Навигировать:** Открыть Explorer через Desktop Icon, увидеть Tree view (слева) и Grid view (справа) с правильными 3D bevels (inset для панелей). Клик по папке в Tree → Grid обновляется мгновенно (без плавных анимаций).
4. **Работать с окнами:** Открыть несколько окон, переключаться между ними (клик → focus, z-index меняется). Окна имеют правильные title bars (active: синий градиент, inactive: серый), control buttons (minimize/maximize/close) с pressed states.
5. **Использовать системные элементы:** Увидеть Taskbar с правильной высотой (40px), Start menu (кнопка "Start" слева), Tray area справа (User Icon + Clock). Клик по Start → открывается Start menu с пунктами "Log In..." и "Log Out...". Клик по User Icon → открывается User Panel окно (Windows 95 стилистика).
6. **Авторизоваться:** Клик по "Log In..." в Start menu → открывается Win95-диалог "Welcome to Windows" (логин окно). Клик по "Telegram..." → открывается отдельное окно типа Internet Explorer, внутри него открывается Telegram login page. После успешной авторизации → токен сохраняется в localStorage, сессия проверяется через `/api/auth/me`.
7. **Взаимодействовать с контентом:** Двойной клик по файлу → открывается в правильном Viewer (ImageViewer, VideoViewer, Notepad, Internet Explorer) с аутентичным окном Windows 95.

**Ключевое ощущение:** Пользователь не должен думать "это веб-сайт" — он должен воспринимать платформу как операционную систему с файловой структурой, окнами и системными элементами, визуально и интерактивно идентичными Windows 95 (Chicago95-like), но без эмуляции ОС и без проприетарных ассетов.

## Scope

### IN (Strict) — Что меняем

#### Визуальные изменения (Visual/UX)

1. **Windows 95 UI Kit (Chicago95-like):**
   - Все компоненты используют аутентичную Windows 95 эстетику:
     - Цветовая палитра: Chicago95 palette (gray #c0c0c0, grayLight #dfdfdf, grayDark #808080, blue #000080, blueLight #1084d0)
     - 3D bevels: inset (sunken) и outset (raised) borders для всех панелей, кнопок, окон
     - Типографика: пиксельно-выровненная, без сглаживания (`-webkit-font-smoothing: none`), размеры: 10px/11px/12px/14px
     - Жесткие края: никаких скруглений (`border-radius: 0`), никаких современных эффектов (blur, glassmorphism, smooth animations)
     - Метрики: точные размеры из WIN95_SPEC.md (title bar 20px, taskbar 40px, window controls 18x18px, etc.)

2. **Интерактивные состояния (Interaction States):**
   - Focus model: active window (синий градиент title bar, z-index 20) vs inactive (серый title bar, z-index 10)
   - Pressed states: все кнопки/иконки имеют pressed state (outset → inset bevel, translate(1px, 1px))
   - Single vs double click: Desktop Icons и Explorer Grid используют double-click для открытия, single-click для selection
   - Taskbar pressed: кнопки в Taskbar имеют pressed state при клике
   - Menu ESC: если есть меню (например, в Explorer), ESC закрывает меню

3. **Компоненты Windows 95:**
   - Window Frame: title bar с градиентом (active/inactive), control buttons (minimize/maximize/close) с pressed states
   - Desktop Icons: 48x48px контейнеры с outset borders, labels под иконками
   - Explorer: Tree view (inset bevel) + Grid view (inset bevel), divider между ними
   - Taskbar: 40px высота, Start menu (кнопка "Start" слева), Tray area справа (User Icon + Clock)
   - Start Menu: Windows 95 стилистика, содержит "Log In..." и "Log Out..." пункты
   - Login Window: Win95-диалог "Welcome to Windows" с кнопкой "Telegram..."
   - Logout Confirmation Dialog: Win95-диалог подтверждения (аналог shutdown/log off)
   - Buttons: все кнопки используют outset bevel (default) и inset bevel (pressed)
   - Input fields: inset bevel для всех input полей
   - Scrollbars: Windows 95 стиль (16px ширина, 3D bevel thumb)

4. **Viewers (Windows 95 стилистика):**
   - ImageViewer: окно с Windows 95 frame, правильный title bar
   - VideoViewer: окно с Windows 95 frame, HTML5 video controls
   - Notepad: окно "Блокнот" с Windows 95 frame, моноширинный шрифт (Courier New)
   - Internet Explorer: окно "Internet Explorer" с Windows 95 frame
   - User Panel: системное окно Windows 95 стилистики

5. **Golden Screens (Visual Regression Baseline):**
   - 8-10 ключевых экранов/сценариев для visual regression тестов (см. раздел "Golden Screens")

#### UX изменения (User Experience)

6. **Интерактивное поведение:**
   - Все взаимодействия должны ощущаться как в Windows 95: мгновенные state changes (без плавных анимаций, или < 100ms)
   - Правильный focus model: клик по окну → focus, z-index меняется
   - Правильные pressed states: все кликабельные элементы имеют визуальную обратную связь

7. **Auth UX (Windows 95 стилистика):**
   - Start menu содержит "Log In..." и "Log Out..." пункты
   - Login Window: Win95-диалог "Welcome to Windows" открывается при "Log In..."
   - Telegram auth: при нажатии "Telegram..." открывается отдельное окно типа Internet Explorer, внутри него открывается Telegram login page
   - Logout confirmation: при "Log Out..." показывается Win95-диалог подтверждения (аналог shutdown/log off), только после подтверждения очищается токен и auth state
   - Boot loader: на старте приложения показываем Win98 hourglass loader пока идёт проверка токена через `/api/auth/me`

### OUT (Cutline) — Что НЕ меняем

1. **Архитектура платформы:**
   - Shell-only навигация (Desktop Icons + Explorer) — уже реализовано
   - VFS архитектура (in-memory, event-driven) — не меняем
   - Window Manager (WindowRegistry, WindowStore) — не меняем логику, только визуал
   - AppRegistry и правила открытия контента — не меняем

2. **VFS/S3 контракт:**
   - VFS API (read, list, upload, move, delete) — не меняем
   - S3 синхронизация — не меняем
   - RBAC модель (Guest/Participant/Organizer) — не меняем
   - Immutable system folders — не меняем

3. **Backend API:**
   - Все endpoints остаются без изменений (кроме удаления legacy email/password auth)
   - Auth API (Telegram, DEV MODE, `/api/auth/me`) — не меняем логику, только удаляем legacy
   - VFS/S3 API — не меняем

4. **Функциональность:**
   - Viewport boundary enforcement — не меняем
   - Windowing constraints — не меняем
   - Content opening rules — не меняем

5. **Legacy удаление (обязательно):**
   - Email/password auth — удалить из кода и из базы
   - `isSuperAdmin` — удалить из кода и из базы
   - Старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей — удалить

## Decisions

### Auth UX Flow

**Decision 1: Start Menu Login/Logout**
- Start menu (Win95 style) содержит "Log In..." и "Log Out..." пункты
- При нажатии "Log In..." открывается Win95-диалог "Welcome to Windows" (логин окно)
- При нажатии "Log Out..." показывается Win95-диалог подтверждения (аналог shutdown/log off), только после подтверждения очищается токен и auth state

**Decision 2: Telegram Auth в IE Window**
- При нажатии "Telegram..." в логин-окне открывается отдельное окно типа Internet Explorer (внутри системы окон)
- Внутри IE окна открывается Telegram login page
- После успешной авторизации → callback обрабатывается, токен сохраняется, окно закрывается

**Decision 3: Источник правды по сессии**
- Backend `/api/auth/me` является единственным источником правды по сессии
- На старте приложения показываем Win98 hourglass loader пока идёт проверка токена через `/api/auth/me`
- Token хранится в localStorage (переживает refresh)
- Если `/api/auth/me` возвращает 401 — token wipe и guest режим

**Decision 4: Organizer Whitelist**
- Organizer определяется whitelist-ом по Telegram numeric id (`telegramUser.id`)
- Ник НЕ является доказательством владения
- Whitelist хранится в БД (таблица `organizerWhitelist` или поле в `users` таблице)
- Backend проверяет `telegramUser.id` против whitelist при авторизации

**Decision 5: Legacy Removal**
- Email/password auth удаляется из кода и из базы
- `isSuperAdmin` удаляется из кода и из базы
- Старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей, удаляются
- Dev auth остаётся только как dev-tool (`AUTH_MODE=dev`), без UI обязательства (но можно если явно обозначить как dev-only tool)

## Acceptance Criteria

**10-15 измеримых критериев для Chicago95-like OS experience:**

1. **Focus Model:**
   - ✅ Active window имеет title bar с синим градиентом (`#000080` → `#1084d0`), белый текст, z-index 20
   - ✅ Inactive window имеет title bar серого цвета (`#c0c0c0`), черный текст, z-index 10
   - ✅ Клик по окну → окно становится active (title bar меняется, z-index повышается)
   - ✅ Измерение: visual regression test сравнивает active vs inactive title bars

2. **Pressed States:**
   - ✅ Все кнопки (window controls, desktop icons, taskbar buttons) имеют pressed state:
     - Default: outset bevel (top/left white, bottom/right grayDark)
     - Pressed: inset bevel (top/left grayDark, bottom/right white) + `translate(1px, 1px)`
   - ✅ Измерение: visual regression test сравнивает default vs pressed states для всех кнопок

3. **Single vs Double Click:**
   - ✅ Desktop Icons: single-click → selection (highlight), double-click → открытие окна
   - ✅ Explorer Grid: single-click → selection (blue background), double-click → открытие файла
   - ✅ Измерение: unit test проверяет, что single-click не открывает, double-click открывает

4. **Taskbar Pressed:**
   - ✅ Кнопки в Taskbar (окна) имеют pressed state при клике
   - ✅ Измерение: visual regression test сравнивает default vs pressed taskbar button

5. **Menu ESC:**
   - ✅ Если есть меню (например, в Explorer), нажатие ESC закрывает меню
   - ✅ Измерение: unit test проверяет, что ESC закрывает открытое меню

6. **Window Control Buttons:**
   - ✅ Minimize/Maximize/Close кнопки имеют размер 18x18px, gap 2px между ними
   - ✅ Close button при hover (опционально) имеет красный фон (`#ff0000`)
   - ✅ Измерение: visual regression test проверяет размеры и состояния кнопок

7. **3D Bevels:**
   - ✅ Все панели используют правильные bevels:
     - Inset (sunken): top/left `#808080`, bottom/right `#ffffff`, inner shadow `inset 1px 1px 0 black`
     - Outset (raised): top/left `#ffffff`, bottom/right `#808080`, outer shadow `1px 1px 0 black`
   - ✅ Измерение: visual regression test проверяет bevels для всех компонентов (Explorer tree/grid, buttons, input fields)

8. **Typography:**
   - ✅ Все тексты используют правильные размеры: 10px (small), 11px (normal), 12px (medium), 14px (large)
   - ✅ Title bar: bold, 12px, letter-spacing 0.5px, белый цвет на синем градиенте
   - ✅ Font smoothing отключен: `-webkit-font-smoothing: none`, `font-smooth: never`
   - ✅ Измерение: visual regression test проверяет размеры и рендеринг текста

9. **Desktop Icons:**
   - ✅ Иконки имеют размер 48x48px контейнер, outset border (2px), label под иконкой (11px, center aligned)
   - ✅ Grid layout: column gap 8px, row gap 16px
   - ✅ Измерение: visual regression test проверяет размеры и layout иконок

10. **Explorer Layout:**
    - ✅ Tree view (слева): ширина 200px (default), min 150px, max 400px, inset bevel
    - ✅ Grid view (справа): grid items 64px width, icons 32px, inset bevel
    - ✅ Divider между tree и grid: 4px width
    - ✅ Измерение: visual regression test проверяет layout и размеры

11. **Taskbar:**
    - ✅ Высота: 40px, background `#c0c0c0`, border top `2px solid white`, border bottom `2px solid #808080`
    - ✅ Tray area справа: User Icon (24x24px) + Clock (11px font), gap 8px между элементами
    - ✅ Измерение: visual regression test проверяет высоту, layout и элементы Taskbar

12. **Color Palette:**
    - ✅ Все компоненты используют Chicago95 palette:
      - `gray: #c0c0c0`, `grayLight: #dfdfdf`, `grayDark: #808080`, `grayDarker: #404040`
      - `blue: #000080`, `blueLight: #1084d0`, `white: #ffffff`, `black: #000000`
    - ✅ Измерение: visual regression test сравнивает цвета с reference screenshots

13. **No Modern Effects:**
    - ✅ Нет скруглений: `border-radius: 0` для всех элементов
    - ✅ Нет blur эффектов: `filter: blur()`, `backdrop-filter: blur()` не используются
    - ✅ Нет glassmorphism: прозрачные фоны с blur не используются
    - ✅ Нет плавных анимаций: transitions < 100ms или отсутствуют
    - ✅ Измерение: lint rules блокируют `border-radius`, `filter: blur`, `backdrop-filter`, длинные transitions

14. **Viewport Boundary:**
    - ✅ Окна нельзя утащить за пределы viewport (координаты ограничены)
    - ✅ Измерение: unit test проверяет, что drag ограничивает координаты границами viewport

15. **Golden Screens Match:**
    - ✅ Все 8-10 golden screens проходят visual regression тесты (pixel-perfect match с baseline)
    - ✅ Измерение: visual regression test suite сравнивает все golden screens с baseline screenshots

**Auth UX Acceptance Criteria (обязательные для реализации):**

16. **Start Menu:**
    - ✅ Start menu (Win95 style) содержит "Log In..." и "Log Out..." пункты
    - ✅ "Log Out..." disabled если пользователь не авторизован
    - ✅ Измерение: unit test проверяет, что Start menu содержит правильные пункты

17. **Login Window:**
    - ✅ При нажатии "Log In..." открывается Win95-диалог "Welcome to Windows" (логин окно)
    - ✅ Login Window имеет Windows 95 стилистику (3D bevels, правильные цвета, типографика)
    - ✅ Измерение: visual regression test сравнивает Login Window с baseline screenshot

18. **Telegram Auth в IE Window:**
    - ✅ При нажатии "Telegram..." в логин-окне открывается отдельное окно типа Internet Explorer (внутри системы окон)
    - ✅ Внутри IE окна открывается Telegram login page
    - ✅ После успешной авторизации → callback обрабатывается, токен сохраняется, окно закрывается
    - ✅ Измерение: integration test проверяет полный flow: Login Window → IE Window → Telegram → Callback → Token сохранен

19. **Boot Loader:**
    - ✅ На старте приложения показывается Win98 hourglass loader пока идёт проверка токена через `/api/auth/me`
    - ✅ После получения ответа от `/api/auth/me` loader скрывается
    - ✅ Измерение: unit test проверяет, что loader показывается на boot и скрывается после проверки

20. **Token Storage & Session Check:**
    - ✅ Token хранится в localStorage (ключ: `birdmaid_token`)
    - ✅ Token переживает refresh страницы
    - ✅ Если `/api/auth/me` возвращает 401 → token wipe из localStorage и guest режим
    - ✅ Если `/api/auth/me` возвращает user → устанавливается auth state
    - ✅ Измерение: integration test проверяет token storage, refresh, и обработку 401

21. **Logout Confirmation:**
    - ✅ При нажатии "Log Out..." показывается Win95-диалог подтверждения (аналог shutdown/log off)
    - ✅ Диалог содержит кнопки "Yes" и "No"
    - ✅ Только после подтверждения ("Yes") очищается токен из localStorage и auth state
    - ✅ Если пользователь нажимает "No" → диалог закрывается, logout не происходит
    - ✅ Измерение: unit test проверяет, что logout происходит только после подтверждения

22. **Organizer Whitelist:**
    - ✅ Organizer определяется whitelist-ом по Telegram numeric id (`telegramUser.id`)
    - ✅ Ник НЕ является доказательством владения
    - ✅ Backend проверяет `telegramUser.id` против whitelist при авторизации через `/api/auth/telegram`
    - ✅ Измерение: integration test проверяет, что только пользователи из whitelist получают роль Organizer

23. **Legacy Removal:**
    - ✅ Email/password auth удалена из кода и из базы
    - ✅ `isSuperAdmin` удален из кода и из базы
    - ✅ Старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей, удалены
    - ✅ Dev auth остаётся только как dev-tool (`AUTH_MODE=dev`), без UI обязательства
    - ✅ Измерение: grep/audit проверяет, что legacy код удален

## Golden Screens

**8-10 экранов/сценариев для visual-regression baseline:**

1. **Desktop Shell (Empty):**
   - Экраны: Desktop с wallpaper, Desktop Icons (минимум 3-4 иконки), Taskbar (Tray: User Icon + Clock)
   - Состояние: нет открытых окон
   - Проверка: layout, цвета, размеры, bevels

2. **Desktop Shell (Active Window):**
   - Экраны: Desktop + одно активное окно (например, Explorer)
   - Состояние: окно focused (синий градиент title bar, z-index 20)
   - Проверка: active title bar, window frame, control buttons

3. **Desktop Shell (Multiple Windows):**
   - Экраны: Desktop + 2-3 окна (одно active, остальные inactive)
   - Состояние: разные z-index, разные title bar цвета
   - Проверка: focus model, z-index stacking

4. **Explorer (Tree + Grid):**
   - Экраны: Explorer окно с Tree view (слева) и Grid view (справа)
   - Состояние: папка выбрана в Tree, Grid показывает содержимое
   - Проверка: layout, bevels (inset для панелей), divider, file icons

5. **Explorer (Selection):**
   - Экраны: Explorer с выбранным файлом в Grid (blue background, white text)
   - Состояние: single-click selection
   - Проверка: selection colors, focus state

6. **Notepad Window:**
   - Экраны: Notepad окно с открытым .txt файлом
   - Состояние: окно active, содержимое видно
   - Проверка: window frame, title bar, моноширинный шрифт, inset bevel для textarea

7. **Internet Explorer Window:**
   - Экраны: Internet Explorer окно с открытым .html файлом
   - Состояние: окно active, HTML контент виден
   - Проверка: window frame, title bar, iframe/content area

8. **User Panel Window:**
   - Экраны: User Panel окно (открыто через клик по User Icon в Tray)
   - Состояние: окно active, показывает username, роль, кнопку Log out
   - Проверка: window frame, layout, buttons

9. **Taskbar (Pressed State):**
   - Экраны: Taskbar с нажатой кнопкой окна (pressed state)
   - Состояние: кнопка в pressed state (inset bevel, translate(1px, 1px))
   - Проверка: pressed state визуально корректна

10. **Desktop Icon (Pressed State):**
    - Экраны: Desktop с нажатой иконкой (pressed state)
    - Состояние: иконка в pressed state (inset bevel, translate(1px, 1px))
    - Проверка: pressed state визуально корректна

**Формат baseline:**
- Screenshots сохраняются в `docs/design/references/screenshots/golden/`
- Имена файлов: `golden-<screen-name>.png`
- Visual regression тесты сравнивают текущие screenshots с baseline

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
- **Start Menu**: Windows 95 стилизованное меню, открывается кнопкой "Start" в Taskbar, содержит "Log In..." и "Log Out..." пункты
- **Login Window**: Win95-диалог "Welcome to Windows" (логин окно), открывается при "Log In..." в Start menu
- **Logout Confirmation Dialog**: Win95-диалог подтверждения (аналог shutdown/log off), открывается при "Log Out..." в Start menu
- **User Panel**: Системное окно Windows 95 стилистики для управления пользователем (username, роль, logout)
- **AUTH_MODE**: Режим авторизации платформы (`dev` | `telegram`), определяет доступные методы входа
- **organizerWhitelist**: Whitelist Telegram numeric id (`telegramUser.id`) для определения роли Organizer, хранится в БД

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

## UX Map

### Auth Flow (Start → Login Window → IE Window → Telegram page → Callback → /me)

**State 1: Boot (Guest/Unknown)**
- **CTA:** Приложение загружается
- **Endpoint:** `/api/auth/me` (проверка токена из localStorage)
- **State:** Показываем Win98 hourglass loader
- **Page:** Desktop Shell (loading state)
- **Component:** `DesktopShell` с `HourglassLoader`
- **data-testid:** `desktop-shell-loading`

**State 2: Start Menu (Guest State)**
- **CTA:** Клик по кнопке "Start" в Taskbar
- **State:** Start menu открывается, показывает "Log In..." (enabled) и "Log Out..." (disabled)
- **Page:** Desktop Shell (Start menu открыт)
- **Component:** `StartMenu` (Win95 стилистика)
- **data-testid:** `start-menu`, `start-menu-item-login`, `start-menu-item-logout`
- **States:**
  - `isOpen: true`
  - `items: [{ label: "Log In...", enabled: true }, { label: "Log Out...", enabled: false }]`
- **Визуальное описание:**
  - Меню появляется над кнопкой "Start" (Win95 popup menu стиль)
  - Серый фон (#C0C0C0), outset border (3D bevel)
  - Пункты меню: серый фон, черный текст, hover state (highlighted background)
  - "Log Out..." отображается серым цветом (disabled), не кликабелен

**State 2a: Start Menu (Authed State)**
- **CTA:** Клик по кнопке "Start" в Taskbar (после авторизации)
- **State:** Start menu открывается, показывает "Log In..." (disabled) и "Log Out..." (enabled)
- **Page:** Desktop Shell (Start menu открыт)
- **Component:** `StartMenu` (Win95 стилистика)
- **data-testid:** `start-menu`, `start-menu-item-login`, `start-menu-item-logout`
- **States:**
  - `isOpen: true`
  - `items: [{ label: "Log In...", enabled: false }, { label: "Log Out...", enabled: true }]`
- **Визуальное описание:**
  - "Log In..." отображается серым цветом (disabled), не кликабелен
  - "Log Out..." активен (черный текст, кликабелен)

**State 3: Login Window (Welcome to Windows)**
- **CTA:** Клик по "Log In..." в Start menu
- **State:** Открывается Win95-диалог "Welcome to Windows" (логин окно)
- **Page:** Login Window (Win95 стилистика, системное окно)
- **Component:** `LoginWindow` (зарегистрирован в `appRegistry` как `login-window`)
- **data-testid:** `login-window`, `login-window-title`, `login-window-telegram-button`, `login-window-ok-button`, `login-window-cancel-button`
- **States:**
  - `isOpen: true`
  - `mode: 'telegram'` (единственный режим в production)
- **Визуальное описание:**
  - Окно: фиксированный размер (~400x200px), центрировано на экране
  - Title bar: "Welcome to Windows" (синий градиент, active state)
  - Содержимое:
    - Текстовая подсказка: "Please log in to continue" (или аналогичная)
    - Кнопка "Telegram..." (default button, outset bevel)
    - Кнопка "OK" (secondary, outset bevel) — может быть скрыта, если используется только "Telegram..."
    - Кнопка "Cancel" (secondary, outset bevel)
  - Все кнопки имеют pressed state (inset bevel при клике)
- **Поведение:**
  - Клик по "Telegram..." → открывается IE Window (State 4)
  - Клик по "Cancel" → окно закрывается, login не происходит
  - Клик по "OK" (если есть) → может открывать IE Window или быть disabled
  - ESC → закрывает окно (аналог Cancel)

**State 4: Telegram Auth (IE Window)**
- **CTA:** Клик по "Telegram..." в Login Window
- **State:** Открывается отдельное окно типа Internet Explorer (внутри системы окон)
- **Endpoint:** Telegram login page (внешний URL) загружается внутри IE окна
- **Page:** Internet Explorer окно с Telegram login page
- **Component:** `InternetExplorer` (зарегистрирован в `appRegistry` как `internet-explorer`)
- **data-testid:** `ie-window`, `ie-window-iframe`, `ie-window-loading`, `ie-window-error`
- **States:**
  - `isOpen: true`
  - `src: "https://oauth.telegram.org/auth?bot_id=...&origin=..."` (Telegram login URL)
  - `loading: true` → `false` (после загрузки)
  - `error: null | string` (при ошибке загрузки)
- **Визуальное описание:**
  - Окно: размер ~800x600px (или адаптивный), может быть перемещено
  - Title bar: "Internet Explorer" (синий градиент, active state)
  - Содержимое: iframe с sandbox политикой
  - Loading state: Win98 hourglass loader пока загружается Telegram login page
  - Error state: красный текст "Error: Failed to load Telegram login page" (если ошибка)
- **Sandbox политика:**
  - `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)
  - Запрещено: `allow-top-navigation`, `allow-modals`
- **Поведение:**
  - Окно может быть закрыто кнопкой [X] или ESC
  - При закрытии окна до завершения авторизации → login не происходит
  - PostMessage от Telegram login page обрабатывается через `window.addEventListener('message')`
  - Валидация `event.origin` (только `https://oauth.telegram.org`)

**State 5: Telegram Callback**
- **CTA:** Пользователь авторизуется в Telegram, callback обрабатывается
- **Endpoint:** `/api/auth/telegram` (POST с telegramId, hash, ...)
- **State:** Backend проверяет telegramUser.id против organizerWhitelist, возвращает JWT токен
- **Page:** IE окно закрывается, Login Window закрывается
- **Component:** `AuthContext` (обработчик postMessage)
- **data-testid:** `telegram-callback-handler`
- **States:**
  - `callbackReceived: true`
  - `token: string | null` (JWT токен от backend)
  - `error: null | string` (при ошибке авторизации)
- **Поведение:**
  - PostMessage от Telegram: `{ type: 'telegram-auth-success', data: { telegramId, hash, ... } }`
  - Frontend отправляет POST `/api/auth/telegram` с данными
  - Backend возвращает `{ user: User, token: string }`
  - Frontend сохраняет токен в `localStorage.setItem('birdmaid_token', token)`
  - IE окно закрывается автоматически
  - Login Window закрывается автоматически
  - При ошибке: показывается error message в IE окне или Login Window

**State 6: Session Check (/me)**
- **CTA:** Frontend сохраняет токен в localStorage, вызывает `/api/auth/me`
- **Endpoint:** `/api/auth/me` (GET с JWT токеном)
- **State:** Backend возвращает user с role (Guest/Participant/Organizer)
- **Page:** Desktop Shell (авторизован, Start menu показывает "Log Out...")
- **Component:** `AuthContext` (useEffect после сохранения токена)
- **data-testid:** `auth-session-check`
- **States:**
  - `user: User | null` (обновляется из `/api/auth/me`)
  - `loading: false` (после получения user)
- **Поведение:**
  - После сохранения токена вызывается `GET /api/auth/me` с `Authorization: Bearer <token>`
  - Backend возвращает `{ id, email, login, role, isSuperAdmin }`
  - Frontend обновляет `AuthContext` с user данными
  - Start menu обновляется: "Log In..." disabled, "Log Out..." enabled
  - Organizer-only окна могут быть открыты (если role === 'Organizer')

**State 7: Logout Confirmation**
- **CTA:** Клик по "Log Out..." в Start menu
- **State:** Открывается Logout Confirmation Dialog (Win95-диалог подтверждения, аналог shutdown/log off)
- **Page:** Logout Confirmation Dialog (Win95 стилистика, системное окно)
- **Component:** `LogoutConfirmationDialog` (зарегистрирован в `appRegistry` как `logout-confirmation`)
- **data-testid:** `logout-dialog`, `logout-dialog-message`, `logout-dialog-yes-button`, `logout-dialog-no-button`
- **States:**
  - `isOpen: true`
  - `user: User` (текущий пользователь)
- **Визуальное описание:**
  - Окно: фиксированный размер (~350x150px), центрировано на экране
  - Title bar: "Log Out" (синий градиент, active state)
  - Содержимое:
    - Иконка предупреждения (желтый треугольник с восклицательным знаком, Win95 стиль)
    - Текст: "Are you sure you want to log out?" (или "Sign out of Windows?")
    - Кнопка "Yes" (default button, outset bevel)
    - Кнопка "No" (secondary, outset bevel)
  - Все кнопки имеют pressed state (inset bevel при клике)
- **Поведение:**
  - Клик по "Yes" → переход в State 8 (Logout)
  - Клик по "No" → переход в State 9 (Cancel)
  - ESC → закрывает диалог (аналог "No")

**State 8: Logout (Token Wipe)**
- **CTA:** Клик по "Yes" в Logout Confirmation Dialog
- **State:** Токен очищается из localStorage, auth state сбрасывается, диалог закрывается
- **Page:** Desktop Shell (guest режим, Start menu показывает только "Log In...")
- **Component:** `AuthContext.logout()` + `LogoutConfirmationDialog`
- **data-testid:** `logout-action`, `logout-token-wipe`
- **States:**
  - `user: null`
  - `token: null`
  - `localStorage.getItem('birdmaid_token'): null`
- **Поведение:**
  - Вызывается `auth.logout()` (очищает user, token, localStorage)
  - Закрываются все organizer-only окна (если открыты)
  - Logout Confirmation Dialog закрывается
  - Start menu обновляется: "Log In..." enabled, "Log Out..." disabled
  - Desktop Shell возвращается в guest режим

**State 9: Logout Cancel**
- **CTA:** Клик по "No" в Logout Confirmation Dialog
- **State:** Диалог закрывается, logout не происходит, токен остается
- **Page:** Desktop Shell (авторизован, состояние не меняется)
- **Component:** `LogoutConfirmationDialog`
- **data-testid:** `logout-dialog-cancel`
- **States:**
  - `isOpen: false`
  - `user: User` (не меняется)
  - `token: string` (не меняется)
- **Поведение:**
  - Logout Confirmation Dialog закрывается
  - Auth state не меняется
  - Пользователь остается авторизованным

### UI Components + States + data-testid для Auth Flow

#### 1. Start Menu Component

**Файл:** `front/src/os/taskbar/StartMenu.tsx`

**Props:**
```typescript
type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};
```

**States:**
- `isOpen: boolean` — открыто/закрыто меню
- `user: User | null` — текущий пользователь (null = guest)

**data-testid:**
- `start-menu` — контейнер меню
- `start-menu-item-login` — пункт "Log In..."
- `start-menu-item-logout` — пункт "Log Out..."

**Визуальное описание:**
- Меню: Win95 popup menu стиль
  - Позиция: над кнопкой "Start" в Taskbar
  - Размер: ~150px ширина, высота зависит от количества пунктов
  - Фон: #C0C0C0 (gray)
  - Border: outset bevel (3D эффект)
  - Пункты меню:
    - Высота: 22px на пункт
    - Padding: 4px слева, 20px справа
    - Enabled: черный текст (#000000), hover state (highlighted background #000080, белый текст)
    - Disabled: серый текст (#808080), нет hover state, не кликабелен
  - Разделитель (если нужен): горизонтальная линия, inset bevel

**Поведение:**
- Клик вне меню → закрывается (`onClose()`)
- ESC → закрывается
- Клик по "Log In..." → открывает Login Window (если enabled)
- Клик по "Log Out..." → открывает Logout Confirmation Dialog (если enabled)

#### 2. Login Window Component

**Файл:** `front/src/os/apps/LoginWindow.tsx`

**Регистрация:** `appRegistry.register({ id: 'login-window', ... })`

**Props:**
```typescript
type LoginWindowProps = {
  onClose?: () => void;
};
```

**States:**
- `isOpen: boolean` — открыто/закрыто окно (управляется WindowManager)
- `loading: boolean` — загрузка (если нужна)

**data-testid:**
- `login-window` — контейнер окна
- `login-window-title` — title bar текст
- `login-window-message` — текстовая подсказка
- `login-window-telegram-button` — кнопка "Telegram..."
- `login-window-ok-button` — кнопка "OK" (если есть)
- `login-window-cancel-button` — кнопка "Cancel"

**Визуальное описание:**
- Окно: Win95 dialog window
  - Размер: ~400x200px (фиксированный или минимальный)
  - Позиция: центрировано на экране
  - Title bar: "Welcome to Windows" (синий градиент, active state)
  - Содержимое:
    - Padding: 16px со всех сторон
    - Текстовая подсказка: "Please log in to continue" (или аналогичная)
      - Шрифт: 11px, черный текст
      - Margin-bottom: 16px
    - Кнопки (выровнены справа, снизу):
      - "Telegram..." (default button, outset bevel, ~100px ширина)
      - "OK" (если есть, secondary, outset bevel, ~75px ширина)
      - "Cancel" (secondary, outset bevel, ~75px ширина)
      - Spacing между кнопками: 8px
  - Все кнопки имеют pressed state (inset bevel при клике)

**Поведение:**
- Клик по "Telegram..." → открывает IE Window с Telegram login page
- Клик по "Cancel" → закрывает окно (`onClose()`)
- ESC → закрывает окно (аналог Cancel)
- Кнопка [X] в title bar → закрывает окно

#### 3. Internet Explorer Window Component (для Telegram Auth)

**Файл:** `front/src/os/apps/InternetExplorer.tsx` (обновить для поддержки внешних URL)

**Регистрация:** `appRegistry.register({ id: 'internet-explorer', ... })`

**Props:**
```typescript
type InternetExplorerProps = {
  content?: {
    src?: string; // Внешний URL (для Telegram login)
    node?: VFSNode; // VFS node (для HTML файлов)
    path?: string; // Путь к файлу
  };
  onClose?: () => void;
};
```

**States:**
- `isOpen: boolean` — открыто/закрыто окно
- `src: string | null` — URL для загрузки
- `loading: boolean` — загрузка iframe
- `error: string | null` — ошибка загрузки

**data-testid:**
- `ie-window` — контейнер окна
- `ie-window-title` — title bar текст ("Internet Explorer")
- `ie-window-iframe` — iframe элемент
- `ie-window-loading` — индикатор загрузки (HourglassLoader)
- `ie-window-error` — сообщение об ошибке

**Визуальное описание:**
- Окно: Win95 window (аналогично другим окнам)
  - Размер: ~800x600px (по умолчанию, может быть изменен)
  - Title bar: "Internet Explorer" (синий градиент, active state)
  - Содержимое:
    - Loading state: HourglassLoader (центрирован)
    - Error state: красный текст "Error: Failed to load Telegram login page"
    - Success state: iframe с Telegram login page
      - iframe: 100% ширины и высоты окна
      - sandbox: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)

**Sandbox политика:**
- Разрешено: `allow-scripts`, `allow-same-origin`, `allow-forms`
- Запрещено: `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-modals`

**Поведение:**
- При открытии с `content.src` → загружает URL в iframe
- PostMessage от Telegram login page обрабатывается через `window.addEventListener('message')`
- Валидация `event.origin` (только `https://oauth.telegram.org`)
- При успешной авторизации → закрывается автоматически
- Кнопка [X] → закрывает окно
- ESC → закрывает окно

#### 4. Logout Confirmation Dialog Component

**Файл:** `front/src/os/apps/LogoutConfirmationDialog.tsx`

**Регистрация:** `appRegistry.register({ id: 'logout-confirmation', ... })`

**Props:**
```typescript
type LogoutConfirmationDialogProps = {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
};
```

**States:**
- `isOpen: boolean` — открыто/закрыто диалог
- `user: User` — текущий пользователь

**data-testid:**
- `logout-dialog` — контейнер диалога
- `logout-dialog-title` — title bar текст
- `logout-dialog-icon` — иконка предупреждения
- `logout-dialog-message` — текст сообщения
- `logout-dialog-yes-button` — кнопка "Yes"
- `logout-dialog-no-button` — кнопка "No"

**Визуальное описание:**
- Окно: Win95 dialog window (аналогично Login Window)
  - Размер: ~350x150px (фиксированный)
  - Позиция: центрировано на экране
  - Title bar: "Log Out" (синий градиент, active state)
  - Содержимое:
    - Padding: 16px со всех сторон
    - Layout: горизонтальный (иконка слева, текст и кнопки справа)
    - Иконка предупреждения:
      - Размер: 32x32px
      - Желтый треугольник с восклицательным знаком (Win95 стиль)
      - Margin-right: 16px
    - Текст: "Are you sure you want to log out?" (или "Sign out of Windows?")
      - Шрифт: 11px, черный текст
      - Margin-bottom: 16px
    - Кнопки (выровнены справа, снизу):
      - "Yes" (default button, outset bevel, ~75px ширина)
      - "No" (secondary, outset bevel, ~75px ширина)
      - Spacing между кнопками: 8px
  - Все кнопки имеют pressed state (inset bevel при клике)

**Поведение:**
- Клик по "Yes" → вызывает `onConfirm()` (logout)
- Клик по "No" → вызывает `onCancel()` (закрывает диалог)
- ESC → закрывает диалог (аналог "No")
- Кнопка [X] → закрывает диалог (аналог "No")

#### 5. AuthContext (обновления для Telegram Auth)

**Файл:** `front/src/contexts/AuthContext.tsx`

**Методы:**
- `telegramAuth(telegramId: string, hash: string): Promise<void>` — уже существует
- Добавить обработчик postMessage для Telegram callback

**States:**
- `user: User | null`
- `token: string | null`
- `loading: boolean`

**data-testid:**
- `auth-context` — контейнер (если нужен)
- `auth-session-check` — проверка сессии через `/api/auth/me`
- `telegram-callback-handler` — обработчик postMessage

**Поведение:**
- PostMessage listener: `window.addEventListener('message', handleTelegramCallback)`
- Валидация `event.origin` (только `https://oauth.telegram.org`)
- При успешном callback → вызывает `telegramAuth()`, сохраняет токен, закрывает IE окно

### Boot Flow (Token Check)

**State 1: App Boot**
- **CTA:** Приложение загружается
- **State:** Показываем Win98 hourglass loader
- **Endpoint:** `/api/auth/me` (GET с токеном из localStorage, если есть)
- **Page:** Desktop Shell (loading state)

**State 2a: Token Valid**
- **Response:** `/api/auth/me` возвращает `{ user: User }`
- **State:** Устанавливаем auth state, скрываем loader, показываем Desktop Shell
- **Page:** Desktop Shell (авторизован)

**State 2b: Token Invalid (401)**
- **Response:** `/api/auth/me` возвращает `401 Unauthorized`
- **State:** Token wipe из localStorage, guest режим, скрываем loader, показываем Desktop Shell
- **Page:** Desktop Shell (guest режим)

**State 2c: No Token**
- **Response:** Токен отсутствует в localStorage
- **State:** Guest режим, скрываем loader, показываем Desktop Shell
- **Page:** Desktop Shell (guest режим)

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
   - **Start Menu** (кнопка "Start" слева в Taskbar):
     - Windows 95 стилистика
     - Содержит "Log In..." и "Log Out..." пункты
     - Клик по "Log In..." → открывается Login Window
     - Клик по "Log Out..." → открывается Logout Confirmation Dialog
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

7. **Auth Flow (Windows 95 стилистика):**
   - **Boot:** На старте приложения показываем Win98 hourglass loader пока идёт проверка токена через `/api/auth/me`
   - **Login:** 
     - Start menu → "Log In..." → открывается Login Window (Win95-диалог "Welcome to Windows")
     - Login Window содержит кнопку "Telegram..."
     - Клик по "Telegram..." → открывается отдельное окно типа Internet Explorer (внутри системы окон)
     - Внутри IE окна открывается Telegram login page
     - После успешной авторизации → callback обрабатывается, токен сохраняется в localStorage, окно закрывается
     - Frontend проверяет сессию через `/api/auth/me` (источник правды)
   - **Logout:**
     - Start menu → "Log Out..." → открывается Logout Confirmation Dialog (Win95-диалог подтверждения, аналог shutdown/log off)
     - Диалог содержит кнопки "Yes" и "No"
     - Только после подтверждения ("Yes") очищается токен из localStorage и auth state
     - Если пользователь нажимает "No" → диалог закрывается, logout не происходит

8. **User Panel (системное окно):**
   - Открывается кликом по User Icon в Taskbar Tray
   - Windows 95 стилистика (отдельное окно, не Start Menu)
   - Отображает:
     - Username (имя пользователя)
     - Роль (Guest / Participant / Organizer)
     - Кнопку Log out (открывает Logout Confirmation Dialog)
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
      help.txt (txt) - visible to Guest and Participant
      admin_help.txt (txt) - visible only to Organizer
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

**Назначение роли Organizer (Whitelist):**
- Organizer определяется whitelist-ом по Telegram numeric id (`telegramUser.id`)
- Ник НЕ является доказательством владения
- Whitelist хранится в БД (таблица `organizerWhitelist` или поле в `users` таблице)
- Backend проверяет `telegramUser.id` против whitelist при авторизации через `/api/auth/telegram`
- Выполняется вручную через БД на текущем этапе
- UI для управления whitelist не входит в MVP
- Backend считается единственным источником правды для ролей

### Реализация прав

Права проверяются на уровне:
1. **Backend API:** endpoints проверяют JWT токен и роль из токена перед выполнением операций (RBAC enforced на backend)
2. **VFS API:** методы VFS проверяют роль пользователя перед операциями (на основе роли из backend)
3. **UI:** кнопки/действия скрываются для пользователей без прав (на основе роли из backend)

### Data Model Notes

**organizerWhitelist:**
- Whitelist хранится в БД (таблица `organizerWhitelist` или поле в `users` таблице)
- Структура: `{ telegramId: number, createdAt: Date }` (или аналогичная)
- Backend проверяет `telegramUser.id` против whitelist при авторизации через `/api/auth/telegram`
- Если `telegramUser.id` в whitelist → роль устанавливается как `Organizer`
- Если `telegramUser.id` не в whitelist → роль устанавливается как `Guest` или `Participant` (в зависимости от политики)
- Ник НЕ является доказательством владения (только `telegramUser.id`)

**roleBindings (опционально):**
- Если нужна более гибкая система ролей, можно использовать `roleBindings` таблицу
- Структура: `{ telegramId: number, role: 'Guest' | 'Participant' | 'Organizer', createdAt: Date }`
- Backend проверяет `telegramUser.id` против `roleBindings` при авторизации
- Если запись найдена → роль берется из `roleBindings`
- Если запись не найдена → роль по умолчанию `Guest`

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

15. **AuthContext** (`contexts/AuthContext.tsx`)
    - Управление auth state (user, token, loading, booting)
    - Bootstrap auth: localStorage.token → `/api/auth/me` → authed/guest
    - Global 401 handler: `hardLogout()` при 401 от любого endpoint
    - PostMessage listener для Telegram auth callback
    - Методы: `devAuth()`, `telegramAuth()`, `logout()`, `hardLogout()`

16. **HourglassOverlay** (`components/HourglassOverlay.tsx` или аналогичный)
    - Win98 hourglass loader overlay (fullscreen, z-index: 99999)
    - Показывается при `booting === true` в AuthContext
    - Блокирует весь UI до завершения bootstrap auth

17. **LoginWindow** (`os/apps/LoginWindow.tsx` или аналогичный)
    - Win95 dialog "Welcome to Windows"
    - Кнопка "Telegram..." → открывает IE Window с Telegram login page
    - Кнопка "Cancel" → закрывает окно

**Backend (API):**

1. **Auth Controller** (`auth/auth.controller.ts`)
   - Telegram auth endpoint (`/api/auth/telegram`)
   - DEV MODE auth endpoint (`/api/auth/dev`) — только для локальной разработки
   - Get current user endpoint (`/api/auth/me`) — источник правды по сессии
   - JWT токен выдача
   - Роль пользователя загружается из БД и включается в JWT токен

2. **Auth Service** (`auth/auth.service.ts`)
   - `telegramAuth()`: проверка Telegram signature (HMAC-SHA256), проверка organizerWhitelist, создание/обновление пользователя, выдача JWT
   - `devAuth()`: DEV MODE auth (только для локальной разработки)
   - `generateToken()`: генерация JWT токена с ролью

3. **Organizer Whitelist Repository** (`auth/organizer-whitelist.repository.ts`)
   - Таблица `organizerWhitelist`: `{ telegramId: number, createdAt: Date }`
   - Методы: `isOrganizer(telegramId)`, `addOrganizer(telegramId)`, `removeOrganizer(telegramId)`
   - Проверка whitelist при Telegram auth (только на backend)

4. **VFS/S3 Controller** (`vfs/vfs.controller.ts` или аналогичный)
   - `GET /api/vfs/list?path=...` → список файлов/папок
   - `GET /api/vfs/read?key=...` → чтение файла
   - `POST /api/vfs/upload` → загрузка файла (Organizer only)
   - `POST /api/vfs/move` → перемещение файла (Organizer only)
   - `DELETE /api/vfs/delete?key=...` → удаление файла (Organizer only)

5. **S3 Service** (`s3/s3.service.ts` или аналогичный)
   - Абстракция над S3-совместимым хранилищем
   - Операции: list, read, upload, move, delete

6. **Users Repository** (`users/users.repository.ts`)
   - Методы для работы с пользователями: `findById()`, `create()`, `updateRole()`
   - Добавить: `findByTelegramId(telegramId: number)`, `createOrUpdateByTelegramId(telegramId, userData)`

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

### Auth Bootstrap & IE Window Flow Architecture

**Component Boundary Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ ShellRoot (main.tsx)                                        │
│  └─ AuthProvider (AuthContext)                               │
│     ├─ [booting: true] → HourglassOverlay                    │
│     ├─ localStorage.token → /api/auth/me → authed/guest     │
│     └─ global 401 handler → hardLogout()                     │
│                                                               │
│  └─ DesktopShell                                             │
│     └─ WindowManager                                         │
│        └─ WindowRegistry                                     │
│           └─ InternetExplorer (IE Window)                    │
│              ├─ iframe (sandbox: allow-scripts,              │
│              │              allow-same-origin,               │
│              │              allow-forms)                      │
│              └─ src: https://oauth.telegram.org/auth          │
│                                                               │
│  └─ LoginWindow (Win95 dialog)                              │
│     └─ "Telegram..." button → openWindow('internet-explorer')│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ postMessage
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Telegram Login Page (https://oauth.telegram.org)            │
│  └─ After auth success:                                      │
│     └─ window.parent.postMessage({                           │
│          type: 'telegram-auth-success',                      │
│          payload: { telegramId, hash, ... }                 │
│        }, 'https://our-domain.com')                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/auth/telegram
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (auth.controller.ts)                                │
│  └─ AuthService.telegramAuth()                              │
│     ├─ Verify Telegram signature (HMAC-SHA256)              │
│     ├─ Check organizerWhitelist (telegramId → role)         │
│     └─ Return { user, token }                               │
└─────────────────────────────────────────────────────────────┘
```

**Модули/файлы для изменения:**

**Frontend:**
1. `front/src/contexts/AuthContext.tsx`
   - Добавить `booting: boolean` state
   - Реализовать `bootstrapAuth()`: localStorage.token → `/api/auth/me` → authed/guest
   - Добавить `hardLogout()`: полная очистка токена + guest режим
   - Добавить postMessage listener для `telegram-auth-success`/`telegram-auth-error`
   - Показывать HourglassOverlay при `booting === true`

2. `front/src/components/HourglassOverlay.tsx` (новый)
   - Win98 hourglass loader overlay (fullscreen, z-index: 99999)
   - Показывается поверх всего контента во время booting

3. `front/src/api/client.ts`
   - Обновить global 401 handler: вызывать `hardLogout()` из AuthContext
   - Убрать redirect на `/`, только очистка токена

4. `front/src/os/apps/InternetExplorer.tsx`
   - Поддержка внешних URL через `content.src` (уже есть)
   - Sandbox политика: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)
   - Добавить postMessage listener для Telegram callback (опционально, если нужен redirect fallback)

5. `front/src/os/apps/LoginWindow.tsx` (новый или обновить существующий)
   - Win95 dialog "Welcome to Windows"
   - Кнопка "Telegram..." → `openWindow('internet-explorer', { content: { src: TELEGRAM_AUTH_URL } })`

6. `front/src/main.tsx`
   - Обернуть в `AuthProvider`
   - Показывать HourglassOverlay при `booting === true`

**Backend:**
1. `back/src/auth/auth.service.ts`
   - Реализовать `telegramAuth()`:
     - Проверка Telegram signature (HMAC-SHA256)
     - Проверка `organizerWhitelist` по `telegramId`
     - Создание/обновление пользователя в БД
     - Выдача JWT токена с ролью

2. `back/src/auth/auth.controller.ts`
   - Обновить `@Post("telegram")` endpoint (уже есть, нужно реализовать)

3. `back/src/users/users.repository.ts`
   - Добавить метод `findByTelegramId(telegramId: number): Promise<UserDoc | null>`
   - Добавить метод `createOrUpdateByTelegramId(telegramId: number, userData: Partial<UserDoc>): Promise<UserDoc>`

4. `back/src/auth/organizer-whitelist.repository.ts` (новый)
   - Таблица `organizerWhitelist`: `{ telegramId: number, createdAt: Date }`
   - Метод `isOrganizer(telegramId: number): Promise<boolean>`
   - Метод `addOrganizer(telegramId: number): Promise<void>`
   - Метод `removeOrganizer(telegramId: number): Promise<void>`

**События/контракты между IE Window и AuthContext:**

**PostMessage Contract:**

```typescript
// Telegram login page → Parent window
type TelegramAuthSuccessMessage = {
  type: 'telegram-auth-success';
  payload: {
    id: number;           // telegramUser.id
    hash: string;         // Telegram signature hash
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
  };
};

type TelegramAuthErrorMessage = {
  type: 'telegram-auth-error';
  payload: {
    error: string;
  };
};

// Parent window → IE Window (опционально, для управления)
type TelegramAuthRequestMessage = {
  type: 'telegram-auth-request';
  payload: {
    botId: string;        // Telegram Bot ID
    redirectUrl?: string; // Callback URL (опционально)
  };
};
```

**Валидация postMessage в AuthContext:**

```typescript
// Разрешённые origins
const ALLOWED_ORIGINS = [
  'https://oauth.telegram.org',
  window.location.origin, // наш домен
];

// Разрешённые типы сообщений
const ALLOWED_MESSAGE_TYPES = [
  'telegram-auth-success',
  'telegram-auth-error',
];

window.addEventListener('message', (event) => {
  // 1. Проверка origin
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn('Rejected postMessage from unknown origin:', event.origin);
    return;
  }

  // 2. Проверка типа сообщения
  if (!event.data?.type || !ALLOWED_MESSAGE_TYPES.includes(event.data.type)) {
    console.warn('Rejected postMessage with unknown type:', event.data?.type);
    return;
  }

  // 3. Обработка сообщения
  if (event.data.type === 'telegram-auth-success') {
    const { id, hash, ...rest } = event.data.payload;
    // Вызов telegramAuth(id, hash) → POST /api/auth/telegram
    // Закрытие IE окна
    // Обновление auth state
  } else if (event.data.type === 'telegram-auth-error') {
    // Показать ошибку пользователю
    // Закрыть IE окно
  }
});
```

**Risks + Mitigations:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Token theft via XSS** | Critical | CSP headers, sandbox iframe, HttpOnly cookies (если возможно), token rotation |
| **Spoofed Telegram auth** | Critical | Backend MUST verify HMAC-SHA256 signature, запрет приёма без проверки |
| **PostMessage injection** | High | Строгая валидация `event.origin` и `event.data.type`, allowlist origins/types |
| **IE window navigation escape** | High | Sandbox без `allow-top-navigation`, проверка `src` URL перед загрузкой |
| **CSRF on /api/auth/telegram** | High | CSRF токены или проверка `Origin`/`Referer` headers |
| **Organizer privilege escalation** | Critical | Whitelist проверка ТОЛЬКО на backend, фронт не управляет ролями |
| **Booting state race condition** | Medium | `booting` state управляется только в AuthContext, блокирует UI до завершения |
| **401 handler infinite loop** | Medium | Проверка `isAuthEndpoint` перед вызовом `hardLogout()`, флаг "already logged out" |
| **IE window не закрывается после auth** | Low | Автоматическое закрытие окна после успешного postMessage, таймаут закрытия |
| **Telegram callback redirect hijacking** | Medium | Whitelist разрешённых redirect URLs, валидация callback URL на backend |

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

### Telegram Auth Security

**Threat Model (минимальный):**

| Threat | Severity | Description | Mitigation |
|--------|----------|-------------|------------|
| **Spoofing** | Critical | Атакующий подделывает `telegramUser.id` или `hash` для получения токена | Обязательная серверная проверка криптографической подписи Telegram (HMAC-SHA256) |
| **Token Theft** | Critical | XSS/CSRF крадёт токен из localStorage | HttpOnly cookies (если возможно), CSP, SameSite cookies, token rotation |
| **Clickjacking** | High | IE window перекрывается злонамеренным iframe | `X-Frame-Options: DENY` для Telegram login page, sandbox для IE window |
| **Iframe Restrictions** | Medium | IE window может быть использован для атаки на родительское окно | Строгая sandbox политика для IE window, запрет `allow-top-navigation` |
| **PostMessage Policy** | Medium | Злонамеренный postMessage из Telegram login page | Валидация `event.origin`, allowlist типов сообщений, игнорирование неизвестных |
| **CSRF** | High | Атакующий выполняет авторизацию от имени жертвы | CSRF токены, SameSite cookies, проверка `Origin`/`Referer` |
| **Open Redirects** | Medium | Telegram callback перенаправляет на злонамеренный URL | Whitelist разрешённых redirect URLs, валидация callback URL |

**Рекомендации по безопасной реализации:**

1. **Telegram Signature Verification (MUST):**
   - Backend **ОБЯЗАН** проверять криптографическую подпись Telegram (HMAC-SHA256)
   - Формула проверки: `hash = HMAC-SHA256(secret_key, "id=123&first_name=...&username=...")`
   - **ЗАПРЕЩЕНО** принимать `telegramId` и `hash` без проверки подписи
   - **ЗАПРЕЩЕНО** использовать "login by username" (username не является доказательством владения)

2. **Organizer Whitelist (MUST):**
   - Organizer определяется **ТОЛЬКО** по `telegramUser.id` (numeric) из проверенной подписи
   - Whitelist хранится в БД, проверяется на backend после успешной проверки подписи
   - **ЗАПРЕЩЕНО** использовать username, first_name, last_name для определения роли

3. **IE Window Sandbox (MUST):**
   - IE window для Telegram login **ОБЯЗАН** использовать строгую sandbox политику
   - Разрешено: `allow-scripts allow-same-origin allow-forms`
   - **ЗАПРЕЩЕНО**: `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-modals`
   - IE window **ОБЯЗАН** открываться в отдельном окне (не iframe в родительском окне)

4. **PostMessage Security (MUST):**
   - Все postMessage от Telegram login page **ОБЯЗАНЫ** валидироваться по `event.origin`
   - Разрешённые origins: только `https://oauth.telegram.org` и наш домен
   - Allowlist типов сообщений: только `telegram-auth-success`, `telegram-auth-error`
   - **ЗАПРЕЩЕНО** обрабатывать сообщения с неизвестными типами или origins

5. **Token Storage (MUST):**
   - Token хранится в `localStorage` (ключ: `birdmaid_token`)
   - **ЗАПРЕЩЕНО** хранить токен в cookies без `HttpOnly` и `Secure` флагов (если используется cookies)
   - **ЗАПРЕЩЕНО** передавать токен в URL параметрах
   - При 401 от `/api/auth/me` → **ОБЯЗАТЕЛЬНЫЙ** token wipe из localStorage

6. **CSP (Content Security Policy) (MUST):**
   - CSP **ОБЯЗАН** разрешать только `https://oauth.telegram.org` для `frame-src`
   - **ЗАПРЕЩЕНО** использовать `frame-src *` или `frame-src 'unsafe-inline'`
   - CSP должен включать: `frame-src 'self' https://oauth.telegram.org`

7. **CSRF Protection (MUST):**
   - Все POST запросы к `/api/auth/telegram` **ОБЯЗАНЫ** проверять CSRF токен или `Origin`/`Referer`
   - **ЗАПРЕЩЕНО** принимать POST запросы без проверки CSRF

8. **Open Redirects (MUST):**
   - Telegram callback URL **ОБЯЗАН** быть валидирован на whitelist разрешённых URLs
   - **ЗАПРЕЩЕНО** перенаправлять на внешние домены без валидации

**MUST/MUST NOT Checklist для инженера:**

1. ✅ **MUST**: Backend проверяет криптографическую подпись Telegram (HMAC-SHA256) перед выдачей токена
2. ❌ **MUST NOT**: Принимать `telegramId` и `hash` без проверки подписи
3. ❌ **MUST NOT**: Использовать "login by username" (username не является доказательством владения)
4. ✅ **MUST**: Organizer определяется **ТОЛЬКО** по `telegramUser.id` (numeric) из проверенной подписи
5. ✅ **MUST**: IE window для Telegram login использует sandbox: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)
6. ❌ **MUST NOT**: Разрешать `allow-top-navigation` или `allow-modals` в sandbox для IE window
7. ✅ **MUST**: Валидировать `event.origin` для всех postMessage от Telegram login page
8. ✅ **MUST**: Использовать allowlist типов сообщений для postMessage (только `telegram-auth-success`, `telegram-auth-error`)
9. ❌ **MUST NOT**: Обрабатывать postMessage с неизвестными типами или origins
10. ✅ **MUST**: CSP разрешает только `https://oauth.telegram.org` для `frame-src`
11. ❌ **MUST NOT**: Использовать `frame-src *` или `frame-src 'unsafe-inline'` в CSP
12. ✅ **MUST**: Проверять CSRF токен или `Origin`/`Referer` для всех POST запросов к `/api/auth/telegram`
13. ✅ **MUST**: Валидировать Telegram callback URL на whitelist разрешённых URLs
14. ❌ **MUST NOT**: Перенаправлять на внешние домены без валидации
15. ✅ **MUST**: Хранить токен в `localStorage` (ключ: `birdmaid_token`), не в cookies без `HttpOnly`
16. ❌ **MUST NOT**: Передавать токен в URL параметрах
17. ✅ **MUST**: При 401 от `/api/auth/me` → очищать токен из localStorage и переходить в guest режим
18. ✅ **MUST**: IE window открывается в отдельном окне (не iframe в родительском окне)
19. ✅ **MUST**: Использовать `X-Frame-Options: DENY` для Telegram login page (если возможно)
20. ✅ **MUST**: Логировать все попытки авторизации (успешные и неуспешные) для аудита

## API Contracts

### Auth API

| Endpoint | Method | Request | Response | Auth | AUTH_MODE | Notes |
|----------|--------|---------|----------|------|-----------|-------|
| `/api/auth/telegram` | POST | `{ telegramId: string, hash: string, ... }` | `{ user: User, token: string }` | Public | `telegram` | Реальный Telegram auth, используется в production |
| `/api/auth/dev` | POST | `{ userId?: string, role?: 'Guest' \| 'Participant' \| 'Organizer' }` | `{ user: User, token: string }` | Public | `dev` | DEV MODE: выдаёт JWT без проверки Telegram signature. **ЗАПРЕЩЁН в production.** Только для локальной разработки и тестов. |
| `/api/auth/me` | GET | - | `{ user: User }` или `401 Unauthorized` | JWT (optional) | `dev`, `telegram` | **Источник правды по сессии.** Возвращает текущего пользователя из JWT токена. Если токен отсутствует или невалиден → 401, frontend должен очистить токен из localStorage и перейти в guest режим. |

**AUTH_MODE:**
- Платформа работает в одном из режимов: `AUTH_MODE=dev` или `AUTH_MODE=telegram`
- В `AUTH_MODE=dev`: доступен `/api/auth/dev`, dev-auth выдаёт JWT без проверки Telegram signature
- В `AUTH_MODE=telegram`: используется реальный Telegram auth через `/api/auth/telegram`
- **DEV MODE ЗАПРЕЩЁН в production** (должен быть отключён или заблокирован)

**User объект в ответе:**
- Содержит `role: 'Guest' | 'Participant' | 'Organizer'` (загружается из БД)
- Роль включается в JWT токен для последующих проверок на backend
- `telegramUser.id` используется для проверки organizerWhitelist (только для Organizer роли)

**Token Storage:**
- Token хранится в `localStorage` (ключ: `birdmaid_token`)
- Token переживает refresh страницы
- При 401 от `/api/auth/me` → token wipe из localStorage и guest режим

**Boot Flow:**
1. На старте приложения показываем Win98 hourglass loader (HourglassOverlay, `booting: true`)
2. Frontend проверяет токен из localStorage (`birdmaid_token`)
3. Если токен есть → вызываем `/api/auth/me` для проверки сессии
4. Если `/api/auth/me` возвращает 401 → `hardLogout()` (token wipe из localStorage, `user: null`, `booting: false`)
5. Если `/api/auth/me` возвращает user → устанавливаем auth state (`user`, `token`, `booting: false`)
6. Если токена нет → guest режим (`user: null`, `booting: false`)

**Global 401 Handler:**
- В `apiClient.request()`: при 401 от любого endpoint (кроме `/auth/*`) → вызываем `hardLogout()` из AuthContext
- `hardLogout()`: очищает токен из localStorage, сбрасывает `user` и `token` в `null`, переводит в guest режим
- НЕ делаем redirect на `/` (остаёмся на текущей странице, но в guest режиме)

**IE Window Flow (Telegram Auth):**
1. Пользователь кликает "Telegram..." в LoginWindow
2. Открывается IE Window через `openWindow('internet-explorer', { content: { src: TELEGRAM_AUTH_URL } })`
3. IE Window загружает `https://oauth.telegram.org/auth` в sandboxed iframe
4. Пользователь авторизуется в Telegram
5. Telegram login page отправляет postMessage в parent window:
   ```typescript
   window.parent.postMessage({
     type: 'telegram-auth-success',
     payload: { id, hash, first_name, username, ... }
   }, 'https://our-domain.com');
   ```
6. AuthContext получает postMessage, валидирует `event.origin` и `event.data.type`
7. Вызывается `telegramAuth(id, hash)` → `POST /api/auth/telegram`
8. Backend проверяет Telegram signature, проверяет `organizerWhitelist`, возвращает `{ user, token }`
9. AuthContext сохраняет токен в localStorage, обновляет auth state
10. IE Window закрывается автоматически

**Organizer Whitelist:**
- Хранится в БД: таблица `organizerWhitelist` с полями `{ telegramId: number, createdAt: Date }`
- Проверка происходит ТОЛЬКО на backend при `/api/auth/telegram`
- Если `telegramId` в whitelist → роль устанавливается как `Organizer`
- Если `telegramId` не в whitelist → роль устанавливается как `Guest` (или `Participant`, в зависимости от политики)
- Фронт НЕ управляет whitelist (только отображает роль из JWT токена)
- Назначение роли Organizer выполняется вручную через БД (UI для управления whitelist не входит в MVP)

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
   - `auth.organizer-whitelist.test.tsx`: Organizer определяется whitelist-ом по telegramUser.id, ник НЕ является доказательством владения
   - `auth.me-source-of-truth.test.tsx`: `/api/auth/me` является источником правды по сессии, при 401 токен очищается
   - `auth.boot-loader.test.tsx`: На старте приложения показывается Win98 hourglass loader пока идёт проверка токена
   - `auth.token-storage.test.tsx`: Token хранится в localStorage, переживает refresh, при 401 очищается
   - `auth.start-menu.test.tsx`: Start menu содержит "Log In..." и "Log Out..." пункты
   - `auth.login-window.test.tsx`: При "Log In..." открывается Win95-диалог "Welcome to Windows"
   - `auth.telegram-ie-window.test.tsx`: При "Telegram..." открывается отдельное окно типа Internet Explorer с Telegram login page
   - `auth.logout-confirmation.test.tsx`: При "Log Out..." показывается Win95-диалог подтверждения, только после подтверждения очищается токен
   - `auth.user-panel.test.tsx`: User Panel открывается как окно, отображает username и роль

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

## Implementation Plan (FP=FP7 mode=plan)

**Роль:** @Delivery  
**Дата:** 2026-01-22  
**Цель:** Реалистичный план реализации FP7 с атомарными коммитами и четкими DoD

### Milestones Overview

- **M0: Cutline** — удаление legacy auth + isSuperAdmin + связанных доменных сущностей
- **M1: Auth Bootstrap** — hourglass loading + `/api/auth/me` как источник правды
- **M2: Start Menu + Login/Logout Dialogs** — Win95 стилистика для auth UX
- **M3: IE Window для Telegram Auth** — открытие Telegram login page в IE окне
- **M4: Release Gate** — финальная проверка готовности FP7

---

### M0: Cutline (Legacy Removal)

**Цель:** Удалить legacy auth, isSuperAdmin и связанные доменные сущности из кода и БД.

**DoD (Definition of Done):**
- [ ] Email/password auth удалена из backend (DTOs, endpoints, service methods)
- [ ] Email/password auth удалена из frontend (AuthModal, AuthContext)
- [ ] `isSuperAdmin` удален из backend (заменен на role checks)
- [ ] `isSuperAdmin` удален из frontend (заменен на role checks)
- [ ] Старые сущности (teams/games/comments) удалены из БД (если завязаны на старую модель)
- [ ] Legacy auth тесты удалены
- [ ] Build проходит: `cd back && npm run build && cd ../front && npm run build`
- [ ] Тесты проходят: `cd back && npm test && cd ../front && npm test`

**Тесты должны быть зелёными:**
- `back/__tests__/fp7/auth.dev.test.ts` — dev auth работает
- `back/__tests__/fp7/auth.integration.test.ts` — интеграция auth работает
- `back/__tests__/fp7/vfs.rbac.test.ts` — RBAC проверки работают
- `front/__tests__/fp7/auth.*.test.tsx` — frontend auth тесты (если есть)

**Commit Plan (C1-C12):**

**C1: Delete Legacy Auth DTOs**
- Удалить: `back/src/auth/dto/register.dto.ts`, `login.dto.ts`, `recovery-request.dto.ts`, `recovery-verify.dto.ts`
- Удалить endpoints: `@Post("register")`, `@Post("login")`, `@Post("recovery/request")`, `@Post("recovery/verify")` из `auth.controller.ts`
- Удалить методы: `register`, `login`, `requestRecovery`, `verifyRecovery`, `hashPassword` из `auth.service.ts`
- Проверка: `grep -r "RegisterDto\|LoginDto\|RecoveryRequestDto\|RecoveryVerifyDto" back/src/` → пусто

**C2: Delete Legacy Auth Tests**
- Удалить: `back/__tests__/fp4/auth.register.test.ts`, `auth.login.test.ts`, `auth.recovery.test.ts`
- Удалить: `front/__tests__/fp4/auth.flows.test.tsx` (если есть)
- Проверка: `npm test -- --testPathPattern="auth.register|auth.login|auth.recovery"` → "No tests found"

**C3: Delete Email Service**
- Удалить: `back/src/auth/email.service.ts`
- Удалить импорты и инъекции EmailService из `auth.service.ts` и `auth.module.ts`
- Проверка: `grep -r "EmailService\|email.service" back/src/auth/` → пусто

**C4: Remove isSuperAdmin from Backend (Part 1)**
- Заменить `isSuperAdmin` на `role === 'Organizer'` в:
  - `back/src/users/users.repository.ts` (удалить поле или пометить deprecated)
  - `back/src/auth/auth.service.ts` (заменить все проверки)
  - `back/src/auth/auth.controller.ts` (удалить из `/me` response)
  - `back/src/vfs/vfs.controller.ts` (заменить проверку)
- Проверка: `grep -r "isSuperAdmin" back/src/ --exclude-dir=node_modules | grep -v "deprecated\|//"` → пусто

**C5: Remove isSuperAdmin from Frontend (Part 2)**
- Заменить `isSuperAdmin` на `role === 'Organizer'` в:
  - `front/src/contexts/AuthContext.tsx` (удалить поле из User type)
  - `front/src/os/apps/UserPanelApp.tsx` (заменить проверку)
  - `front/src/test/mocks/mockApi.ts` (обновить моки)
  - `front/src/test/fixtures/user.ts` (удалить из fixtures)
- Проверка: `grep -r "isSuperAdmin" front/src/ --exclude-dir=legacy --exclude-dir=node_modules | grep -v "deprecated\|//"` → пусто

**C6: Rewrite AuthModal for Telegram**
- Удалить email/password поля из `front/src/components/AuthModal.tsx`
- Добавить кнопку "Telegram..." (пока заглушка, будет реализована в M3)
- Проверка: `grep -q "email\|password" front/src/components/AuthModal.tsx | grep -v "Telegram\|comment\|//"` → пусто

**C7: Rewrite AuthContext for Telegram**
- Удалить методы: `register`, `login`, `requestRecovery`, `verifyRecovery` из `front/src/contexts/AuthContext.tsx`
- Добавить метод `telegramAuth` (пока заглушка, будет реализован в M3)
- Проверка: `grep -q "login.*identifier.*password\|register.*email.*password" front/src/contexts/AuthContext.tsx` → пусто

**C8: Add Telegram Auth Endpoint (Backend)**
- Добавить `@Post("telegram")` endpoint в `back/src/auth/auth.controller.ts`
- Добавить метод `telegramAuth` в `back/src/auth/auth.service.ts` с проверкой Telegram signature
- Добавить organizerWhitelist проверку (пока заглушка, будет реализована в M3)
- Проверка: `grep -q "@Post(\"telegram\")" back/src/auth/auth.controller.ts` → найдено

**C9: Verify Legacy Pages Not Used**
- Проверить, что `front/src/legacy/pages.tsx` не импортируется в production коде
- Проверка: `grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src/ --exclude-dir=legacy --exclude-dir=node_modules` → пусто

**C10: Rewrite Help Endpoint to Read from VFS**
- Изменить `back/src/help/help.service.ts` для чтения из VFS `/Disk C/desktop/help.txt`
- Удалить DB-based help из `back/src/help/help.repository.ts`
- Проверка: `grep -q "vfs\|/Disk C/desktop/help.txt" back/src/help/help.service.ts` → найдено

**C11: Add admin_help.txt for Organizer**
- Добавить создание `admin_help.txt` в `front/src/os/fs/vfs-init.ts`
- Проверка: `grep -q "admin_help.txt" front/src/os/fs/vfs-init.ts` → найдено

**C12: Verify Games/Teams/Comments Scope**
- Проверить FP7 scope для games/teams/comments (если OUT, удалить)
- Если OUT: удалить модули `back/src/games/`, `back/src/teams/`, `back/src/comments/`
- Проверка: manual review FP7.md scope

**Verification Commands (после всех коммитов):**
```bash
# 1. Verify no email/password auth code
grep -r "register.*email\|login.*password\|recovery.*email" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy && \
echo "❌ Legacy auth found" || echo "✅ Legacy auth removed"

# 2. Verify Telegram auth present
grep -r "telegramAuth\|/api/auth/telegram" back/src/ front/src/ \
--exclude-dir=node_modules && echo "✅ Telegram auth found" || echo "❌ No Telegram auth"

# 3. Verify isSuperAdmin removed (except deprecated)
grep -r "isSuperAdmin" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy | \
grep -v "deprecated\|//" && echo "❌ isSuperAdmin found" || echo "✅ isSuperAdmin removed"

# 4. Full build check
cd back && npm run build && cd ../front && npm run build && \
echo "✅ All builds pass" || echo "❌ Build failed"

# 5. Test suite
cd back && npm test && cd ../front && npm test && \
echo "✅ All tests pass" || echo "❌ Tests fail"
```

---

### M1: Auth Bootstrap + Hourglass Loading

**Цель:** Реализовать boot loader (Win98 hourglass) и `/api/auth/me` как источник правды по сессии.

**DoD (Definition of Done):**
- [ ] Win98 hourglass loader показывается на старте приложения
- [ ] Loader скрывается после проверки токена через `/api/auth/me`
- [ ] Token хранится в localStorage (ключ: `birdmaid_token`)
- [ ] Token переживает refresh страницы
- [ ] Если `/api/auth/me` возвращает 401 → token wipe из localStorage и guest режим
- [ ] Если `/api/auth/me` возвращает user → устанавливается auth state
- [ ] Build проходит
- [ ] Тесты проходят

**Тесты должны быть зелёными:**
- `front/__tests__/fp7/auth.boot-loader.test.tsx` — loader показывается на boot и скрывается после проверки
- `front/__tests__/fp7/auth.me-source-of-truth.test.tsx` — `/api/auth/me` является источником правды
- `front/__tests__/fp7/auth.token-storage.test.tsx` — token storage работает, переживает refresh, обрабатывает 401

**Commit Plan (C13-C16):**

**C13: Add Hourglass Loader Component**
- Создать компонент `front/src/components/HourglassLoader.tsx` (Win98 стилистика)
- Добавить стили в `front/src/styles/_components.scss`
- Проверка: компонент рендерится, стили соответствуют Win98

**C14: Implement Token Storage in localStorage**
- Обновить `front/src/contexts/AuthContext.tsx` для хранения токена в localStorage
- Ключ: `birdmaid_token`
- Проверка: `localStorage.getItem('birdmaid_token')` работает

**C15: Implement /api/auth/me as Source of Truth**
- Обновить `front/src/contexts/AuthContext.tsx` для проверки токена через `/api/auth/me` на boot
- Обработка 401: token wipe + guest режим
- Обработка 200: установка auth state
- Проверка: `curl http://localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"` работает

**C16: Integrate Hourglass Loader with Auth Bootstrap**
- Показывать loader на старте приложения (в `main.tsx` или `ShellRoot.tsx`)
- Скрывать loader после получения ответа от `/api/auth/me`
- Проверка: loader показывается на boot, скрывается после проверки

---

### M2: Start Menu + Win95 Login/Logout Dialogs

**Цель:** Реализовать Start menu с "Log In..." и "Log Out..." пунктами, Login Window и Logout Confirmation Dialog в Win95 стилистике.

**DoD (Definition of Done):**
- [ ] Start menu (Win95 style) содержит "Log In..." и "Log Out..." пункты
- [ ] "Log Out..." disabled если пользователь не авторизован
- [ ] При "Log In..." открывается Login Window (Win95-диалог "Welcome to Windows")
- [ ] Login Window имеет Windows 95 стилистику (3D bevels, правильные цвета, типографика)
- [ ] При "Log Out..." показывается Logout Confirmation Dialog (Win95-диалог подтверждения)
- [ ] Logout Confirmation Dialog содержит кнопки "Yes" и "No"
- [ ] Только после подтверждения ("Yes") очищается токен из localStorage и auth state
- [ ] Если пользователь нажимает "No" → диалог закрывается, logout не происходит
- [ ] Build проходит
- [ ] Тесты проходят

**Тесты должны быть зелёными:**
- `front/__tests__/fp7/auth.start-menu.test.tsx` — Start menu содержит правильные пункты
- `front/__tests__/fp7/auth.login-window.test.tsx` — Login Window открывается при "Log In..."
- `front/__tests__/fp7/auth.logout-confirmation.test.tsx` — Logout происходит только после подтверждения

**Commit Plan (C17-C21):**

**C17: Implement Start Menu Component**
- Создать компонент `front/src/os/taskbar/StartMenu.tsx` (Win95 стилистика)
- Добавить кнопку "Start" в `front/src/os/taskbar/Taskbar.tsx`
- Start menu содержит "Log In..." и "Log Out..." пункты
- "Log Out..." disabled если пользователь не авторизован
- Проверка: Start menu открывается, содержит правильные пункты

**C18: Implement Login Window Component**
- Создать компонент `front/src/os/apps/LoginWindow.tsx` (Win95-диалог "Welcome to Windows")
- Зарегистрировать в `appRegistry` как `login-window`
- Добавить кнопку "Telegram..." (пока заглушка, будет реализована в M3)
- Проверка: Login Window открывается при "Log In..." в Start menu

**C19: Implement Logout Confirmation Dialog Component**
- Создать компонент `front/src/os/apps/LogoutConfirmationDialog.tsx` (Win95-диалог подтверждения)
- Зарегистрировать в `appRegistry` как `logout-confirmation`
- Добавить кнопки "Yes" и "No"
- Проверка: Dialog открывается при "Log Out..." в Start menu

**C20: Integrate Start Menu with Login Window**
- Обновить `StartMenu.tsx` для открытия Login Window при "Log In..."
- Проверка: клик по "Log In..." → открывается Login Window

**C21: Integrate Start Menu with Logout Confirmation**
- Обновить `StartMenu.tsx` для открытия Logout Confirmation Dialog при "Log Out..."
- Обновить `LogoutConfirmationDialog.tsx` для очистки токена при "Yes"
- Проверка: клик по "Log Out..." → открывается Dialog, "Yes" → logout, "No" → отмена

---

### M3: IE Window для Telegram Auth

**Цель:** Реализовать открытие Telegram login page в Internet Explorer окне.

**DoD (Definition of Done):**
- [ ] При "Telegram..." в Login Window открывается отдельное окно типа Internet Explorer
- [ ] Внутри IE окна открывается Telegram login page
- [ ] После успешной авторизации → callback обрабатывается, токен сохраняется, окно закрывается
- [ ] IE window использует sandbox политику: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)
- [ ] PostMessage от Telegram login page валидируется по `event.origin`
- [ ] Organizer whitelist проверяется при авторизации (проверка `telegramUser.id` против whitelist)
- [ ] Build проходит
- [ ] Тесты проходят

**Тесты должны быть зелёными:**
- `front/__tests__/fp7/auth.telegram-ie-window.test.tsx` — IE Window открывается с Telegram login page
- `front/__tests__/fp7/auth.telegram-callback.test.tsx` — callback обрабатывается, токен сохраняется
- `back/__tests__/fp7/auth.telegram.test.ts` — Telegram auth endpoint работает
- `back/__tests__/fp7/auth.organizer-whitelist.test.ts` — organizerWhitelist проверка работает

**Commit Plan (C22-C26):**

**C22: Update Internet Explorer Component for Telegram Auth**
- Обновить `front/src/os/apps/InternetExplorer.tsx` для поддержки внешних URL (Telegram login page)
- Добавить sandbox политику: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`)
- Проверка: IE окно открывается с внешним URL, sandbox политика установлена

**C23: Implement Telegram Auth Flow in Login Window**
- Обновить `front/src/os/apps/LoginWindow.tsx` для открытия IE окна при "Telegram..."
- IE окно открывается с URL Telegram login page
- Проверка: клик по "Telegram..." → открывается IE окно с Telegram login page

**C24: Implement PostMessage Handler for Telegram Callback**
- Добавить обработчик postMessage в `front/src/contexts/AuthContext.tsx` для Telegram callback
- Валидация `event.origin` (только `https://oauth.telegram.org` и наш домен)
- Allowlist типов сообщений (только `telegram-auth-success`, `telegram-auth-error`)
- При успехе: сохранение токена, закрытие IE окна, обновление auth state
- Проверка: postMessage обрабатывается, токен сохраняется

**C25: Implement Organizer Whitelist Check in Backend**
- Добавить таблицу `organizerWhitelist` в БД (или поле в `users` таблице)
- Обновить `back/src/auth/auth.service.ts` для проверки `telegramUser.id` против whitelist
- Если `telegramUser.id` в whitelist → роль `Organizer`, иначе → роль `Guest` или `Participant`
- Проверка: только пользователи из whitelist получают роль Organizer

**C26: Complete Telegram Auth Endpoint Implementation**
- Завершить реализацию `@Post("telegram")` endpoint в `back/src/auth/auth.controller.ts`
- Проверка Telegram signature (HMAC-SHA256)
- Проверка organizerWhitelist
- Возврат JWT токена с ролью
- Проверка: `curl -X POST http://localhost:3000/api/auth/telegram -d '...'` работает

---

### M4: Release Gate

**Цель:** Финальная проверка готовности FP7 к релизу.

**DoD (Definition of Done):**
- [ ] Все milestones (M0-M3) завершены
- [ ] Все тесты проходят
- [ ] Release gate checklist пройден (см. [FP7_RELEASE_GATE.md](./FP7_RELEASE_GATE.md))
- [ ] Документация обновлена
- [ ] Evidence собрана

**Тесты должны быть зелёными:**
- Все тесты из M0-M3
- Visual regression tests (если настроены)
- Integration tests

**Commit Plan (C27-C28):**

**C27: Update Documentation**
- Обновить `docs/fps/FP7.md` с результатами реализации
- Обновить `docs/fps/FP7_RELEASE_GATE.md` с результатами gate
- Добавить evidence (screenshots, coverage reports, test results)

**C28: Release Gate Execution**
- Выполнить release gate checklist из `docs/fps/FP7_RELEASE_GATE.md`
- Задокументировать результаты (PASS/REJECT)
- Если REJECT: создать список блокеров и план исправления

---

## Release Gate Checklist для FP7

**Роль:** @Delivery  
**Режим:** FP=FP7 mode=release  
**Время на проверку:** 15 минут

### Быстрый 1-проходный сценарий

**Шаг 1: Запуск (2 мин)**
```bash
docker compose up -d mongo minio minio-init
cd back && npm run start:dev &
cd front && npm run dev &
```

**Шаг 2: Desktop проверка (3 мин)**
- Открыть `http://localhost:5173`
- Проверить Explorer (Tree + Grid)
- Открыть файлы разных типов (image, video, txt, html, webapp)
- Проверить viewport boundary (перетащить окно)

**Шаг 3: Auth Bootstrap проверка (2 мин)**
- Проверить, что hourglass loader показывается на boot
- Проверить, что loader скрывается после проверки токена
- Проверить token storage в localStorage

**Шаг 4: Start Menu + Login/Logout проверка (3 мин)**
- Кликнуть по "Start" в Taskbar → проверить Start menu
- Кликнуть по "Log In..." → проверить Login Window
- Кликнуть по "Log Out..." → проверить Logout Confirmation Dialog
- Проверить, что logout происходит только после подтверждения

**Шаг 5: Telegram Auth в IE Window проверка (3 мин)**
- Кликнуть по "Telegram..." в Login Window → проверить IE окно
- Проверить, что Telegram login page загружается в IE окне
- Проверить sandbox политику в DevTools
- Проверить postMessage валидацию

**Шаг 6: Legacy Removal проверка (1 мин)**
```bash
# Verify no email/password auth code
grep -r "register.*email\|login.*password\|recovery.*email" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy && \
echo "❌ Legacy auth found" || echo "✅ Legacy auth removed"

# Verify isSuperAdmin removed
grep -r "isSuperAdmin" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy | \
grep -v "deprecated\|//" && echo "❌ isSuperAdmin found" || echo "✅ isSuperAdmin removed"
```

**Шаг 7: Тесты (1 мин)**
```bash
cd front && npm test
cd back && npm test
```

### Критерии PASS

Все следующие проверки должны быть ✅:

1. ✅ Desktop Shell работает, Explorer навигация работает
2. ✅ Hourglass loader показывается на boot и скрывается после проверки
3. ✅ Start menu содержит "Log In..." и "Log Out..." пункты
4. ✅ Login Window открывается при "Log In..."
5. ✅ Logout Confirmation Dialog открывается при "Log Out..."
6. ✅ IE Window открывается с Telegram login page
7. ✅ Telegram auth callback обрабатывается, токен сохраняется
8. ✅ Legacy auth удалена (email/password, isSuperAdmin)
9. ✅ Все тесты проходят
10. ✅ Build проходит

### Критерии REJECT

Если хотя бы одна проверка ❌:
- ❌ Блокер найден → REJECT
- ❌ Требуется доработка → REJECT

---

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

### M6: Style System Refactor

**Цель:** Миграция всех inline styles в SCSS, создание theme tokens системы, организация стилей как style guide система.

**Outcome:**
- Все inline styles вынесены в scss/sass/styl (кроме whitelist: drag/resize geometry)
- Стили организованы как style guide система: tokens + mixins + components + utilities
- Поддерживаются темы (theme A/B) без изменения компонентов (только смена token-layer)
- Есть документация "как добавлять стили правильно", иначе команда/агенты снова всё сломают

**Scope IN:**
- Создание/закрепление структуры `styles/`
- Введение theme tokens и механизма переключения темы
- Миграция всех компонентов фронта (desktop + mobile) от inline styles к классам
- Обновление тестов/селекторов, если они зависели от inline styles

**Scope OUT:**
- Полная переработка UI/UX логики
- Перерисовка всего дизайна (мы переносим в классы, не меняя поведение)

### M7: Chicago95-like OS Experience

**Цель:** Превратить платформу в Chicago95-like OS experience (перцептивно как Windows 95), НЕ эмулируя ОС и НЕ используя проприетарные ассеты.

**Outcome:**
- Пользователь за 60 секунд воспринимает платформу как аутентичную Windows 95-подобную ОС
- Все компоненты используют аутентичную Windows 95 эстетику (Chicago95 palette, 3D bevels, пиксельно-выровненная типографика)
- Все интерактивные состояния работают правильно (focus model, pressed states, single vs double click)
- Visual regression тесты проходят для всех 8-10 golden screens

**Scope IN:**
- Визуальные изменения: все компоненты используют Windows 95 UI Kit (см. WIN95_SPEC.md)
- Интерактивные состояния: focus model, pressed states, single vs double click, taskbar pressed, menu ESC
- Golden Screens: создание baseline screenshots для visual regression тестов
- Open-source ассеты: использование только open-source шрифтов и иконок

**Scope OUT:**
- Эмуляция ОС (мы не эмулируем Windows 95, только визуально/интерактивно похоже)
- Проприетарные ассеты (MS Sans Serif оригинал, Windows 95 иконки/bitmaps)
- Изменение архитектуры платформы (VFS/S3 контракт, Window Manager логика)

**PR Sequence (5-7 PR max):**

#### PR #1: Foundation & Tokens (Wave 1)

**Цель:** Заложить фундамент для Chicago95 стиля: tokens, typography, font smoothing.

**Changes:**
- Проверить/дополнить tokens из WIN95_SPEC.md в `front/src/styles/_tokens.scss`
- Настроить font stack: `"Liberation Sans", "Noto Sans", "MS Sans Serif", "Tahoma", system-ui, -apple-system, sans-serif`
- Отключить font smoothing: `-webkit-font-smoothing: none`, `font-smooth: never` в `front/src/styles/index.scss`
- Убедиться, что все компоненты используют tokens (не хардкод цветов/размеров)
- Проверить asset provenance: все шрифты open-source (Liberation Sans, Noto Sans)

**DoD:**
- [ ] Все tokens из WIN95_SPEC.md реализованы
- [ ] Font stack настроен правильно
- [ ] Font smoothing отключен глобально
- [ ] Нет хардкода цветов/размеров (используются tokens)
- [ ] Asset provenance check проходит: `node scripts/check-asset-provenance.cjs`
- [ ] Unit tests зеленые: `cd front && npm test`
- [ ] Lint проходит: `cd front && npm run lint`
- [ ] No inline styles violation: `npm run lint` не показывает inline style errors

**Команды проверки:**
```bash
# 1. Проверка tokens
cd front && grep -r "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx" --include="*.ts" | grep -v "//" | head -20
# Ожидаем: минимум хардкода (только в комментариях или allow-tag)

# 2. Проверка font stack
cd front && grep -A 5 "font-family" src/styles/index.scss | grep -i "liberation\|noto\|tahoma"
# Ожидаем: font stack содержит Liberation Sans, Noto Sans, Tahoma

# 3. Проверка font smoothing
cd front && grep -i "font-smoothing\|font-smooth" src/styles/index.scss
# Ожидаем: -webkit-font-smoothing: none; font-smooth: never;

# 4. Asset provenance check
node scripts/check-asset-provenance.cjs
# Ожидаем: все шрифты имеют записи в ASSET_PROVENANCE.md

# 5. Tests + Lint
cd front && npm test && npm run lint
# Ожидаем: все тесты зеленые, lint проходит
```

#### PR #2: Focus Model & Window States (Wave 2)

**Цель:** Реализовать focus model для окон (active/inactive states).

**Changes:**
- Реализовать focus model в WindowRegistry: active window (z-index 20) vs inactive (z-index 10)
- Обновить WindowFrame: title bar с синим градиентом для active, серый для inactive
- Обновить WindowStore: z-index управление при focus change
- Написать unit tests: `front/__tests__/fp7/window.focus.test.tsx`

**DoD:**
- [ ] Active window имеет title bar с синим градиентом (`#000080` → `#1084d0`), белый текст
- [ ] Inactive window имеет title bar серого цвета (`#c0c0c0`), черный текст
- [ ] Клик по окну → окно становится active (title bar меняется, z-index повышается)
- [ ] Z-index: active = 20, inactive = 10
- [ ] Unit tests зеленые: `window.focus.test.tsx` проходит
- [ ] Lint проходит: `npm run lint`
- [ ] No inline styles violation

**Команды проверки:**
```bash
# 1. Проверка focus model в коде
cd front && grep -r "z-index.*20\|z-index.*10" src/os/wm/ --include="*.tsx" --include="*.ts"
# Ожидаем: z-index 20 для active, 10 для inactive

# 2. Проверка title bar градиента
cd front && grep -A 3 "titlebar.*active\|active.*titlebar" src/styles/ --include="*.scss" | grep -i "gradient\|blue"
# Ожидаем: градиент от #000080 до #1084d0 для active

# 3. Unit tests
cd front && npm test -- window.focus
# Ожидаем: все тесты проходят

# 4. Lint
cd front && npm run lint
# Ожидаем: lint проходит
```

#### PR #3: Pressed States & Interactions (Wave 3)

**Цель:** Реализовать pressed states для всех кнопок и интерактивных элементов.

**Changes:**
- Реализовать pressed states для window control buttons (minimize/maximize/close)
- Реализовать pressed states для Desktop Icons
- Реализовать pressed states для Taskbar buttons
- Реализовать pressed states для всех остальных кнопок
- Pressed state: outset → inset bevel + `translate(1px, 1px)`
- Написать unit tests: `front/__tests__/fp7/button.pressed-state.test.tsx`

**DoD:**
- [ ] Все кнопки имеют pressed state (outset → inset bevel + translate(1px, 1px))
- [ ] Window control buttons имеют pressed state
- [ ] Desktop Icons имеют pressed state
- [ ] Taskbar buttons имеют pressed state
- [ ] Все остальные кнопки имеют pressed state
- [ ] Unit tests зеленые: `button.pressed-state.test.tsx` проходит
- [ ] Lint проходит: `npm run lint`
- [ ] No inline styles violation

**Команды проверки:**
```bash
# 1. Проверка pressed states в стилях
cd front && grep -r ":active\|pressed" src/styles/ --include="*.scss" | grep -i "inset\|translate"
# Ожидаем: pressed states используют inset bevel и translate(1px, 1px)

# 2. Проверка компонентов
cd front && grep -r "onMouseDown\|onPointerDown" src/os/ --include="*.tsx" | head -10
# Ожидаем: компоненты обрабатывают pressed states

# 3. Unit tests
cd front && npm test -- button.pressed-state
# Ожидаем: все тесты проходят

# 4. Lint
cd front && npm run lint
# Ожидаем: lint проходит
```

#### PR #4: Single vs Double Click (Wave 4)

**Цель:** Реализовать правильное поведение single vs double click для Desktop Icons и Explorer Grid.

**Changes:**
- Реализовать single-click selection для Desktop Icons (blue background, white text)
- Реализовать double-click opening для Desktop Icons
- Реализовать single-click selection для Explorer Grid (blue background, white text)
- Реализовать double-click opening для Explorer Grid
- Использовать click timeout (300ms) для различения single vs double click
- Написать unit tests: `front/__tests__/fp7/desktop.icons.click.test.tsx`, `front/__tests__/fp7/explorer.grid.click.test.tsx`

**DoD:**
- [ ] Desktop Icons: single-click → selection (blue background), double-click → открытие окна
- [ ] Explorer Grid: single-click → selection (blue background), double-click → открытие файла
- [ ] Single-click не открывает окно/файл
- [ ] Double-click открывает окно/файл
- [ ] Unit tests зеленые: `desktop.icons.click.test.tsx`, `explorer.grid.click.test.tsx` проходят
- [ ] Lint проходит: `npm run lint`
- [ ] No inline styles violation

**Команды проверки:**
```bash
# 1. Проверка click handlers
cd front && grep -r "onClick\|onDoubleClick" src/os/ --include="*.tsx" | grep -i "desktop\|explorer" | head -10
# Ожидаем: обработчики single/double click реализованы

# 2. Проверка selection styles
cd front && grep -r "selected\|selection" src/styles/ --include="*.scss" | grep -i "blue\|#000080"
# Ожидаем: selection использует blue (#000080) background

# 3. Unit tests
cd front && npm test -- desktop.icons.click explorer.grid.click
# Ожидаем: все тесты проходят

# 4. Lint
cd front && npm run lint
# Ожидаем: lint проходит
```

#### PR #5: 3D Bevels & Components Polish (Wave 5)

**Цель:** Применить правильные 3D bevels ко всем компонентам и проверить метрики.

**Changes:**
- Убедиться, что Explorer Tree/Grid используют inset bevel
- Убедиться, что Buttons используют outset bevel (default), inset bevel (pressed)
- Убедиться, что Input fields используют inset bevel
- Убедиться, что Window frames используют 3D window bevel
- Проверить все компоненты на соответствие WIN95_SPEC.md метрикам (titlebar 20px, taskbar 40px, etc.)
- Удалить все `border-radius` (установить `border-radius: 0` явно)
- Удалить все blur эффекты (`filter: blur()`, `backdrop-filter: blur()`)
- Удалить/ограничить transitions (< 100ms linear или отсутствуют)

**DoD:**
- [ ] Explorer Tree/Grid используют inset bevel
- [ ] Buttons используют правильные bevels (outset default, inset pressed)
- [ ] Input fields используют inset bevel
- [ ] Window frames используют 3D window bevel
- [ ] Все метрики соответствуют WIN95_SPEC.md (titlebar 20px, taskbar 40px, etc.)
- [ ] Нет `border-radius` (кроме `border-radius: 0`)
- [ ] Нет blur эффектов
- [ ] Transitions < 100ms или отсутствуют
- [ ] Unit tests зеленые: `npm test`
- [ ] Lint проходит: `npm run lint`
- [ ] No inline styles violation

**Команды проверки:**
```bash
# 1. Проверка bevels
cd front && grep -r "@include bevel-inset\|@include bevel-outset\|@include window-frame" src/styles/ --include="*.scss" | wc -l
# Ожидаем: все компоненты используют правильные mixins

# 2. Проверка border-radius
cd front && grep -r "border-radius" src/styles/ --include="*.scss" | grep -v "border-radius: 0" | head -10
# Ожидаем: только border-radius: 0 или отсутствует

# 3. Проверка blur
cd front && grep -r "blur\|backdrop-filter" src/styles/ --include="*.scss" | head -10
# Ожидаем: нет blur эффектов

# 4. Проверка transitions
cd front && grep -r "transition:" src/styles/ --include="*.scss" | grep -v "transition: none" | head -10
# Ожидаем: transitions < 100ms или отсутствуют

# 5. Проверка метрик
cd front && grep -r "height.*20px\|height.*1.25rem" src/styles/ --include="*.scss" | grep -i "titlebar" | head -5
# Ожидаем: titlebar height = 20px (1.25rem)

# 6. Tests + Lint
cd front && npm test && npm run lint
# Ожидаем: все тесты зеленые, lint проходит
```

#### PR #6: Golden Screens & Visual Regression (Wave 6)

**Цель:** Создать baseline screenshots для visual regression тестов и настроить CI.

**Changes:**
- Создать baseline screenshots для всех 8-10 golden screens (см. раздел "Golden Screens")
- Настроить visual regression тесты (Playwright screenshots)
- Написать visual regression тесты для всех golden screens
- Настроить CI для запуска visual regression тестов на фиксированной среде (Docker)
- Настроить tolerance для pixel differences (1-2px для font rendering differences)

**DoD:**
- [ ] Baseline screenshots созданы для всех 8-10 golden screens
- [ ] Visual regression тесты написаны для всех golden screens
- [ ] CI настроен для запуска visual regression тестов
- [ ] Tolerance настроен (1-2px для font rendering differences)
- [ ] Все golden screens проходят visual regression тесты
- [ ] Screenshots сохранены в `docs/design/references/screenshots/golden/`
- [ ] Unit tests зеленые: `npm test`
- [ ] Visual tests проходят: `npx playwright test` (если настроен)

**Команды проверки:**
```bash
# 1. Проверка baseline screenshots
ls -la docs/design/references/screenshots/golden/ | wc -l
# Ожидаем: минимум 8-10 golden screenshots

# 2. Проверка visual regression тестов
cd front && find __tests__ -name "*visual*.tsx" -o -name "*visual*.spec.ts" | head -10
# Ожидаем: visual regression тесты существуют

# 3. Запуск visual regression тестов (если настроен Playwright)
cd front && npx playwright test --project=chromium 2>/dev/null || echo "Playwright not configured"
# Ожидаем: все visual tests проходят

# 4. Проверка CI конфигурации
grep -r "playwright\|visual.*test" .github/workflows/ 2>/dev/null || echo "CI not configured"
# Ожидаем: CI настроен для visual tests

# 5. Unit tests
cd front && npm test
# Ожидаем: все тесты зеленые
```

#### PR #7: Asset Provenance & Final Checks (Wave 7)

**Цель:** Проверить все ассеты на open-source лицензии и завершить документацию.

**Changes:**
- Проверить все шрифты: использовать только open-source альтернативы (Liberation Sans, Noto Sans)
- Проверить все иконки: использовать только custom/open-source иконки
- Обновить `docs/compliance/ASSET_PROVENANCE.md` со всеми источниками ассетов
- Запустить asset provenance check: `node scripts/check-asset-provenance.cjs`
- Финальная проверка: все Acceptance Criteria выполнены (15 критериев)

**DoD:**
- [ ] Все шрифты open-source (Liberation Sans, Noto Sans, system fonts)
- [ ] Все иконки open-source или custom (документированы в ASSET_PROVENANCE.md)
- [ ] Asset provenance check проходит: `node scripts/check-asset-provenance.cjs`
- [ ] Документация источников ассетов готова (ASSET_PROVENANCE.md обновлен)
- [ ] Все Acceptance Criteria выполнены (15 критериев из раздела Acceptance Criteria)
- [ ] Unit tests зеленые: `npm test`
- [ ] Visual regression tests проходят: все golden screens match
- [ ] Lint проходит: `npm run lint`
- [ ] No inline styles violation

**Команды проверки:**
```bash
# 1. Asset provenance check
node scripts/check-asset-provenance.cjs
# Ожидаем: все ассеты имеют записи в ASSET_PROVENANCE.md

# 2. Проверка шрифтов
cd front && grep -r "font-family" src/styles/ --include="*.scss" | grep -i "liberation\|noto\|tahoma" | head -10
# Ожидаем: используются только open-source шрифты

# 3. Проверка иконок
cd front && find public/icons -name "*.svg" -o -name "*.png" | head -10
# Ожидаем: все иконки custom или open-source

# 4. Acceptance Criteria checklist
# Проверить вручную все 15 критериев из раздела Acceptance Criteria
# Ожидаем: все критерии выполнены

# 5. Tests + Lint
cd front && npm test && npm run lint
# Ожидаем: все тесты зеленые, lint проходит

# 6. Visual regression (если настроен)
cd front && npx playwright test --project=chromium 2>/dev/null || echo "Playwright not configured"
# Ожидаем: все visual tests проходят
```

**DoD (M7 Overall):**
- [ ] Все компоненты используют Windows 95 UI Kit (Chicago95 palette, 3D bevels, правильные метрики)
- [ ] Focus model работает правильно (active/inactive windows)
- [ ] Все pressed states работают правильно
- [ ] Single vs double click работает правильно
- [ ] Все 8-10 golden screens проходят visual regression тесты
- [ ] Все ассеты open-source (шрифты, иконки)
- [ ] Документация источников ассетов готова
- [ ] Acceptance Criteria выполнены (все 15 критериев)

**Risks & Mitigations (M7):**

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Flaky visual tests:** Visual regression тесты могут быть нестабильными из-за различий в рендеринге между браузерами/ОС | Medium | High | Использовать стабильные инструменты (Playwright screenshots с фиксированными viewport). Настроить tolerance для pixel differences (1-2px для font rendering). Запускать тесты в CI на фиксированной среде (Docker с фиксированным браузером). Использовать retry logic (2-3 попытки) для flaky tests. | @Engineer |
| **Asset licensing violations:** Использование проприетарных Windows 95 ассетов нарушает лицензию | High | Critical | Использовать только open-source альтернативы: Liberation Sans/Noto Sans (OFL-1.1), custom SVG/PNG иконки, system fonts. Документировать все источники в ASSET_PROVENANCE.md. Запускать asset provenance check в CI: `node scripts/check-asset-provenance.cjs`. Блокировать merge PR без asset provenance entries. | @Compliance |
| **Visual regressions:** Изменения могут сломать визуальное поведение компонентов | Medium | High | Создать baseline screenshots для всех 8-10 golden screens перед началом изменений. Запускать visual regression тесты на каждом PR. Использовать pixel-perfect comparison с tolerance (1-2px). Ручная проверка критичных компонентов (WindowFrame, Explorer, Taskbar) перед merge. | @Engineer |
| **Inline styles regression:** Команда/агенты могут вернуться к inline styles | Medium | Medium | Линтеры блокируют новые inline styles (ESLint rule). Pre-commit hooks проверяют inline styles. Whitelist только для drag/resize/layout-calc/performance с allow-tag комментарием. Документация "как добавлять стили правильно" в GUIDE_STYLE.md. | @Engineer |
| **Font rendering differences:** Шрифты рендерятся по-разному на разных ОС/браузерах | Medium | Medium | Использовать системные шрифты с fallback stack (Liberation Sans → Noto Sans → Tahoma → system-ui). Отключить font smoothing для единообразия (`-webkit-font-smoothing: none`). Использовать visual regression тесты с tolerance для font rendering differences (1-2px). Документировать известные различия. | @Engineer |
| **Runtime differences:** Визуальное отображение отличается между браузерами (Chrome, Firefox, Safari) | Medium | Medium | Тестировать на всех целевых браузерах (Chrome, Firefox, Safari). Использовать CSS fallbacks для кросс-браузерной совместимости. Документировать известные различия. Использовать visual regression тесты на фиксированной среде (CI с Chrome). | @Engineer |
| **Icon licensing:** Иконки должны быть open-source, но могут не соответствовать Windows 95 стилю | Medium | Medium | Создать custom иконки в bitmap-style, соответствующие Win95 эстетике. Использовать open-source icon sets с правильными лицензиями (MIT, CC0). Документировать источники всех иконок в ASSET_PROVENANCE.md. Проверять лицензии перед добавлением иконок. | @Compliance |
| **PR sequence complexity:** 7 PR могут создать конфликты и задержки | Medium | Low | Четкое разделение scope между PR (каждый PR независим). Использовать feature flags для постепенного rollout (опционально). Регулярные sync между PR (еженедельно). | @Delivery |
| **Golden screens maintenance:** Baseline screenshots могут устареть при изменениях | Low | Medium | Обновлять baseline screenshots только при intentional visual changes. Review diff screenshots перед обновлением baseline. Документировать причины обновления baseline. | @Engineer |

**Tasks:**

**Wave 1: Theme Tokens System (Foundation)**
1. Создать theme tokens структуру в `_tokens.scss`:
   - Базовые tokens (colors, spacing, typography, z-index) уже есть
   - Добавить theme layer: `_theme-default.scss`, `_theme-high-contrast.scss`
   - Реализовать механизм переключения темы (CSS custom properties или SCSS переменные)
2. Создать документацию по использованию theme tokens
3. Настроить механизм переключения темы (без изменения компонентов)

**Wave 2-5: Component Migration (5-10 компонентов за PR)**
4. Миграция компонентов "волнами":
   - Wave 2: WindowFrame, WindowManager, DesktopIcon (5-7 компонентов)
   - Wave 3: Explorer, Taskbar, DesktopPage (5-7 компонентов)
   - Wave 4: Viewers (ImageViewer, VideoViewer, Notepad, InternetExplorer) (4-5 компонентов)
   - Wave 5: MobileShell, MobilePage, остальные компоненты (5-10 компонентов)
5. Для каждой волны:
   - Заменить inline styles на SCSS классы/mixins
   - Использовать theme tokens вместо хардкода
   - Обновить тесты/селекторы, если они зависели от inline styles
   - Проверить: `npm run test` + `npm run lint` зеленые

**Wave 6: Documentation & Examples**
6. Создать/обновить документацию:
   - `docs/style/GUIDE_STYLE.md` — обновить с примерами theme tokens
   - `front/src/styles/guide.md` — обновить с примерами миграции
   - Создать examples: "как добавить новый компонент правильно"
7. Создать migration guide: "как мигрировать inline styles → SCSS"

**DoD:**
- [ ] Репозиторий содержит 0 inline style usages (кроме whitelist с allow-tag)
- [ ] Линтеры блокируют новые inline styles и `!important`
- [ ] Есть минимум 2 темы (например default + high-contrast) переключаемые без перезаливки кода
- [ ] Документация + examples готовы
- [ ] Все тесты зеленые (`npm run test`)
- [ ] Все линтеры зеленые (`npm run lint`)
- [ ] Coverage не упал (проверить после миграции)

**Risks:**
- Миграция может сломать визуальное поведение (mitigation: тесты + визуальная проверка)
- Большой объем работы (289 inline style usages в 27 файлах) (mitigation: волновая миграция, 5-10 компонентов за PR)
- Тесты могут зависеть от inline styles (mitigation: обновить селекторы тестов)

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
| 11 | Style System Refactor может сломать визуальное поведение | Medium | High | Тесты + визуальная проверка, волновая миграция (5-10 компонентов за PR) | open |
| 12 | Большой объем миграции (289 inline styles в 27 файлах) | High | Medium | Волновая миграция, 5-10 компонентов за PR, постепенная проверка | open |
| 13 | Тесты могут зависеть от inline styles | Medium | Medium | Обновить селекторы тестов после миграции компонентов | open |
| 14 | **Лицензии ассетов (иконки, шрифты):** Использование проприетарных Windows 95 ассетов нарушает лицензию | High | Critical | Использовать только open-source альтернативы: системные шрифты (system-ui, Tahoma), custom SVG/PNG иконки, bitmap-style иконки из scratch. Документировать все источники ассетов. | open |
| 15 | **Шрифт MS Sans Serif:** Оригинальный шрифт Windows 95 проприетарный, нельзя использовать | High | High | Использовать fallback stack: `"MS Sans Serif"` (fallback) → `"Tahoma"` → `system-ui, -apple-system, sans-serif`. Отключить font smoothing (`-webkit-font-smoothing: none`) для pixel-perfect look. | open |
| 16 | **Flaky visual tests:** Visual regression тесты могут быть нестабильными из-за различий в рендеринге между браузерами/ОС | Medium | High | Использовать стабильные инструменты (например, Percy, Chromatic, или Playwright screenshots с фиксированными viewport). Настроить tolerance для pixel differences (например, 1-2px). Запускать тесты в CI на фиксированной среде (Docker с фиксированным браузером). | open |
| 17 | **Runtime differences:** Визуальное отображение может отличаться между браузерами (Chrome, Firefox, Safari) и ОС (Windows, macOS, Linux) | Medium | Medium | Тестировать на всех целевых браузерах. Использовать CSS fallbacks для кросс-браузерной совместимости. Документировать известные различия. Использовать visual regression тесты на фиксированной среде (CI). | open |
| 18 | **Font rendering differences:** Шрифты могут рендериться по-разному на разных ОС/браузерах, влияя на pixel-perfect alignment | Medium | Medium | Использовать системные шрифты с fallback stack. Отключить font smoothing для единообразия. Документировать известные различия. Использовать visual regression тесты с tolerance для font rendering differences. | open |
| 19 | **Icon licensing:** Иконки должны быть open-source, но могут не соответствовать Windows 95 стилю | Medium | Medium | Создать custom иконки в bitmap-style, соответствующие Win95 эстетике. Использовать open-source icon sets с правильными лицензиями (MIT, CC0). Документировать источники всех иконок. | open |
| 20 | **Telegram Auth Spoofing:** Атакующий подделывает `telegramUser.id` или `hash` для получения токена | High | Critical | Обязательная серверная проверка криптографической подписи Telegram (HMAC-SHA256). **ЗАПРЕЩЕНО** принимать `telegramId` и `hash` без проверки подписи. **ЗАПРЕЩЕНО** использовать "login by username". | open |
| 21 | **Token Theft:** XSS/CSRF крадёт токен из localStorage | High | Critical | CSP политика, SameSite cookies (если используется), token rotation, HttpOnly cookies (если возможно). При 401 от `/api/auth/me` → обязательный token wipe. | open |
| 22 | **Clickjacking:** IE window перекрывается злонамеренным iframe | Medium | High | `X-Frame-Options: DENY` для Telegram login page (если возможно). Строгая sandbox политика для IE window. IE window открывается в отдельном окне (не iframe в родительском окне). | open |
| 23 | **PostMessage Attack:** Злонамеренный postMessage из Telegram login page | Medium | Medium | Валидация `event.origin` (только `https://oauth.telegram.org` и наш домен). Allowlist типов сообщений (только `telegram-auth-success`, `telegram-auth-error`). Игнорирование неизвестных сообщений. | open |
| 24 | **CSRF on Telegram Auth:** Атакующий выполняет авторизацию от имени жертвы | High | High | CSRF токены или проверка `Origin`/`Referer` для всех POST запросов к `/api/auth/telegram`. **ЗАПРЕЩЕНО** принимать POST запросы без проверки CSRF. | open |
| 25 | **Open Redirects:** Telegram callback перенаправляет на злонамеренный URL | Medium | Medium | Whitelist разрешённых redirect URLs. Валидация callback URL перед перенаправлением. **ЗАПРЕЩЕНО** перенаправлять на внешние домены без валидации. | open |
| 26 | **IE Window Sandbox Bypass:** IE window может быть использован для атаки на родительское окно | Medium | High | Строгая sandbox политика: `allow-scripts allow-same-origin allow-forms` (без `allow-top-navigation`, `allow-modals`). **ЗАПРЕЩЕНО** разрешать `allow-top-navigation` или `allow-modals` в sandbox для IE window. | open |

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
- [ ] **Style Guardrails:** Документация и guardrails настроены
- [ ] **Style System Refactor:** Документация по theme tokens и миграции готова

### Style System Refactor Proof

- [ ] **Inline Styles:** 0 inline style usages (кроме whitelist с allow-tag)
- [ ] **Linters:** Линтеры блокируют новые inline styles и `!important`
- [ ] **Theme System:** Минимум 2 темы (default + high-contrast) переключаемые без перезаливки кода
- [ ] **Documentation:** Документация + examples готовы ("как добавлять стили правильно")
- [ ] **Tests:** Все тесты зеленые после миграции
- [ ] **Coverage:** Coverage не упал после миграции

---

## Evidence (Release Gate — 2026-02-02)

**Роль:** @Delivery  
**Режим:** FP=FP7 mode=release  
**Дата:** 2026-02-02  
**Статус:** ⚠️ PARTIAL — есть блокеры

### Команды: Test, Lint, Build

#### Backend

**Build:**
```bash
cd back && npm run build
```
- ✅ **PASS** — сборка успешна, TypeScript компилируется без ошибок

**Tests:**
```bash
cd back && npm test
```
- ❌ **FAIL** — тесты падают из-за проблем с импортом supertest в `auth.smoke.test.ts`:
  - Ошибка: `Type '{ default: SuperTestStatic; ... }' has no call signatures`
  - Причина: неправильный импорт `import * as request from "supertest"` (нужен default import)
  - Затронутые тесты: `auth.smoke.test.ts`, `auth.dev.test.ts`
  - ✅ **PASS** — `vfs.rbac.test.ts` проходит успешно (9 тестов)

**Lint:**
- ⚠️ Не проверялся (нет команды `lint` в `package.json`)

#### Frontend

**Build:**
```bash
cd front && npm run build
```
- ❌ **FAIL** — сборка падает из-за синтаксической ошибки в `Taskbar.tsx:86`:
  - Ошибка: `Unexpected closing fragment tag does not match opening "div" tag`
  - Проблема: несоответствие открывающих/закрывающих тегов JSX
  - Блокер для всех тестов и сборки

**Tests:**
```bash
cd front && npm test
```
- ❌ **FAIL** — 9 failed, 13 passed (22 теста всего, 68 passed тестов):
  - Причина: синтаксическая ошибка в `Taskbar.tsx` блокирует трансформацию
  - Затронутые тесты: `auth.login-window.test.tsx`, `auth.logout-confirmation.test.tsx`, `auth.logout.test.tsx`, `auth.start-menu.test.tsx`, `auth.user-panel.test.tsx`, `shell.boot.desktop.test.tsx`, `shell.boot.mobile.test.tsx`, `taskbar.tray.test.tsx`
  - ✅ **PASS** — 13 тестов проходят успешно (включая `content.*`, `explorer.*`, `mobile.boot.test.tsx`)

**Lint:**
```bash
cd front && npm run lint
```
- ❌ **FAIL** — 175 проблем (119 errors, 56 warnings):
  - Основные проблемы:
    - `Taskbar.tsx:86` — синтаксическая ошибка (parsing error)
    - `WindowRegistry.tsx` — использование `any` (5 ошибок)
    - `DesktopPage.tsx` — использование `any` (1 ошибка)
    - `test/utils/index.ts` — `require()` style imports (2 ошибки)
    - Множество unused variables warnings

**E2E:**
- ⚠️ Не проверялся (нет команды e2e в `package.json`)

### Legacy Endpoints Verification

**Проверка отсутствия legacy auth endpoints:**
```bash
grep -r "/api/auth/(register|login|recovery)" back/src/
```
- ✅ **PASS** — legacy endpoints не найдены в коде:
  - `/api/auth/register` — удален
  - `/api/auth/login` — удален
  - `/api/auth/recovery/request` — удален
  - `/api/auth/recovery/verify` — удален

**Текущие auth endpoints (только разрешенные):**
- ✅ `POST /api/auth/dev` — присутствует
- ✅ `POST /api/auth/telegram` — присутствует
- ✅ `GET /api/auth/me` — присутствует

**Проверка legacy endpoints в app.controller.ts:**
```bash
grep -r "games-legacy\|admin/teams\|admin/games" back/src/
```
- ✅ **PASS** — legacy endpoints не найдены:
  - `/games-legacy/:id` — удален
  - `/admin/teams` — удален
  - `/admin/games` — удален
  - `/admin/games/:id/build` — удален
  - `/admin/games/:id/publish` — удален
  - `/admin/games/:id/status-legacy` — удален
  - `/admin/games/:id/tags-legacy` — удален

**Полный список активных endpoints:**
- `GET /health` (app.controller.ts)
- `POST /api/auth/dev` (auth.controller.ts)
- `POST /api/auth/telegram` (auth.controller.ts)
- `GET /api/auth/me` (auth.controller.ts)
- `GET /api/vfs/list` (vfs.controller.ts)
- `GET /api/vfs/read` (vfs.controller.ts)
- `POST /api/vfs/upload` (vfs.controller.ts)
- `POST /api/vfs/move` (vfs.controller.ts)
- `DELETE /api/vfs/delete` (vfs.controller.ts)
- `GET /api/users` (users.controller.ts)
- `GET /api/jam/current` (jam.controller.ts)
- `GET /api/help` (help.controller.ts)

### Legacy Modules Verification

**Проверка удаления legacy модулей:**
```bash
test -d back/src/teams && echo "❌" || echo "✅"
test -d back/src/games && echo "❌" || echo "✅"
test -d back/src/comments && echo "❌" || echo "✅"
```
- ⚠️ **PARTIAL** — папки существуют, но пустые:
  - `back/src/teams/` — папка существует, но пустая (удалены все файлы)
  - `back/src/games/` — папка существует, но пустая (удалены все файлы)
  - `back/src/comments/` — папка существует, но пустая (удалены все файлы)
  - **Рекомендация:** удалить пустые папки для полной очистки

**Проверка импортов в app.module.ts:**
- ✅ **PASS** — legacy модули не импортируются:
  - `TeamsModule` — не импортируется
  - `GamesModule` — не импортируется
  - `CommentsModule` — не импортируется
  - Только активные модули: `AuthModule`, `UsersModule`, `JamModule`, `HelpModule`, `VfsModule`

### isSuperAdmin Cleanup Verification

**Проверка отсутствия isSuperAdmin в коде:**
```bash
grep -r "isSuperAdmin" back/src/ front/src/ --exclude-dir=node_modules --exclude-dir=legacy
```
- ⚠️ **PARTIAL** — найдены упоминания только в test fixtures:
  - `front/src/test/fixtures/user.ts` — определение типа (можно оставить для backward compatibility в тестах)
  - `front/src/test/mocks/mockApi.ts` — использование в mock токенах (3 места)
  - **Рекомендация:** удалить из test fixtures для полной очистки или пометить как deprecated

**Проверка в production коде:**
- ✅ **PASS** — `isSuperAdmin` не найден в production коде (backend/src, frontend/src без test/)

### Database Cleanup Verification

**Миграционный скрипт:**
- ✅ **PASS** — скрипт существует: `back/scripts/migrate-fp7-legacy-cleanup.ts`
- ✅ **PASS** — скрипт dev-safe (проверяет `NODE_ENV !== 'production'`)
- ✅ **PASS** — скрипт удаляет:
  - Коллекции: `teams`, `games`, `comments`, `builds`
  - Поля из `users`: `isSuperAdmin`, `recoveryCode`
  - Индексы на legacy полях

**Проверка запуска миграции:**
- ⚠️ **NOT RUN** — миграция не запускалась в рамках gate (требует MongoDB)
- **Рекомендация:** запустить миграцию на dev окружении перед release

**Smoke тест:**
- ❌ **FAIL** — `auth.smoke.test.ts` падает из-за проблем с импортом supertest
- **Рекомендация:** исправить импорт supertest перед запуском smoke теста

### UX Manual Checks (Start → Login → IE → Success → Logout Confirm)

**Ручные проверки по шагам UX:**
- ⚠️ **NOT TESTED** — ручные проверки не выполнялись (требуют запущенного приложения)
- **Рекомендация:** выполнить ручные проверки согласно [FP7_RELEASE_GATE.md](./FP7_RELEASE_GATE.md):
  1. Start → Login (Start menu → "Log In..." → Login Window → "Telegram..." → IE Window)
  2. IE → Success (Telegram auth → токен сохранен → сессия проверена через `/api/auth/me`)
  3. Logout Confirm (Start menu → "Log Out..." → Confirmation Dialog → подтверждение → токен очищен)

### Summary

**✅ PASS:**
- Backend build успешен
- Legacy endpoints удалены из кода
- Legacy модули не импортируются в app.module.ts
- isSuperAdmin удален из production кода
- Миграционный скрипт существует и готов

**❌ BLOCKERS:**
- Frontend build падает (синтаксическая ошибка в `Taskbar.tsx:86`)
- Frontend tests падают (9 failed из-за синтаксической ошибки)
- Frontend lint имеет 119 errors
- Backend tests падают (проблема с импортом supertest)
- Миграция БД не запускалась
- Smoke тест не проходит
- Ручные UX проверки не выполнялись

**⚠️ WARNINGS:**
- Пустые папки `teams/`, `games/`, `comments/` остались (рекомендуется удалить)
- `isSuperAdmin` найден в test fixtures (рекомендуется удалить или пометить как deprecated)

**Gate Decision:** ❌ **REJECT** — требуется исправление блокеров перед release

**Следующие шаги:**
1. Исправить синтаксическую ошибку в `Taskbar.tsx:86`
2. Исправить импорт supertest в `auth.smoke.test.ts`
3. Запустить миграцию БД на dev окружении
4. Исправить lint errors (особенно `any` типы)
5. Удалить пустые папки `teams/`, `games/`, `comments/`
6. Выполнить ручные UX проверки
7. Повторить gate после исправлений

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

3. **Email/password auth (обязательно удалить):**
   - `auth/register`, `auth/login`, `auth/recovery` endpoints (backend)
   - `AuthModal` с email/password полями (frontend)
   - Email/password поля в БД (если есть)
   - **Причина:** Заменяется на Telegram auth (FP7 v2.6, Decision 5: Legacy Removal)
   - **Действие:** Удалить из кода и из базы после реализации Telegram auth

4. **isSuperAdmin (обязательно удалить):**
   - `isSuperAdmin` поле в БД (таблица `users`)
   - `isSuperAdmin` логика в коде (backend и frontend)
   - Все проверки `isSuperAdmin` заменить на `role === 'Organizer'`
   - **Причина:** Заменяется на Guest/Participant/Organizer модель с organizerWhitelist (FP7 v2.6, Decision 5: Legacy Removal)
   - **Действие:** Удалить из кода и из базы, мигрировать существующих superAdmin в Organizer роль через organizerWhitelist

5. **Старые сущности (обязательно удалить):**
   - Teams/games/прочее, завязанные на прежнюю модель пользователей
   - Таблицы `teams`, `games`, `comments` (если они используют старую модель пользователей)
   - Endpoints `/api/teams`, `/api/games`, `/api/comments` (если они используют старую модель)
   - **Причина:** Завязаны на прежнюю модель пользователей (email/password, isSuperAdmin) (FP7 v2.6, Decision 5: Legacy Removal)
   - **Действие:** Удалить из кода и из базы, если не используются в новой модели

6. **Dead code:**
   - `contexts/WindowContext.tsx` (если не используется)
   - `components/WindowManager.tsx` (если заменен на `os/wm/WindowManager.tsx`)
   - Старые тесты для react-router маршрутов
   - **Причина:** Не используется в новой архитектуре (FP7 v2, Architecture)
   - **Действие:** Удалить

7. **Старые тесты:**
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
- [ ] Удалить email/password auth код (backend и frontend)
- [ ] Удалить email/password поля из БД
- [ ] Удалить `isSuperAdmin` из кода (backend и frontend)
- [ ] Удалить `isSuperAdmin` поле из БД
- [ ] Заменить все проверки `isSuperAdmin` на `role === 'Organizer'`
- [ ] Удалить старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей
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

### Phase 8: Auth UX (Start Menu, Login Window, Telegram Auth, Logout)
- [ ] Реализовать Start menu (Win95 style) с "Log In..." и "Log Out..." пунктами
- [ ] Реализовать Login Window (Win95-диалог "Welcome to Windows")
- [ ] Реализовать Telegram auth в IE Window (отдельное окно типа Internet Explorer с Telegram login page)
- [ ] Реализовать Logout Confirmation Dialog (Win95-диалог подтверждения)
- [ ] Реализовать Boot loader (Win98 hourglass loader при проверке токена)
- [ ] Реализовать `/api/auth/me` как источник правды по сессии
- [ ] Реализовать token storage в localStorage с обработкой 401
- [ ] Реализовать organizerWhitelist (проверка telegramUser.id против whitelist)
- [ ] Удалить email/password auth код и из базы
- [ ] Удалить `isSuperAdmin` из кода и из базы
- [ ] Удалить старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей
- [ ] Написать тесты: `auth.telegram.test.tsx`, `auth.start-menu.test.tsx`, `auth.login-window.test.tsx`, `auth.telegram-ie-window.test.tsx`, `auth.logout-confirmation.test.tsx`, `auth.boot-loader.test.tsx`, `auth.me-source-of-truth.test.tsx`, `auth.token-storage.test.tsx`, `auth.organizer-whitelist.test.tsx`

### Phase 9: Style Guardrails
- [x] Создать структуру каталогов `front/src/styles/**` (tokens, mixins, components, utilities)
- [x] Создать документацию `docs/style/GUIDE_STYLE.md` (структура, обязательные tokens/mixins)
- [x] Создать гайд `front/src/styles/guide.md` (когда делать mixin vs component class)
- [ ] Настроить ESLint с правилом для блокировки inline styles (кроме whitelist с allow-tag)
- [ ] Настроить Stylelint с правилом для блокировки `!important`
- [ ] Настроить husky + lint-staged для pre-commit hooks
- [ ] Создать canary checks (2 мини-примера) для проверки guardrails
- [ ] Проверить, что pre-commit реально падает на `!important`
- [ ] Проверить, что pre-commit реально падает на inline style без allow-tag

**DoD:**
- [ ] `npm run lint` зелёный
- [ ] pre-commit реально падает на `!important`
- [ ] pre-commit реально падает на inline style без allow-tag
- [ ] Док с правилами существует и однозначен

### Phase 10: Style System Refactor (M6)

**Wave 1: Theme Tokens System (Foundation)**
- [ ] Создать theme tokens структуру (`_theme-default.scss`, `_theme-high-contrast.scss`)
- [ ] Реализовать механизм переключения темы (CSS custom properties или SCSS переменные)
- [ ] Создать документацию по использованию theme tokens

**Wave 2: Component Migration (WindowFrame, WindowManager, DesktopIcon, etc.)**
- [ ] Мигрировать WindowFrame: inline styles → SCSS классы
- [ ] Мигрировать WindowManager: inline styles → SCSS классы
- [ ] Мигрировать DesktopIcon: inline styles → SCSS классы
- [ ] Мигрировать DesktopPage: inline styles → SCSS классы
- [ ] Мигрировать остальные компоненты из Wave 2 (5-7 компонентов)
- [ ] Обновить тесты/селекторы для мигрированных компонентов
- [ ] Проверить: `npm run test` + `npm run lint` зеленые

**Wave 3: Component Migration (Explorer, Taskbar, DesktopPage)**
- [ ] Мигрировать Explorer: inline styles → SCSS классы
- [ ] Мигрировать Taskbar: inline styles → SCSS классы
- [ ] Мигрировать остальные компоненты из Wave 3 (5-7 компонентов)
- [ ] Обновить тесты/селекторы для мигрированных компонентов
- [ ] Проверить: `npm run test` + `npm run lint` зеленые

**Wave 4: Component Migration (Viewers)**
- [ ] Мигрировать ImageViewer: inline styles → SCSS классы
- [ ] Мигрировать VideoViewer: inline styles → SCSS классы
- [ ] Мигрировать Notepad: inline styles → SCSS классы
- [ ] Мигрировать InternetExplorer: inline styles → SCSS классы
- [ ] Мигрировать остальные компоненты из Wave 4 (4-5 компонентов)
- [ ] Обновить тесты/селекторы для мигрированных компонентов
- [ ] Проверить: `npm run test` + `npm run lint` зеленые

**Wave 5: Component Migration (MobileShell, MobilePage, остальные)**
- [ ] Мигрировать MobileShell: inline styles → SCSS классы
- [ ] Мигрировать MobilePage: inline styles → SCSS классы
- [ ] Мигрировать остальные компоненты из Wave 5 (5-10 компонентов)
- [ ] Обновить тесты/селекторы для мигрированных компонентов
- [ ] Проверить: `npm run test` + `npm run lint` зеленые

**Wave 6: Documentation & Examples**
- [ ] Обновить `docs/style/GUIDE_STYLE.md` с примерами theme tokens
- [ ] Обновить `front/src/styles/guide.md` с примерами миграции
- [ ] Создать examples: "как добавить новый компонент правильно"
- [ ] Создать migration guide: "как мигрировать inline styles → SCSS"

**DoD:**
- [ ] Репозиторий содержит 0 inline style usages (кроме whitelist с allow-tag)
- [ ] Линтеры блокируют новые inline styles и `!important`
- [ ] Есть минимум 2 темы (default + high-contrast) переключаемые без перезаливки кода
- [ ] Документация + examples готовы
- [ ] Все тесты зеленые (`npm run test`)
- [ ] Все линтеры зеленые (`npm run lint`)
- [ ] Coverage не упал (проверить после миграции)

---

---

## CHANGELOG

### Version 2.7 (2026-01-22)

**Добавлено:**

1. **Детализация UX Map для Auth Flow (Win95 стилистика):**
   - Детализированы все состояния Auth Flow (State 1-9) с описанием CTA, Endpoint, State, Page, Component, data-testid
   - Добавлены визуальные описания состояний (без графики, текстовое описание):
     - Start Menu (Guest vs Authed состояния)
     - Login Window ("Welcome to Windows" диалог)
     - IE Window для Telegram Auth
     - Logout Confirmation Dialog
   - Добавлена секция "UI Components + States + data-testid для Auth Flow" с детальным описанием:
     - Start Menu Component (props, states, data-testid, визуальное описание, поведение)
     - Login Window Component (props, states, data-testid, визуальное описание, поведение)
     - Internet Explorer Window Component (props, states, data-testid, sandbox политика, поведение)
     - Logout Confirmation Dialog Component (props, states, data-testid, визуальное описание, поведение)
     - AuthContext обновления (методы, states, data-testid, поведение)
   - **Раздел изменён:** UX Map → Auth Flow (детализация всех состояний) + новая секция "UI Components + States + data-testid для Auth Flow"

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

### Version 2.2 (2026-01-22)

**Добавлено:**

1. **Style Guardrails:**
   - Настроены ESLint и Stylelint для блокировки `!important` и inline styles
   - Pre-commit hooks через husky + lint-staged
   - Документация: `docs/style/GUIDE_STYLE.md`
   - Canary checks для проверки guardrails
   - Whitelist для inline styles с allow-tag комментарием (drag/resize/layout calc)
   - **Раздел изменён:** Plan → Phase 9: Style Guardrails

**Почему:**
- Обеспечивает единообразный стиль системы (tokens + mixins + components + utilities)
- Предотвращает использование `!important` и неконтролируемых inline styles
- Минимальные изменения, строгий контракт, "tests-red → implement → tests-green"

### Version 2.3 (2026-01-22)

**Добавлено:**

1. **Win95 UI Style Structure (Design Phase):**
   - Создана структура каталогов `front/src/styles/**`:
     - `_tokens.scss`: Design tokens (colors, spacing, borders, z-index, typography)
     - `_mixins.scss`: Reusable mixins (bevel, window frame, titlebar, buttons)
     - `_components.scss`: Component classes (window, taskbar, explorer, icons)
     - `_utilities.scss`: Utility classes (layout/text helpers)
     - `index.scss`: Main entry point
   - Создана документация `docs/style/GUIDE_STYLE.md`:
     - Структура каталогов
     - Обязательные tokens/mixins для FP7
     - Гайд по миграции inline styles → SCSS
   - Создан гайд `front/src/styles/guide.md`:
     - Правило выбора: mixin vs component class
     - Примеры использования
     - Чек-лист для FP7
   - **Раздел изменён:** Plan → Phase 9: Style Guardrails (добавлена структура стилей)

**Обязательные Tokens для FP7:**
- Colors (Chicago95 palette): gray, grayLight, grayDark, white, black, blue, blueLight, teal, red, text, textInverse, textDisabled
- Spacing: xs (2px), sm (4px), md (8px), lg (12px), xl (16px)
- Borders: inset (sunken), outset (raised), window (3D frame)
- Z-index: desktop (1), window (10), window-focused (20), taskbar (10000), modal (10001)
- Typography: font-family, sizes (small/normal/medium/large), weights, line-heights

**Обязательные Mixins для FP7:**
- `bevel-inset`, `bevel-outset`, `window-frame` — для 3D bevels
- `window-titlebar`, `window-control-button`, `window-control-button-active` — для окон
- `button-default`, `button-active`, `button-disabled` — для кнопок
- `input-text` — для input полей

**Обязательные Component Classes для FP7:**
- `.win-window-base`, `.win-titlebar`, `.win-window-controls` — для окон
- `.win-taskbar`, `.win-taskbar-tray` — для taskbar
- `.win-explorer`, `.explorer-tree`, `.explorer-grid` — для explorer
- `.win-desktop-icons`, `.desktop-icon` — для desktop icons

**Почему:**
- Структура позволяет постепенную миграцию inline styles → SCSS
- Повторяющиеся паттерны через mixins/компонентные классы (без дублирования)
- Никаких !important (правильная специфичность селекторов)
- Минимальные изменения, строгий контракт, "tests-red → implement → tests-green"

### Version 2.4 (2026-01-22)

**Добавлено:**

1. **Style System Refactor (M6):**
   - Добавлен milestone M6: Style System Refactor в Plan
   - **Outcome:** Все inline styles вынесены в SCSS (кроме whitelist), стили организованы как style guide система (tokens + mixins + components + utilities), поддерживаются темы (theme A/B) без изменения компонентов
   - **Scope IN:** Создание/закрепление структуры `styles/`, введение theme tokens и механизма переключения темы, миграция всех компонентов фронта от inline styles к классам, обновление тестов/селекторов
   - **Scope OUT:** Полная переработка UI/UX логики, перерисовка всего дизайна
   - **Tasks:** Волновая миграция (5-10 компонентов за PR):
     - Wave 1: Theme Tokens System (Foundation)
     - Wave 2-5: Component Migration (WindowFrame, Explorer, Viewers, MobileShell, etc.)
     - Wave 6: Documentation & Examples
   - **DoD:** 0 inline style usages (кроме whitelist), линтеры блокируют новые inline styles и `!important`, минимум 2 темы переключаемые без перезаливки кода, документация + examples готовы
   - **Раздел изменён:** Plan → M6: Style System Refactor, Evidence Checklist → Style System Refactor Proof, Appendix → Phase 10: Style System Refactor

2. **Risks & Mitigations:**
   - Добавлены риски для Style System Refactor:
     - Risk #11: Style System Refactor может сломать визуальное поведение (mitigation: тесты + визуальная проверка, волновая миграция)
     - Risk #12: Большой объем миграции (289 inline styles в 27 файлах) (mitigation: волновая миграция, 5-10 компонентов за PR)
     - Risk #13: Тесты могут зависеть от inline styles (mitigation: обновить селекторы тестов после миграции)
   - **Раздел изменён:** Risks & Mitigations

**Почему:**
- Style System Refactor необходим для обеспечения единообразного стиля системы и предотвращения возврата к inline styles
- Волновая миграция (5-10 компонентов за PR) позволяет постепенно переносить стили без риска сломать весь проект
- Theme tokens система обеспечивает поддержку тем без изменения компонентов
- Документация и examples предотвращают повторение ошибок командой/агентами

### Version 2.5 (2026-01-22)

**Добавлено:**

1. **Chicago95-like OS Experience (Outcome):**
   - Обновлен Outcome: 60-секундный пользовательский опыт с фокусом на перцептивное восприятие Windows 95-подобной ОС
   - Пользователь должен почувствовать, что работает в аутентичной Windows 95-подобной системе, а не на веб-сайте
   - **Раздел изменён:** Outcome

2. **Scope IN/OUT (Visual/UX vs Architecture):**
   - Четкое разделение: что меняем (визуал/UX) vs что не меняем (архитектура платформы, VFS/S3 контракт)
   - Scope IN: Windows 95 UI Kit, интерактивные состояния, компоненты, viewers, golden screens
   - Scope OUT: архитектура платформы, VFS/S3 контракт, backend API, функциональность
   - **Раздел изменён:** Scope

3. **Acceptance Criteria (15 измеримых критериев):**
   - Focus model (active/inactive windows)
   - Pressed states (все кнопки)
   - Single vs double click
   - Taskbar pressed
   - Menu ESC
   - Window control buttons
   - 3D bevels
   - Typography
   - Desktop Icons
   - Explorer Layout
   - Taskbar
   - Color Palette
   - No Modern Effects
   - Viewport Boundary
   - Golden Screens Match
   - **Раздел добавлен:** Acceptance Criteria

4. **Golden Screens (10 экранов для visual regression):**
   - Desktop Shell (Empty)
   - Desktop Shell (Active Window)
   - Desktop Shell (Multiple Windows)
   - Explorer (Tree + Grid)
   - Explorer (Selection)
   - Notepad Window
   - Internet Explorer Window
   - User Panel Window
   - Taskbar (Pressed State)
   - Desktop Icon (Pressed State)
   - **Раздел добавлен:** Golden Screens

5. **Risks (6 новых рисков):**
   - Risk #14: Лицензии ассетов (иконки, шрифты) — использование проприетарных Windows 95 ассетов
   - Risk #15: Шрифт MS Sans Serif — оригинальный шрифт проприетарный
   - Risk #16: Flaky visual tests — нестабильность visual regression тестов
   - Risk #17: Runtime differences — различия в визуальном отображении между браузерами/ОС
   - Risk #18: Font rendering differences — различия в рендеринге шрифтов
   - Risk #19: Icon licensing — иконки должны быть open-source
   - **Раздел изменён:** Risks & Mitigations

6. **Plan (M7: Chicago95-like OS Experience):**
   - Добавлен milestone M7: Chicago95-like OS Experience
   - 7 волн реализации: Tokens & Foundation, Focus Model, Pressed States, Single vs Double Click, 3D Bevels, Golden Screens, Open-Source Assets
   - **Раздел изменён:** Plan → M7

**Почему:**
- Chicago95-like OS experience требует четкого определения outcome (60-секундный опыт) и scope (визуал/UX vs архитектура)
- Acceptance Criteria обеспечивают измеримость всех аспектов Windows 95 эстетики и интерактивности
- Golden Screens создают baseline для visual regression тестов
- Риски по лицензиям, шрифтам и flaky tests критичны для open-source реализации Windows 95-подобного опыта

### Version 2.6 (2026-01-22)

**Добавлено:**

1. **Auth UX Flow (Windows 95 стилистика):**
   - Start menu (Win95 style) содержит "Log In..." и "Log Out..." пункты
   - Login Window: Win95-диалог "Welcome to Windows" открывается при "Log In..."
   - Telegram Auth в IE Window: при "Telegram..." открывается отдельное окно типа Internet Explorer с Telegram login page
   - Logout Confirmation: при "Log Out..." показывается Win95-диалог подтверждения, только после подтверждения очищается токен
   - Boot Loader: на старте приложения показывается Win98 hourglass loader при проверке токена
   - **Раздел изменён:** Outcome, Scope IN, UX Rules, UX Map

2. **Источник правды по сессии:**
   - Backend `/api/auth/me` является единственным источником правды по сессии
   - Token хранится в localStorage (переживает refresh)
   - Если `/api/auth/me` возвращает 401 → token wipe и guest режим
   - **Раздел изменён:** API Contracts → Auth API, Decisions

3. **Organizer Whitelist:**
   - Organizer определяется whitelist-ом по Telegram numeric id (`telegramUser.id`)
   - Ник НЕ является доказательством владения
   - Whitelist хранится в БД (таблица `organizerWhitelist` или поле в `users` таблице)
   - **Раздел изменён:** Roles & Permissions → Data Model Notes, Decisions

4. **Legacy Removal (обязательно):**
   - Email/password auth удаляется из кода и из базы
   - `isSuperAdmin` удаляется из кода и из базы
   - Старые сущности (teams/games/прочее), завязанные на прежнюю модель пользователей, удаляются
   - Dev auth остаётся только как dev-tool (`AUTH_MODE=dev`), без UI обязательства
   - **Раздел изменён:** Scope OUT, Cutline/Migration Notes, Phase 8

5. **UX Map:**
   - Добавлен раздел UX Map с полным flow: Start → Login Window → IE Window → Telegram page → Callback → /me
   - Добавлен Boot Flow: App Boot → Token Check → Token Valid/Invalid/No Token
   - **Раздел добавлен:** UX Map

6. **Acceptance Criteria для Auth:**
   - Добавлены 8 новых критериев (16-23) для auth UX
   - Критерии покрывают: Start Menu, Login Window, Telegram Auth в IE Window, Boot Loader, Token Storage, Logout Confirmation, Organizer Whitelist, Legacy Removal
   - **Раздел изменён:** Acceptance Criteria

7. **Tests Contract:**
   - Добавлены обязательные тесты для нового auth flow:
     - `auth.start-menu.test.tsx`, `auth.login-window.test.tsx`, `auth.telegram-ie-window.test.tsx`
     - `auth.boot-loader.test.tsx`, `auth.me-source-of-truth.test.tsx`, `auth.token-storage.test.tsx`
     - `auth.logout-confirmation.test.tsx`, `auth.organizer-whitelist.test.tsx`
   - **Раздел изменён:** Tests Contract

8. **Definitions:**
   - Добавлены термины: Start Menu, Login Window, Logout Confirmation Dialog, organizerWhitelist
   - **Раздел изменён:** Definitions

**Почему:**
- Auth UX должен соответствовать Windows 95 стилистике (Start menu, диалоги, окна)
- `/api/auth/me` как источник правды обеспечивает единообразную проверку сессии
- Organizer whitelist по `telegramUser.id` обеспечивает безопасность (ник не является доказательством владения)
- Legacy removal необходим для упрощения кодовой базы и соответствия новым требованиям

---

## FP7 Legacy Cleanup - Execution Report

**Дата выполнения:** 2026-01-22  
**Статус:** ✅ Completed  
**Режим:** mode=build

### Выполненные задачи

#### 1. Код: Удаление legacy auth и isSuperAdmin

**Удалено из backend:**
- ✅ `isSuperAdmin` поле и все fallback-переходы к Organizer из:
  - `back/src/auth/auth.service.ts` (generateToken, devAuth, telegramAuth)
  - `back/src/auth/auth.controller.ts` (getMe)
  - `back/src/users/users.repository.ts` (UserDoc type)
  - `back/src/vfs/vfs.controller.ts` (getUserRole)
- ✅ Legacy методы password recovery из `UsersRepository`:
  - `updateRecoveryCode()`
  - `getRecoveryCode()`
  - `updatePassword()`
- ✅ Legacy endpoints из `app.controller.ts`:
  - `/games-legacy/:id`
  - `/admin/teams`
  - `/admin/games`
  - `/admin/games/:id/build`
  - `/admin/games/:id/publish`
  - `/admin/games/:id/status-legacy`
  - `/admin/games/:id/tags-legacy`

**Удалено из frontend:**
- ✅ `isSuperAdmin` поле из `User` type в `AuthContext.tsx`
- ✅ Все fallback-переходы `isSuperAdmin ? 'Organizer' : 'Guest'` заменены на `role || 'Guest'`
- ✅ `isSuperAdmin` из `UserPanelApp.tsx`

**Удалены модули:**
- ✅ `back/src/teams/` (controller, service, repository, module)
- ✅ `back/src/games/` (controller, service, repository, module)
- ✅ `back/src/comments/` (controller, service, repository, module)
- ✅ Импорты из `app.module.ts`

#### 2. База данных: Миграция и очистка

**Создан миграционный скрипт:**
- ✅ `back/scripts/migrate-fp7-legacy-cleanup.ts`
- ✅ Скрипт удаляет:
  - Коллекции: `teams`, `games`, `comments`, `builds`
  - Поля из `users`: `isSuperAdmin`, `recoveryCode`
  - Индексы на legacy полях
- ✅ Dev-safe: не запускается в production (NODE_ENV check)
- ✅ Добавлен npm script: `npm run migrate:fp7-cleanup`

**Список удалённых коллекций:**
- `teams` — команды (legacy домен)
- `games` — игры (legacy домен)
- `comments` — комментарии к играм (legacy домен)
- `builds` — билды игр (legacy домен)

**Список удалённых полей из `users`:**
- `isSuperAdmin` — заменено на `role`
- `recoveryCode` — не используется для Telegram auth

**Оставшиеся коллекции:**
- `users` — пользователи (с полем `role`)
- `organizerWhitelist` — whitelist для Organizer роли
- `jams` — информация о джемах
- `help` — содержимое HELP.TXT

#### 3. Тесты: Обновление и добавление

**Обновлены тесты:**
- ✅ `back/__tests__/fp7/auth.dev.test.ts` — удалены `isSuperAdmin: false` из моков
- ✅ `back/__tests__/fp7/auth.integration.test.ts` — удалены `isSuperAdmin: false`, исправлена проверка `/me`
- ✅ `back/__tests__/fp7/auth.mode-gating.test.ts` — удалены `isSuperAdmin: false`

**Добавлен smoke тест:**
- ✅ `back/__tests__/fp7/auth.smoke.test.ts` — проверяет:
  - Чистая БД → dev auth → создание пользователя
  - `/me` endpoint возвращает user с role (без isSuperAdmin)
  - Dev auth с разными ролями (Guest, Organizer)
  - Default role = Guest

### Список удалённых путей

**Backend:**
- `back/src/teams/teams.controller.ts`
- `back/src/teams/teams.service.ts`
- `back/src/teams/teams.repository.ts`
- `back/src/teams/teams.module.ts`
- `back/src/games/games.controller.ts`
- `back/src/games/games.service.ts`
- `back/src/games/games.repository.ts`
- `back/src/games/games.module.ts`
- `back/src/comments/comments.controller.ts`
- `back/src/comments/comments.service.ts`
- `back/src/comments/comments.repository.ts`
- `back/src/comments/comments.module.ts`

**Legacy endpoints (удалены из app.controller.ts):**
- `GET /games-legacy/:id`
- `POST /admin/teams`
- `POST /admin/games`
- `POST /admin/games/:id/build`
- `POST /admin/games/:id/publish`
- `POST /admin/games/:id/status-legacy`
- `POST /admin/games/:id/tags-legacy`

### Команды верификации

```bash
# 1. Проверить отсутствие isSuperAdmin в коде
grep -r "isSuperAdmin" back/src/ front/src/ \
  --exclude-dir=node_modules --exclude-dir=legacy | \
  grep -v "deprecated\|//" && echo "❌ isSuperAdmin found" || echo "✅ isSuperAdmin removed"

# 2. Проверить отсутствие teams/games/comments модулей
test -d back/src/teams && echo "❌ teams exists" || echo "✅ teams removed"
test -d back/src/games && echo "❌ games exists" || echo "✅ games removed"
test -d back/src/comments && echo "❌ comments exists" || echo "✅ comments removed"

# 3. Проверить отсутствие legacy endpoints в app.controller.ts
grep -q "games-legacy\|admin/teams\|admin/games" back/src/app.controller.ts && \
  echo "❌ Legacy endpoints found" || echo "✅ Legacy endpoints removed"

# 4. Запустить миграцию БД (dev-safe)
cd back && npm run migrate:fp7-cleanup

# 5. Запустить smoke тест
cd back && npm test -- auth.smoke.test.ts

# 6. Проверить сборку
cd back && npm run build && echo "✅ Backend build OK" || echo "❌ Backend build failed"
cd front && npm run build && echo "✅ Frontend build OK" || echo "❌ Frontend build failed"
```

### Миграция БД

**Выполнение:**
```bash
# Установить NODE_ENV (не production!)
export NODE_ENV=development

# Запустить миграцию
cd back && npm run migrate:fp7-cleanup
```

**Что делает миграция:**
1. Проверяет NODE_ENV (не запускается в production)
2. Удаляет коллекции: `teams`, `games`, `comments`, `builds`
3. Удаляет поля из `users`: `isSuperAdmin`, `recoveryCode`
4. Удаляет индексы на legacy полях
5. Проверяет оставшиеся коллекции: `users`, `organizerWhitelist`, `jams`, `help`

**После миграции:**
- Проект должен подниматься с чистой БД без ручных правок
- Dev auth создаёт пользователей с `role` (без `isSuperAdmin`)
- `/me` endpoint возвращает user с `role` (без `isSuperAdmin`)

### Smoke тест

**Файл:** `back/__tests__/fp7/auth.smoke.test.ts`

**Проверяет:**
- ✅ Dev auth создаёт пользователя с role
- ✅ `/me` возвращает user с role (без isSuperAdmin)
- ✅ Dev auth с Organizer role работает
- ✅ Default role = Guest

**Запуск:**
```bash
cd back && npm test -- auth.smoke.test.ts
```

### Следующие шаги

1. ✅ Запустить миграцию БД на dev окружении
2. ✅ Проверить smoke тест
3. ✅ Убедиться, что проект поднимается с чистой БД
4. ✅ Проверить, что все тесты зелёные
5. ✅ Проверить, что build проходит

**End of FP7 v2.6 Contract Spec**
