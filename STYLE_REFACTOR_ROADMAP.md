# Style System Refactor Roadmap

**Feature Pack:** FP7  
**Subproject:** style-system-refactor  
**Mode:** plan  
**Created:** 2026-01-22  
**Status:** Planning  

**Source of Truth:** [FP7.md](./docs/fps/FP7.md) — M6: Style System Refactor

## Executive Summary

**Goal:** Миграция всех inline styles в SCSS (кроме whitelist: drag/resize positioning, computed geometry), создание theme tokens системы, организация стилей как style guide система.

**Scope:**
- 27 файлов с inline styles
- 289 вхождений `style={}`
- Миграция "волнами" (5-10 компонентов за PR)
- Каждый PR проходит: `npm run test` + `npm run lint`

**Outcome:**
- 0 inline style usages (кроме whitelist с allow-tag)
- Theme tokens система (минимум 2 темы: default + high-contrast)
- Документация "как добавлять стили правильно"
- Линтеры блокируют новые inline styles и `!important`

## Baseline Metrics (PR0)

### Inventory

**Total files with inline styles:** 27  
**Total inline style occurrences:** 289

**Breakdown by subsystem:**

| Subsystem | Files | Estimated Occurrences | Priority |
|-----------|-------|----------------------|----------|
| Window System | 2 | ~50 | High |
| Desktop | 2 | ~30 | High |
| Explorer | 1 | ~15 | Medium |
| Taskbar | 1 | ~10 | Medium |
| Viewers | 4 | ~60 | Medium |
| Mobile | 2 | ~20 | Low |
| Components (Win95) | 6 | ~50 | Medium |
| Legacy | 1 | ~54 | Skip |
| Other | 8 | ~0 | Low |

**Files inventory:**

**Window System:**
- `front/src/os/wm/WindowFrame.tsx` — ~30 occurrences (drag/resize positioning + visual)
- `front/src/os/wm/WindowManager.tsx` — ~20 occurrences (layout)

**Desktop:**
- `front/src/pages/DesktopPage.tsx` — ~15 occurrences (wallpaper, grid layout)
- `front/src/components/DesktopIcon.tsx` — ~15 occurrences (icon styling, tooltip)

**Explorer:**
- `front/src/components/ExplorerWindow.tsx` — ~15 occurrences (tree/grid layout)

**Taskbar:**
- `front/src/os/taskbar/Taskbar.tsx` — ~10 occurrences (layout, tray)

**Viewers:**
- `front/src/os/apps/ImageViewer.tsx` — ~15 occurrences (image layout)
- `front/src/os/apps/VideoViewer.tsx` — ~15 occurrences (video layout)
- `front/src/os/apps/Notepad.tsx` — ~20 occurrences (text editor styling)
- `front/src/os/apps/InternetExplorer.tsx` — ~10 occurrences (iframe layout)

**Mobile:**
- `front/src/os/MobileShell.tsx` — ~10 occurrences
- `front/src/pages/MobilePage.tsx` — ~10 occurrences

**Components (Win95):**
- `front/src/components/win95/Win95Modal.tsx` — ~15 occurrences (modal positioning)
- `front/src/components/win95/Win95Input.tsx` — ~5 occurrences
- `front/src/components/win95/Win95Textarea.tsx` — ~5 occurrences
- `front/src/components/win95/HourglassLoader.tsx` — ~10 occurrences
- `front/src/components/AuthModal.tsx` — ~15 occurrences
- `front/src/components/PlayModal.tsx` — ~10 occurrences

**Other:**
- `front/src/components/GameWindow.tsx` — ~5 occurrences
- `front/src/components/HelpWindow.tsx` — ~10 occurrences
- `front/src/components/LandingWindow.tsx` — ~15 occurrences
- `front/src/components/Header.tsx` — ~10 occurrences
- `front/src/os/apps/AppHost.tsx` — ~5 occurrences
- `front/src/os/apps/UserPanelApp.tsx` — ~10 occurrences

**Legacy (skip):**
- `front/src/legacy/pages.tsx` — ~54 occurrences (legacy code, не мигрируем)

