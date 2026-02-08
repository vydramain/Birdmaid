# FP7 Release Gate Checklist

**Роль:** @Delivery  
**Режим:** FP=FP7 mode=release  
**Дата:** 2026-01-22  
**Обновлено:** 2026-02-07  
**Product Lead Decision:** ✅ **RELEASED** (2026-02-07)  
**Время на проверку:** 15 минут (1-проходный сценарий)

## Цель Gate

Проверить готовность FP7 к релизу по критическим критериям:
- Desktop: окна/Explorer/открытие типов/viewport boundary
- Auth: dev-auth локально, роль из БД
- Organizer: upload/move/delete работает
- **Context Menu:** правый клик Desktop/Explorer → Win95-меню; Organizer: Create folder, Upload, Delete, Rename, Move; Guest: Refresh only; Tree view отключено
- Guest: write запрещён
- Security: sandbox/postMessage
- Mobile: отдельная сборка запускается

## Результат Gate

- ✅ **PASS** — все критичные проверки пройдены, FP7 готов к релизу
- ❌ **REJECT** — найдены блокеры, требуется доработка

---

## 1. Подготовка окружения (2 минуты)

### Команды

```bash
# 1. Запустить инфраструктуру (MongoDB + MinIO)
docker compose up -d mongo minio minio-init

# 2. Запустить backend (в отдельном терминале)
cd back
npm run start:dev
# Ожидаем: "Nest application successfully started" на http://localhost:3000

# 3. Запустить frontend (в отдельном терминале)
cd front
npm run dev
# Ожидаем: "Local: http://localhost:5173"
```

### Ожидаемые результаты

- ✅ MongoDB доступен на `mongodb://localhost:27017/birdmaid`
- ✅ MinIO доступен на `http://localhost:9000`
- ✅ Backend отвечает на `GET http://localhost:3000/health` → `200 OK`
- ✅ Frontend открывается на `http://localhost:5173` → Desktop Shell отображается

---

## 2. Desktop: Окна/Explorer/Открытие типов/Viewport Boundary (3 минуты)

### 2.1 Shell Boot

**Проверка:**
- Открыть `http://localhost:5173`
- Проверить, что отображается Desktop Shell (Windows 95 стилистика)

**Ожидаемый результат:**
- ✅ Desktop Shell отображается
- ✅ Desktop Icons видны на рабочем столе

### 2.2 Explorer (Tree + Grid view)

**Проверка:**
- Двойной клик по иконке "My Computer" или Explorer
- Проверить Tree view (слева) и Grid view (справа)
- Кликнуть по папке в Tree view → Grid view обновляется

**Ожидаемый результат:**
- ✅ Explorer открывается как окно
- ✅ Tree view показывает системные папки (`/Disk A`, `/Disk B`, `/Disk C`)
- ✅ Grid view показывает содержимое выбранной папки
- ✅ Навигация работает (клик по папке → обновление Grid view)

### 2.3 Открытие типов контента

**Проверка:**
- В Explorer найти файл с расширением `.png` → двойной клик
- Найти файл `.mp4` → двойной клик
- Найти файл `.txt` → двойной клик
- Найти файл `.html` → двойной клик
- Найти файл `.app` или `webapp` → двойной клик

**Ожидаемый результат:**
- ✅ `.png` → открывается в ImageViewer окне
- ✅ `.mp4` → открывается в VideoViewer окне
- ✅ `.txt` → открывается в Notepad окне
- ✅ `.html` → открывается в Internet Explorer окне
- ✅ `.app`/`webapp` → открывается в Executor iframe окне

### 2.4 Viewport Boundary

**Проверка:**
- Открыть любое окно
- Попытаться перетащить окно за пределы viewport (влево/вправо/вверх/вниз)
- Попытаться изменить размер окна так, чтобы оно вышло за пределы viewport

**Ожидаемый результат:**
- ✅ Окно нельзя утащить за пределы viewport (координаты ограничены)
- ✅ При resize окно не может выйти за пределы viewport
- ✅ Минимальный размер: заголовок окна всегда виден

---

## 3. Auth: Dev-Auth локально, роль из БД (2 минуты)

### 3.1 Dev-Auth Endpoint

**Проверка:**
```bash
# POST /api/auth/dev с ролью Organizer
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-organizer", "role": "Organizer"}'

# POST /api/auth/dev с ролью Guest
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-guest", "role": "Guest"}'
```

