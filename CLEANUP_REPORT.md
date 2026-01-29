# Отчет о зачистке: FP7 v2 Cleanup (M0)

**Дата:** 2026-01-30  
**Режим:** FP=FP7 mode=build  
**Роль:** @Engineer

## Выполненные задачи

### 1. ✅ Удалено react-router-dom использование из продуктовой поверхности

**Результат:**
- `react-router-dom` не найден в `package.json` (уже удален)
- Нет импортов `Routes`, `Route`, `BrowserRouter`, `useNavigate`, `useLocation`, `Link` в `front/src/`
- `main.tsx` использует `ShellRoot` напрямую (без роутинга)

**Изменения:**
- Нет изменений (уже было удалено ранее)

---

### 2. ✅ Удалены/вынесены в legacy компоненты страниц

**Результат:**
- `CatalogPage`, `GamePage`, `TeamsPage`, `EditorPage` не найдены в `front/src/`
- `App.tsx` не найден (уже удален)
- Компоненты страниц были встроены в `App.tsx`, который уже удален

**Изменения:**
- Нет изменений (уже было удалено ранее)

---

### 3. ✅ Удалены старые тесты для роутинга/сайт-страниц

**Результат:**
- Старые тесты перемещены в `front/__tests__/legacy/`:
  - `front/__tests__/legacy/fp2/` (2 файла)
  - `front/__tests__/legacy/fp4/` (10 файлов)
  - `front/__tests__/legacy/fp5/` (14 файлов)
- `front/__tests__/fp6/platform.contracts.test.tsx` оставлен (тестирует ShellRoot, не роутинг)
- Удален параметр `route` из `platform.contracts.test.tsx` (не используется)

**Изменения:**
- Перемещены тесты в `front/__tests__/legacy/`
- Обновлен `front/__tests__/fp6/platform.contracts.test.tsx`: удален параметр `route`

**Файлы:**
```
front/__tests__/legacy/
├── fp2/
│   ├── admin.forbidden-states.test.tsx
│   └── admin.guard.test.tsx
├── fp4/
│   ├── auth.login.test.tsx
│   ├── auth.modal.test.tsx
│   ├── auth.recovery.test.tsx
│   ├── auth.registration.test.tsx
│   ├── catalog.visibility.test.tsx
│   ├── game.comments.test.tsx
│   ├── game.crash-prevention.test.tsx
│   ├── game.play-modal.test.tsx
│   ├── teams.creation.test.tsx
│   └── teams.members.test.tsx
└── fp5/
    ├── catalog.card-sizing.test.tsx
    ├── catalog.cover-images.test.tsx
    ├── catalog.search-input-styling.test.tsx
    ├── catalog.title-search.test.tsx
    ├── editor.error-modals.test.tsx
    ├── editor.help-tooltips.test.tsx
    ├── game.edit-button.test.tsx
    ├── game.team-members.test.tsx
    ├── teams.create-button.test.tsx
    ├── teams.modal-leader-button.test.tsx
    ├── teams.modal-sizing.test.tsx
    ├── teams.modal-user-search.test.tsx
    ├── teams.name-search.test.tsx
    └── teams.search-styling.test.tsx
```

---

### 4. ✅ Удален dead code

**Результат:**
- `WindowContext.tsx` не найден (уже удален)
- Старый `Window.tsx` не найден (уже удален)
- `WindowManager.tsx` используется только в `os/wm/WindowManager.tsx` (новый, правильный)

**Изменения:**
- Нет изменений (уже было удалено ранее)

---

### 5. ✅ Проверено, что design/** не затронут

**Результат:**
- `docs/design/` не изменен
- Все файлы на месте:
  - `docs/design/icons/` (10 файлов)
  - `docs/design/screenshots/` (9 файлов)
  - `docs/design/STITCH_PROMPTS.md`
  - `docs/design/WIN95_REFERENCES.md`
  - `docs/design/WIN95_UI_KIT.md`

---

## Итоговый список удаленных/перемещенных файлов

### Перемещены в legacy (26 тестовых файлов):
- `front/__tests__/fp2/` → `front/__tests__/legacy/fp2/` (2 файла)
- `front/__tests__/fp4/` → `front/__tests__/legacy/fp4/` (10 файлов)
- `front/__tests__/fp5/` → `front/__tests__/legacy/fp5/` (14 файлов)

### Изменены файлы:
- `front/__tests__/fp6/platform.contracts.test.tsx` - удален параметр `route` (5 вхождений)

---

## Команды проверки

### Тесты
```bash
cd /home/vydra/Repositories/vydramain/Birdmaid
pnpm -r test
```
**Результат:** Тесты запускаются, legacy тесты исключены из запуска (через `vite.config.ts`)

### Сборка
```bash
cd /home/vydra/Repositories/vydramain/Birdmaid/front
pnpm build
```
**Результат:** ✅ Сборка успешна (164.74 kB JS, 4.19 kB CSS)

### Линтер
```bash
cd /home/vydra/Repositories/vydramain/Birdmaid/front
pnpm lint
```
**Результат:** Нет ошибок линтера

---

## Smoke test: Как запустить фронт и увидеть ShellRoot

```bash
cd /home/vydra/Repositories/vydramain/Birdmaid/front
pnpm dev
```

**Ожидаемый результат:**
- Приложение запускается на `http://localhost:5173`
- Отображается `ShellRoot` (без роутинга)
- `DesktopPage` или `MobilePage` рендерится в зависимости от Platform Context
- Нет ошибок в консоли браузера

**Проверка:**
1. Откройте `http://localhost:5173` в браузере
2. Должен отобразиться Desktop Shell (Windows 95 стилистика) или Mobile Shell
3. В консоли браузера не должно быть ошибок о роутинге

---

## Статус выполнения

- ✅ React-router-dom удален из продуктовой поверхности
- ✅ Компоненты страниц удалены (уже были удалены ранее)
- ✅ Старые тесты перемещены в legacy
- ✅ Dead code удален (уже был удален ранее)
- ✅ design/** не затронут

**Все задачи выполнены.**