### Baseline Commands

```bash
# Count inline styles
cd front
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" | wc -l

# List files with inline styles
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" -l

# Count by file
for file in $(grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" -l); do
  echo "$file: $(grep -c "style={{{\|style={{" "$file")"
done
```

## Migration Waves

### PR0: Inventory + Baseline Metrics

**Goal:** Собрать baseline metrics, создать inventory всех inline styles.

**Tasks:**
1. Запустить baseline commands для подсчета inline styles
2. Создать inventory таблицу (файл → количество inline styles)
3. Сгруппировать компоненты по подсистемам
4. Определить приоритеты миграции
5. Обновить этот документ с точными метриками

**Deliverables:**
- Обновленный `STYLE_REFACTOR_ROADMAP.md` с точными метриками
- Inventory таблица (файл → количество, категория, приоритет)

**PASS Criteria:**
- [ ] Baseline metrics собраны (точное количество inline styles по файлам)
- [ ] Inventory таблица создана
- [ ] Компоненты сгруппированы по подсистемам
- [ ] Приоритеты определены

**Verify Commands:**
```bash
cd front
npm run lint  # должен пройти (baseline, не меняем код)
```

**Risks:**
- Низкий: только сбор метрик, не меняем код

---

### PR1: Style Guide Skeleton + Theming Mechanism + Docs

**Goal:** Создать theme tokens систему, механизм переключения темы, обновить документацию.

**Tasks:**
1. **Theme Tokens System:**
   - Создать `front/src/styles/_theme-default.scss` (default theme tokens)
   - Создать `front/src/styles/_theme-high-contrast.scss` (high-contrast theme tokens)
   - Реализовать механизм переключения темы (CSS custom properties или SCSS переменные)
   - Обновить `front/src/styles/_tokens.scss` для поддержки theme layer

2. **Documentation:**
   - Обновить `docs/style/GUIDE_STYLE.md` с примерами theme tokens
   - Обновить `front/src/styles/guide.md` с примерами миграции
   - Создать migration guide: "как мигрировать inline styles → SCSS"

3. **Examples:**
   - Создать примеры: "как добавить новый компонент правильно"
   - Создать примеры: "как использовать theme tokens"

**Components/Files:**
- `front/src/styles/_theme-default.scss` (new)
- `front/src/styles/_theme-high-contrast.scss` (new)
- `front/src/styles/_tokens.scss` (update)
- `front/src/styles/index.scss` (update)
- `docs/style/GUIDE_STYLE.md` (update)
- `front/src/styles/guide.md` (update)
- `docs/style/MIGRATION_GUIDE.md` (new)

**Deliverables:**
- Theme tokens система готова (2 темы: default + high-contrast)
- Механизм переключения темы работает (без изменения компонентов)
- Документация обновлена