**Ожидаемый результат:**
- ✅ Оба запроса возвращают `200 OK` с JWT токеном
- ✅ В ответе есть `user` объект с полем `role: "Organizer"` или `role: "Guest"`
- ✅ JWT токен валиден (можно декодировать)

### 3.2 Роль из БД

**Проверка:**
- В БД создать/обновить пользователя с `role: "Organizer"`
- Выполнить dev-auth с этим `userId`
- Проверить, что роль в ответе соответствует роли в БД

**Ожидаемый результат:**
- ✅ Роль в JWT токене соответствует роли в БД
- ✅ Backend загружает роль из БД при авторизации

### 3.3 User Panel

**Проверка:**
- Авторизоваться через dev-auth (Organizer)
- Кликнуть по User Icon в Taskbar Tray
- Проверить User Panel окно

**Ожидаемый результат:**
- ✅ User Panel открывается как окно (Windows 95 стилистика)
- ✅ Отображается username
- ✅ Отображается роль: "Organizer"
- ✅ Есть кнопка "Log out"

---

## 4. Organizer: Upload/Move/Delete работает (3 минуты)

### 4.1 Upload

**Проверка:**
- Авторизоваться как Organizer
- В Explorer открыть любую папку внутри `/Disk C/...`
- Найти кнопку "Upload" или аналогичную
- Загрузить тестовый файл (например, `test.txt`)

**Ожидаемый результат:**
- ✅ Кнопка Upload видна для Organizer
- ✅ Файл загружается успешно
- ✅ Файл появляется в Grid view Explorer после загрузки
- ✅ Файл доступен через `GET /api/vfs/read?key=...`

### 4.2 Move

**Проверка:**
- В Explorer выбрать файл
- Переместить файл в другую папку (через UI или drag-and-drop, если реализовано)
- Проверить, что файл исчез из исходной папки и появился в целевой

**Ожидаемый результат:**
- ✅ Файл перемещается успешно
- ✅ Файл исчезает из исходной папки
- ✅ Файл появляется в целевой папке
- ✅ Изменения отражаются в Explorer (Tree + Grid view)

### 4.3 Delete

**Проверка:**
- В Explorer выбрать файл
- Удалить файл (через UI или контекстное меню)
- Проверить, что файл исчез из Explorer

**Ожидаемый результат:**
- ✅ Кнопка Delete видна для Organizer
- ✅ Файл удаляется успешно
- ✅ Файл исчезает из Grid view Explorer
- ✅ Файл удаляется из S3 (проверить через MinIO Console)

### 4.4 System Folders Immutability

**Проверка:**
- Попытаться удалить системную папку первого уровня (`/Disk A`, `/Disk B`, `/Disk C`)
- Попытаться переименовать системную папку
- Попытаться переместить системную папку

**Ожидаемый результат:**
- ✅ Попытка удалить/переименовать/переместить system folder → ошибка `PermissionDenied`
- ✅ System folders остаются неизменными

### 4.5 Context Menu (Desktop + Explorer)

**Проверка:**
- Авторизоваться как Organizer
- Правый клик на Desktop (пустое место) → Win95-меню: Create folder, Upload file, Refresh
- Правый клик на Explorer Grid (пустое место) → Create folder, Upload, Refresh
- Правый клик на файле/папке в Explorer → Delete, Rename, Move, Refresh
- Правый клик на `/Disk A` (или root) в Explorer → Delete, Rename, Move скрыты или disabled
- Правый клик по Tree view Explorer → контекстное меню отключено (не показывается)
- Create folder → Win95-диалог → папка создаётся; mkdir API `POST /api/vfs/mkdir` работает
- Авторизоваться как Guest → правый клик Desktop/Explorer → только Refresh

**Ожидаемый результат:**
- ✅ Desktop: Organizer видит Create folder, Upload, Refresh
- ✅ Explorer empty: Organizer видит Create folder, Upload, Refresh
- ✅ Explorer item: Organizer видит Delete, Rename, Move, Refresh (для roots — скрыты)
- ✅ Tree view: контекстное меню не показывается
- ✅ Guest: только Refresh
- ✅ mkdir API работает, 409 (папка существует) → Win95 message box

---

## 5. Guest: Write запрещён (2 минуты)

### 5.1 Guest Read-Only

**Проверка:**
- Авторизоваться как Guest
- В Explorer открыть любую папку
- Проверить, что кнопки Upload/Move/Delete не видны

**Ожидаемый результат:**
- ✅ Кнопки Upload/Move/Delete скрыты для Guest
- ✅ Guest может только просматривать контент (read-only)