**PASS Criteria:**
- [ ] Theme tokens система создана (default + high-contrast)
- [ ] Механизм переключения темы работает (CSS custom properties или SCSS переменные)
- [ ] Документация обновлена (GUIDE_STYLE.md, guide.md, MIGRATION_GUIDE.md)
- [ ] Примеры созданы ("как добавить новый компонент правильно")
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что темы переключаются без изменения компонентов
```

**Risks:**
- **Medium:** Механизм переключения темы может не работать с существующими компонентами
  - **Mitigation:** Использовать CSS custom properties (работают с существующими компонентами)
- **Low:** Документация может быть неполной
  - **Mitigation:** Создать примеры и проверить их работоспособность

---

### PR2: Window System Migration (Wave 2)

**Goal:** Мигрировать Window System компоненты (WindowFrame, WindowManager).

**Components:**
- `front/src/os/wm/WindowFrame.tsx` — ~30 occurrences
- `front/src/os/wm/WindowManager.tsx` — ~20 occurrences

**Tasks:**
1. **WindowFrame:**
   - Вынести визуальные стили в SCSS классы (`.win-window-base`, `.win-window`)
   - Оставить drag/resize positioning с allow-tag комментарием
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы, если они зависели от inline styles

2. **WindowManager:**
   - Вынести layout стили в SCSS классы
   - Использовать utility classes для layout
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (window classes)
- Обновить `front/src/styles/_mixins.scss` (window mixins, если нужно)
- Обновить `front/src/styles/_utilities.scss` (layout utilities, если нужно)

**Deliverables:**
- WindowFrame мигрирован (inline styles → SCSS классы, кроме drag/resize)
- WindowManager мигрирован (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] WindowFrame: 0 inline styles (кроме drag/resize с allow-tag)
- [ ] WindowManager: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что окна открываются/закрываются, drag работает
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **High:** Drag/resize positioning может сломаться
  - **Mitigation:** Оставить drag/resize positioning с allow-tag комментарием, проверить визуально
- **Medium:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции
- **Medium:** Визуальное поведение может измениться
  - **Mitigation:** Визуальная проверка после миграции

---

### PR3: Desktop Migration (Wave 3)

**Goal:** Мигрировать Desktop компоненты (DesktopPage, DesktopIcon).

**Components:**
- `front/src/pages/DesktopPage.tsx` — ~15 occurrences
- `front/src/components/DesktopIcon.tsx` — ~15 occurrences

**Tasks:**
1. **DesktopPage:**
   - Вынести wallpaper стили в SCSS классы (`.win-desktop`)
   - Вынести grid layout в SCSS классы (`.win-desktop-icons`)
   - Использовать theme tokens для цветов
   - Обновить тесты/селекторы

2. **DesktopIcon:**
   - Вынести icon styling в SCSS классы (`.desktop-icon`)
   - Вынести tooltip styling в SCSS классы (`.desktop-icon-tooltip`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (desktop classes)
- Обновить `front/src/styles/_mixins.scss` (desktop mixins, если нужно)

**Deliverables:**
- DesktopPage мигрирован (inline styles → SCSS классы)
- DesktopIcon мигрирован (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] DesktopPage: 0 inline styles
- [ ] DesktopIcon: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что desktop icons отображаются правильно
# Проверить, что tooltip работает
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **Medium:** Tooltip positioning может сломаться
  - **Mitigation:** Использовать CSS positioning для tooltip, проверить визуально
- **Medium:** Grid layout может сломаться
  - **Mitigation:** Использовать CSS Grid, проверить визуально
- **Low:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции

---

### PR4: Explorer + Taskbar Migration (Wave 4)

**Goal:** Мигрировать Explorer и Taskbar компоненты.

**Components:**
- `front/src/components/ExplorerWindow.tsx` — ~15 occurrences
- `front/src/os/taskbar/Taskbar.tsx` — ~10 occurrences

**Tasks:**
1. **ExplorerWindow:**
   - Вынести tree/grid layout в SCSS классы (`.win-explorer`, `.explorer-tree`, `.explorer-grid`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

2. **Taskbar:**
   - Вынести layout стили в SCSS классы (`.win-taskbar`, `.win-taskbar-tray`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (explorer, taskbar classes)
- Обновить `front/src/styles/_mixins.scss` (explorer, taskbar mixins, если нужно)

**Deliverables:**
- ExplorerWindow мигрирован (inline styles → SCSS классы)
- Taskbar мигрирован (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] ExplorerWindow: 0 inline styles
- [ ] Taskbar: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что explorer tree/grid работает
# Проверить, что taskbar отображается правильно
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **Medium:** Tree/grid layout может сломаться
  - **Mitigation:** Использовать CSS Grid/Flexbox, проверить визуально
- **Low:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции

---

### PR5: Viewers Migration (Wave 5)

**Goal:** Мигрировать Viewers компоненты (ImageViewer, VideoViewer, Notepad, InternetExplorer).

**Components:**
- `front/src/os/apps/ImageViewer.tsx` — ~15 occurrences
- `front/src/os/apps/VideoViewer.tsx` — ~15 occurrences
- `front/src/os/apps/Notepad.tsx` — ~20 occurrences
- `front/src/os/apps/InternetExplorer.tsx` — ~10 occurrences

**Tasks:**
1. **ImageViewer:**
   - Вынести image layout в SCSS классы (`.win-image-viewer`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

2. **VideoViewer:**
   - Вынести video layout в SCSS классы (`.win-video-viewer`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

3. **Notepad:**
   - Вынести text editor styling в SCSS классы (`.win-notepad`)
   - Использовать theme tokens для цветов/размеров/шрифтов
   - Обновить тесты/селекторы

4. **InternetExplorer:**
   - Вынести iframe layout в SCSS классы (`.win-internet-explorer`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (viewer classes)
- Обновить `front/src/styles/_mixins.scss` (viewer mixins, если нужно)

**Deliverables:**
- ImageViewer мигрирован (inline styles → SCSS классы)
- VideoViewer мигрирован (inline styles → SCSS классы)
- Notepad мигрирован (inline styles → SCSS классы)
- InternetExplorer мигрирован (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] ImageViewer: 0 inline styles
- [ ] VideoViewer: 0 inline styles
- [ ] Notepad: 0 inline styles
- [ ] InternetExplorer: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что все viewers работают правильно
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **Medium:** Text editor styling может сломаться (Notepad)
  - **Mitigation:** Использовать CSS для textarea, проверить визуально
- **Low:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции

---

### PR6: Win95 Components Migration (Wave 6)

**Goal:** Мигрировать Win95 компоненты (Win95Modal, Win95Input, Win95Textarea, HourglassLoader, AuthModal, PlayModal).

**Components:**
- `front/src/components/win95/Win95Modal.tsx` — ~15 occurrences
- `front/src/components/win95/Win95Input.tsx` — ~5 occurrences
- `front/src/components/win95/Win95Textarea.tsx` — ~5 occurrences
- `front/src/components/win95/HourglassLoader.tsx` — ~10 occurrences
- `front/src/components/AuthModal.tsx` — ~15 occurrences
- `front/src/components/PlayModal.tsx` — ~10 occurrences

**Tasks:**
1. **Win95Modal:**
   - Вынести modal positioning в SCSS классы (`.win-modal`)
   - Оставить drag positioning с allow-tag комментарием (если нужно)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

2. **Win95Input, Win95Textarea:**
   - Вынести input styling в SCSS классы (`.win-input`, `.win-textarea`)
   - Использовать theme tokens для цветов/размеров/шрифтов
   - Обновить тесты/селекторы

3. **HourglassLoader:**
   - Вынести loader styling в SCSS классы (`.win-hourglass-loader`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

4. **AuthModal, PlayModal:**
   - Вынести modal styling в SCSS классы
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (modal, input, loader classes)
- Обновить `front/src/styles/_mixins.scss` (input mixins, если нужно)

**Deliverables:**
- Win95Modal мигрирован (inline styles → SCSS классы, кроме drag с allow-tag)
- Win95Input мигрирован (inline styles → SCSS классы)
- Win95Textarea мигрирован (inline styles → SCSS классы)
- HourglassLoader мигрирован (inline styles → SCSS классы)
- AuthModal мигрирован (inline styles → SCSS классы)
- PlayModal мигрирован (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] Win95Modal: 0 inline styles (кроме drag с allow-tag, если нужно)
- [ ] Win95Input: 0 inline styles
- [ ] Win95Textarea: 0 inline styles
- [ ] HourglassLoader: 0 inline styles
- [ ] AuthModal: 0 inline styles
- [ ] PlayModal: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что все модалы работают правильно
# Проверить, что input/textarea работают правильно
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **Medium:** Modal positioning может сломаться
  - **Mitigation:** Использовать CSS positioning для модалов, проверить визуально
- **Low:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции

---

### PR7: Mobile + Other Components Migration (Wave 7)

**Goal:** Мигрировать Mobile компоненты и остальные компоненты.

**Components:**
- `front/src/os/MobileShell.tsx` — ~10 occurrences
- `front/src/pages/MobilePage.tsx` — ~10 occurrences
- `front/src/components/GameWindow.tsx` — ~5 occurrences
- `front/src/components/HelpWindow.tsx` — ~10 occurrences
- `front/src/components/LandingWindow.tsx` — ~15 occurrences
- `front/src/components/Header.tsx` — ~10 occurrences
- `front/src/os/apps/AppHost.tsx` — ~5 occurrences
- `front/src/os/apps/UserPanelApp.tsx` — ~10 occurrences

**Tasks:**
1. **MobileShell, MobilePage:**
   - Вынести mobile styling в SCSS классы (`.win-mobile-shell`, `.win-mobile-page`)
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

2. **Other Components:**
   - Вынести styling в SCSS классы для каждого компонента
   - Использовать theme tokens для цветов/размеров
   - Обновить тесты/селекторы

**SCSS Changes:**
- Обновить `front/src/styles/_components.scss` (mobile, other classes)
- Обновить `front/src/styles/_mixins.scss` (mobile mixins, если нужно)

**Deliverables:**
- MobileShell мигрирован (inline styles → SCSS классы)
- MobilePage мигрирован (inline styles → SCSS классы)
- Все остальные компоненты мигрированы (inline styles → SCSS классы)
- Тесты обновлены (селекторы, если нужно)
- `npm run test` + `npm run lint` зеленые

**PASS Criteria:**
- [ ] MobileShell: 0 inline styles
- [ ] MobilePage: 0 inline styles
- [ ] Все остальные компоненты: 0 inline styles
- [ ] Тесты обновлены (селекторы, если нужно)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Визуальное поведение не изменилось (визуальная проверка)

**Verify Commands:**
```bash
cd front
npm run test
npm run lint
# Проверить, что mobile работает правильно
# Проверить, что все остальные компоненты работают правильно
# Проверить, что визуальное поведение не изменилось
```

**Risks:**
- **Low:** Mobile компоненты могут иметь специфичные стили
  - **Mitigation:** Использовать CSS для mobile, проверить визуально
- **Low:** Тесты могут зависеть от inline styles
  - **Mitigation:** Обновить селекторы тестов после миграции

---

### PRfinal: Enforcement Hardening + Cleanup

**Goal:** Усилить enforcement (линтеры, pre-commit hooks), провести финальную очистку.

**Tasks:**
1. **Enforcement Hardening:**
   - Убедиться, что ESLint блокирует новые inline styles (кроме whitelist с allow-tag)
   - Убедиться, что Stylelint блокирует `!important`
   - Убедиться, что pre-commit hooks работают правильно
   - Обновить canary checks (если нужно)

2. **Cleanup:**
   - Удалить неиспользуемые SCSS классы (если есть)
   - Удалить неиспользуемые mixins (если есть)
   - Проверить, что все inline styles мигрированы (кроме whitelist)
   - Обновить документацию (если нужно)

3. **Final Verification:**
   - Запустить baseline commands для проверки, что inline styles мигрированы
   - Проверить, что темы переключаются без изменения компонентов
   - Проверить, что coverage не упал

**Deliverables:**
- Линтеры блокируют новые inline styles и `!important`
- Pre-commit hooks работают правильно
- Canary checks обновлены (если нужно)
- Неиспользуемые SCSS классы/mixins удалены
- Документация обновлена
- Final metrics собраны (0 inline styles, кроме whitelist)

**PASS Criteria:**
- [ ] ESLint блокирует новые inline styles (кроме whitelist с allow-tag)
- [ ] Stylelint блокирует `!important`
- [ ] Pre-commit hooks работают правильно
- [ ] Canary checks обновлены (если нужно)
- [ ] Неиспользуемые SCSS классы/mixins удалены
- [ ] Документация обновлена
- [ ] Final metrics: 0 inline styles (кроме whitelist с allow-tag)
- [ ] `npm run test` зеленый
- [ ] `npm run lint` зеленый
- [ ] Coverage не упал

**Verify Commands:**
```bash
cd front
# Проверить, что inline styles мигрированы
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" | grep -v "inline-style: allowed"

# Проверить, что линтеры работают
npm run lint

# Проверить, что pre-commit hooks работают
# (попробовать закоммитить файл с inline style без allow-tag)

# Проверить, что темы переключаются
# (визуальная проверка)

# Проверить coverage
npm run test -- --coverage
```

**Risks:**
- **Low:** Линтеры могут не блокировать все случаи
  - **Mitigation:** Проверить canary checks, обновить линтеры, если нужно
- **Low:** Неиспользуемые SCSS классы/mixins могут остаться
  - **Mitigation:** Проверить вручную, удалить неиспользуемые

---

## Summary

### Wave Timeline

| Wave | PR | Components | Estimated Occurrences | Priority |
|------|----|-----------|----------------------|----------|
| PR0 | Inventory | - | - | High |
| PR1 | Foundation | Theme tokens, docs | - | High |
| PR2 | Window System | WindowFrame, WindowManager | ~50 | High |
| PR3 | Desktop | DesktopPage, DesktopIcon | ~30 | High |
| PR4 | Explorer + Taskbar | ExplorerWindow, Taskbar | ~25 | Medium |
| PR5 | Viewers | ImageViewer, VideoViewer, Notepad, InternetExplorer | ~60 | Medium |
| PR6 | Win95 Components | Win95Modal, Win95Input, Win95Textarea, HourglassLoader, AuthModal, PlayModal | ~60 | Medium |
| PR7 | Mobile + Other | MobileShell, MobilePage, GameWindow, HelpWindow, LandingWindow, Header, AppHost, UserPanelApp | ~75 | Low |
| PRfinal | Enforcement | - | - | High |

**Total estimated occurrences:** ~300 (включая legacy, которую пропускаем)

### Success Metrics

**Baseline (PR0):**
- 289 inline style occurrences в 27 файлах

**Target (PRfinal):**
- 0 inline style occurrences (кроме whitelist с allow-tag)
- Минимум 2 темы (default + high-contrast) переключаемые без изменения компонентов
- Линтеры блокируют новые inline styles и `!important`
- Документация готова

### Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Drag/resize positioning сломается | Medium | High | Оставить drag/resize positioning с allow-tag комментарием, проверить визуально | Engineer |
| Тесты зависят от inline styles | Medium | Medium | Обновить селекторы тестов после миграции | Engineer |
| Визуальное поведение изменится | Medium | High | Визуальная проверка после миграции | Engineer |
| Механизм переключения темы не работает | Medium | Medium | Использовать CSS custom properties (работают с существующими компонентами) | Engineer |
| Документация неполная | Low | Low | Создать примеры и проверить их работоспособность | Engineer |
| Линтеры не блокируют все случаи | Low | Medium | Проверить canary checks, обновить линтеры, если нужно | Engineer |

### Dependencies

**PR1 (Foundation) зависит от:**
- PR0 (Inventory) — для понимания объема работы

**PR2-PR7 (Migration Waves) зависят от:**
- PR1 (Foundation) — theme tokens система должна быть готова

**PRfinal (Enforcement) зависит от:**
- PR2-PR7 (Migration Waves) — все компоненты должны быть мигрированы

### Communication Plan

**Cadence:**
- После каждого PR: обновить `STYLE_REFACTOR_ROADMAP.md` с результатами
- После PRfinal: финальный отчет с метриками

**Artifacts:**
- `STYLE_REFACTOR_ROADMAP.md` (этот документ)
- PR descriptions с метриками до/после
- Final metrics report (после PRfinal)

---

## Appendix: Commands Reference

### Baseline Commands

```bash
# Count inline styles
cd front
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" | wc -l

# List files with inline styles
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" -l

# Count by file
for file in $(grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" -l); do
  echo "$file: $(grep -c "style={{{\|style={{" "$file")"
done
```

### Verify Commands (для каждого PR)

```bash
cd front
npm run test
npm run lint
```

### Final Verification Commands

```bash
cd front
# Проверить, что inline styles мигрированы (кроме whitelist)
grep -r "style={{{\|style={{" src --include="*.tsx" --include="*.ts" | grep -v "inline-style: allowed"

# Проверить, что линтеры работают
npm run lint

# Проверить coverage
npm run test -- --coverage
```

---

**End of STYLE_REFACTOR_ROADMAP.md**