### 5.2 Guest API Restrictions

**Проверка:**
```bash
# Получить JWT токен для Guest
TOKEN=$(curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-guest", "role": "Guest"}' | jq -r '.token')

# Попытаться загрузить файл (должно быть запрещено)
curl -X POST http://localhost:3000/api/vfs/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "path=/Disk C/test"

# Попытаться удалить файл (должно быть запрещено)
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk C/test.txt" \
  -H "Authorization: Bearer $TOKEN"
```

**Ожидаемый результат:**
- ✅ `POST /api/vfs/upload` → `403 Forbidden` или `401 Unauthorized`
- ✅ `DELETE /api/vfs/delete` → `403 Forbidden` или `401 Unauthorized`
- ✅ `GET /api/vfs/list` → `200 OK` (read разрешён)
- ✅ `GET /api/vfs/read` → `200 OK` (read разрешён)

---

## 6. Security: Sandbox/PostMessage (2 минуты)

### 6.1 Iframe Sandbox Policy

**Проверка:**
- Открыть webapp файл (`.app` или `webapp`) в Executor
- В DevTools проверить атрибут `sandbox` у iframe

**Ожидаемый результат:**
- ✅ Iframe имеет атрибут `sandbox` с флагами: `allow-scripts allow-same-origin allow-forms allow-popups`
- ✅ Запрещены флаги: `allow-top-navigation`, `allow-modals`
- ✅ Iframe не может перенаправить главное окно

### 6.2 PostMessage Validation

**Проверка:**
- Открыть webapp файл в Executor
- В DevTools Console выполнить:
  ```javascript
  // Попытаться отправить сообщение из iframe
  window.postMessage({ type: 'malformed', data: 'test' }, '*');
  ```
- Проверить, что Shell валидирует сообщения по `event.origin` и схеме

**Ожидаемый результат:**
- ✅ Shell валидирует `event.origin` для сообщений от iframe
- ✅ Malformed сообщения игнорируются
- ✅ Только разрешенные типы сообщений обрабатываются

---

## 7. Mobile: Отдельная сборка запускается (1 минута)

### 7.1 Mobile Build

**Проверка:**
```bash
cd front
npm run build:mobile
```

**Ожидаемый результат:**
- ✅ Сборка завершается без ошибок
- ✅ Создается `front/dist/` с мобильной сборкой

### 7.2 Mobile Preview

**Проверка:**
```bash
cd front
npm run preview:mobile
# Или открыть index-mobile.html в браузере
```

**Ожидаемый результат:**
- ✅ Mobile Shell отображается (Windows Mobile 6.0 стилистика)
- ✅ Навигация работает через экранные "приложения"
- ✅ Контент открывается в соответствующих "приложениях"

---

## 8. Chicago95 Style Gate (5 минут)

### 8.1 Visual Regression Golden Screens

**Проверка:**
```bash
# Если настроен Playwright
cd front
npx playwright test --project=chromium

# Или проверить вручную наличие baseline screenshots
ls -la docs/design/references/screenshots/golden/
```

**Ожидаемый результат:**
- ✅ Baseline screenshots существуют для всех 8-10 golden screens
- ✅ Visual regression тесты проходят (если настроены)
- ✅ Screenshots сохранены в `docs/design/references/screenshots/golden/`

**Golden Screens Checklist:**
- [ ] Desktop Shell (Empty)
- [ ] Desktop Shell (Active Window)
- [ ] Desktop Shell (Multiple Windows)
- [ ] Explorer (Tree + Grid)
- [ ] Explorer (Selection)
- [ ] Notepad Window
- [ ] Internet Explorer Window
- [ ] User Panel Window
- [ ] Taskbar (Pressed State)
- [ ] Desktop Icon (Pressed State)

### 8.2 Asset Provenance Check

**Проверка:**
```bash
node scripts/check-asset-provenance.cjs
```

**Ожидаемый результат:**
- ✅ Asset provenance check проходит без ошибок
- ✅ Все шрифты имеют записи в `docs/compliance/ASSET_PROVENANCE.md`
- ✅ Все иконки имеют записи в `docs/compliance/ASSET_PROVENANCE.md`
- ✅ Все ассеты open-source (MIT, OFL-1.1, CC0) или custom

**Проверка шрифтов:**
```bash
cd front && grep -r "font-family" src/styles/ --include="*.scss" | grep -i "liberation\|noto\|tahoma" | head -5
```
- ✅ Используются только open-source шрифты (Liberation Sans, Noto Sans, Tahoma, system fonts)

**Проверка иконок:**
```bash
cd front && find public/icons -name "*.svg" -o -name "*.png" | wc -l
```
- ✅ Все иконки custom или open-source (документированы)

### 8.3 No Inline Styles Violation

**Проверка:**
```bash
cd front
npm run lint
```

**Ожидаемый результат:**
- ✅ Lint проходит без ошибок inline styles
- ✅ Нет inline styles без allow-tag комментария
- ✅ Whitelist используется только для drag/resize/layout-calc/performance

**Проверка inline styles:**
```bash
cd front && grep -r "style=" src/ --include="*.tsx" | grep -v "// inline-style: allowed" | head -10
```
- ✅ Нет inline styles без allow-tag (кроме whitelist случаев)

### 8.4 Chicago95 Acceptance Criteria

**Проверка вручную (15 критериев):**

1. **Focus Model:**
   - [ ] Active window имеет title bar с синим градиентом, z-index 20
   - [ ] Inactive window имеет title bar серого цвета, z-index 10
   - [ ] Клик по окну → окно становится active

2. **Pressed States:**
   - [ ] Все кнопки имеют pressed state (outset → inset bevel + translate(1px, 1px))
   - [ ] Window control buttons имеют pressed state
   - [ ] Desktop Icons имеют pressed state
   - [ ] Taskbar buttons имеют pressed state

3. **Single vs Double Click:**
   - [ ] Desktop Icons: single-click → selection, double-click → открытие
   - [ ] Explorer Grid: single-click → selection, double-click → открытие

4. **3D Bevels:**
   - [ ] Explorer Tree/Grid используют inset bevel
   - [ ] Buttons используют правильные bevels (outset default, inset pressed)
   - [ ] Input fields используют inset bevel
   - [ ] Window frames используют 3D window bevel

5. **No Modern Effects:**
   - [ ] Нет `border-radius` (кроме `border-radius: 0`)
   - [ ] Нет blur эффектов
   - [ ] Нет glassmorphism
   - [ ] Transitions < 100ms или отсутствуют

**Ожидаемый результат:**
- ✅ Все 15 Acceptance Criteria выполнены

## 9. Тесты (автоматическая проверка) (2 минуты)

### 9.1 Frontend Tests

**Команда:**
```bash
cd front
npm test
```

**Ожидаемый результат:**
- ✅ Все тесты FP7 проходят (16 тестов)
- ✅ Нет падающих тестов

### 9.2 Backend Tests

**Команда:**
```bash
cd back
npm test
```

**Ожидаемый результат:**
- ✅ Все тесты FP7 проходят (3 теста)
- ✅ Нет падающих тестов

### 9.3 Coverage

**Команда:**
```bash
# Frontend
cd front && npm run coverage

# Backend
cd back && npm run coverage
```

**Ожидаемый результат:**
- ✅ Coverage > 70% для новых компонентов FP7
- ✅ Coverage отчеты сгенерированы

---

## Итоговый Gate Decision

### Критерии PASS

Все следующие проверки должны быть ✅:

1. ✅ Desktop Shell работает, Explorer навигация работает
2. ✅ Все типы контента открываются правильными Viewer/Executor
3. ✅ Viewport boundary enforced (окна не выходят за пределы)
4. ✅ Dev-auth работает локально, роль загружается из БД
5. ✅ Organizer может upload/move/delete в subtree
6. ✅ Guest не может писать (read-only)
7. ✅ Iframe sandbox политика работает
8. ✅ PostMessage валидация работает
9. ✅ Mobile сборка запускается
10. ✅ Все тесты FP7 проходят
11. ✅ Visual regression golden screens проходят (8-10 screenshots)
12. ✅ Asset provenance check проходит (все ассеты open-source)
13. ✅ No inline styles violation (lint проходит)
14. ✅ Chicago95 Acceptance Criteria выполнены (15 критериев)

### Критерии REJECT

Если хотя бы одна проверка ❌:

- ❌ Блокер найден → REJECT
- ❌ Требуется доработка → REJECT

---

## Быстрый 1-проходный сценарий (15 минут)

### Шаг 1: Запуск (2 мин)
```bash
docker compose up -d mongo minio minio-init
cd back && npm run start:dev &
cd front && npm run dev &
```

### Шаг 2: Desktop проверка (3 мин)
- Открыть `http://localhost:5173`
- Проверить Explorer (Tree + Grid)
- Открыть файлы разных типов (image, video, txt, html, webapp)
- Проверить viewport boundary (перетащить окно)

### Шаг 3: Auth проверка (2 мин)
```bash
curl -X POST http://localhost:3000/api/auth/dev -H "Content-Type: application/json" -d '{"userId": "test-organizer", "role": "Organizer"}'
```
- Проверить User Panel (клик по User Icon в Taskbar)

### Шаг 4: Organizer проверка (3 мин)
- Авторизоваться как Organizer
- Загрузить файл → проверить в Explorer
- Переместить файл → проверить
- Удалить файл → проверить

### Шаг 5: Guest проверка (2 мин)
- Авторизоваться как Guest
- Проверить, что кнопки Upload/Move/Delete скрыты
- Попытаться загрузить файл через API → должно быть запрещено

### Шаг 6: Security проверка (1 мин)
- Открыть webapp файл
- Проверить iframe sandbox в DevTools
- Проверить PostMessage валидацию

### Шаг 7: Mobile проверка (1 мин)
```bash
cd front && npm run build:mobile && npm run preview:mobile
```

### Шаг 8: Chicago95 Style Gate (5 мин)
- Проверить visual regression golden screens (8-10 screenshots)
- Запустить asset provenance check: `node scripts/check-asset-provenance.cjs`
- Проверить no inline styles violation: `cd front && npm run lint`
- Проверить Chicago95 Acceptance Criteria (15 критериев вручную)

### Шаг 9: Тесты (1 мин)
```bash
cd front && npm test
cd back && npm test
```

---

## Команды для быстрой проверки

### Полный набор команд (скопировать и выполнить)

```bash
# 1. Инфраструктура
docker compose up -d mongo minio minio-init
sleep 5

# 2. Backend
cd back
npm run start:dev &
BACKEND_PID=$!
sleep 3

# 3. Frontend
cd ../front
npm run dev &
FRONTEND_PID=$!
sleep 3

# 4. Проверка health
curl http://localhost:3000/health

# 5. Dev-auth (Organizer)
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-organizer", "role": "Organizer"}'

# 6. Dev-auth (Guest)
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-guest", "role": "Guest"}'

# 7. Тесты Frontend
npm test

# 8. Тесты Backend
cd ../back
npm test

# 9. Остановка
kill $BACKEND_PID $FRONTEND_PID
docker compose down
```

---

## Ожидаемые результаты

### Desktop
- ✅ Desktop Shell отображается
- ✅ Explorer работает (Tree + Grid view)
- ✅ Все типы контента открываются правильными Viewer/Executor
- ✅ Viewport boundary enforced

### Auth
- ✅ Dev-auth работает (`POST /api/auth/dev`)
- ✅ Роль загружается из БД
- ✅ User Panel отображает роль

### Organizer
- ✅ Upload работает
- ✅ Move работает
- ✅ Delete работает
- ✅ System folders immutable (нельзя удалить/переименовать)

### Guest
- ✅ Write запрещён (кнопки скрыты, API возвращает 403)

### Security
- ✅ Iframe sandbox политика работает
- ✅ PostMessage валидация работает

### Mobile
- ✅ Mobile сборка запускается (`npm run build:mobile`)
- ✅ Mobile Shell отображается

### Chicago95 Style
- ✅ Visual regression golden screens проходят (8-10 screenshots)
- ✅ Asset provenance check проходит (все ассеты open-source)
- ✅ No inline styles violation (lint проходит)
- ✅ Chicago95 Acceptance Criteria выполнены (15 критериев)

### Tests
- ✅ Все тесты FP7 проходят (16 frontend + 3 backend)
- ✅ Coverage > 70%

---

## Gate Decision Template

```
FP7 Release Gate — [PASS/REJECT]

Дата: [YYYY-MM-DD]
Проверяющий: [@Delivery]

Результаты:
- Desktop: [✅/❌]
- Auth: [✅/❌]
- Organizer: [✅/❌]
- Guest: [✅/❌]
- Security: [✅/❌]
- Mobile: [✅/❌]
- Chicago95 Style: [✅/❌]
  - Visual Regression: [✅/❌]
  - Asset Provenance: [✅/❌]
  - No Inline Styles: [✅/❌]
  - Acceptance Criteria: [✅/❌]
- Tests: [✅/❌]

Блокеры (если REJECT):
- [описание блокера 1]
- [описание блокера 2]

Решение: [PASS/REJECT]
```

---

**End of FP7 Release Gate Checklist**
