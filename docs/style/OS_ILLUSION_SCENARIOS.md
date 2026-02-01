# OS Illusion Scenarios

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Проверяемые сценарии для "OS illusion" — ощущения работы в Windows 95-подобной ОС, а не на веб-сайте  
**Status:** Design Phase (FP7)  
**Owner:** @Analyst

> **Цель:** Каждый релиз не должен размывать ощущения "OS illusion". Эти сценарии — проверяемые критерии готовности.

## Overview

Документ определяет 10 проверяемых сценариев (30-60 секунд каждый) и метрики качества (definition of done) для поддержания "OS illusion" — перцептивного ощущения работы в Windows 95-подобной операционной системе, а не на веб-сайте.

## Scenarios (10 сценариев)

### Scenario 1: Explorer Navigation & File Opening

**Duration:** 30-45 seconds  
**Goal:** Проверить навигацию в Explorer и открытие файлов через double-click

**Steps:**
1. Открыть Explorer через Desktop Icon (double-click)
2. В Tree view (слева) кликнуть по папке (например, `/Disk C/images`)
3. Убедиться, что Grid view (справа) обновился мгновенно (без плавных анимаций)
4. В Grid view кликнуть по файлу (single-click) → файл выделен (blue background, white text)
5. Double-click по файлу → открывается соответствующий Viewer (ImageViewer, VideoViewer, Notepad, Internet Explorer)
6. Убедиться, что Viewer открылся в отдельном окне с Windows 95 frame

**Expected Behavior:**
- Tree/Grid view имеют inset bevel (sunken panels)
- Single-click → selection (blue background)
- Double-click → открытие файла
- Нет плавных анимаций (transitions < 100ms или отсутствуют)
- Viewer окно имеет правильный title bar (active: blue gradient)

**Test Files:**
- `front/__tests__/fp7/explorer.tree-grid-navigation.test.tsx` (существует)
- `front/__tests__/fp7/content.image-opens-viewer.test.tsx` (существует)
- `front/__tests__/fp7/content.txt-opens-notepad.test.tsx` (существует)
- `front/__tests__/fp7/content.html-opens-ie.test.tsx` (существует)

**Missing Tests:**
- `front/__tests__/fp7/explorer.single-double-click.test.tsx` — проверка single-click selection vs double-click open
- `front/__tests__/fp7/explorer.instant-update.test.tsx` — проверка мгновенного обновления Grid view (без анимаций)

---

### Scenario 2: Multiple Windows & Focus Model

**Duration:** 40-60 seconds  
**Goal:** Проверить работу с несколькими окнами, переключение через taskbar, focus/active titlebar

**Steps:**
1. Открыть 3 окна (например, Explorer, Notepad, ImageViewer)
2. Убедиться, что последнее открытое окно — active (синий градиент title bar, z-index 20)
3. Кликнуть по другому окну → оно становится active (title bar меняется на синий градиент, z-index повышается)
4. Предыдущее окно становится inactive (серый title bar, z-index 10)
5. Кликнуть по кнопке окна в Taskbar → окно становится active, поднимается на передний план
6. Переключиться между окнами через Taskbar (клик по разным кнопкам)

**Expected Behavior:**
- Active window: title bar с синим градиентом (`#000080` → `#1084d0`), белый текст, z-index 20
- Inactive window: title bar серый (`#c0c0c0`), черный текст, z-index 10
- Клик по окну → focus, title bar меняется мгновенно (без анимаций)
- Taskbar кнопки работают для переключения окон

**Test Files:**
- `front/__tests__/fp7/window.focus.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**
- `front/__tests__/fp7/taskbar.window-switch.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/window.focus.test.tsx` — проверка focus model (active/inactive title bar, z-index)
- `front/__tests__/fp7/taskbar.window-switch.test.tsx` — проверка переключения окон через Taskbar

---

### Scenario 3: Menu Open & ESC Close

**Duration:** 20-30 seconds  
**Goal:** Проверить открытие меню и закрытие через ESC

**Steps:**
1. Открыть Explorer (если есть меню) или другое окно с меню
2. Кликнуть по пункту меню (например, "File") → меню открывается
3. Нажать ESC → меню закрывается
4. Повторить для другого пункта меню

**Expected Behavior:**
- Меню открывается мгновенно (без плавных анимаций)
- ESC закрывает открытое меню
- Меню имеет правильные bevels (inset для dropdown)

**Test Files:**
- `front/__tests__/fp7/menu.esc-close.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/menu.esc-close.test.tsx` — проверка закрытия меню через ESC

---

### Scenario 4: Window Drag (Viewport Boundary)

**Duration:** 30-40 seconds  
**Goal:** Проверить drag окна и ограничение границами viewport

**Steps:**
1. Открыть окно (например, Explorer)
2. Захватить title bar и начать drag
3. Попытаться утащить окно за левую границу viewport → окно останавливается на границе
4. Попытаться утащить окно за правую границу viewport → окно останавливается на границе
5. Попытаться утащить окно за верхнюю границу viewport → окно останавливается на границе
6. Попытаться утащить окно за нижнюю границу viewport (с учетом Taskbar) → окно останавливается на границе

**Expected Behavior:**
- Drag работает только за title bar (не за содержимое окна)
- Окно нельзя утащить за пределы viewport (координаты ограничены)
- Drag обновляется в real-time (rAF-driven)
- Окно сохраняет z-index во время drag

**Test Files:**
- `front/__tests__/fp7/window.viewport-boundary.test.tsx` (существует)
- `front/__tests__/fp7/window.drag.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/window.drag.test.tsx` — проверка drag только за title bar (не за содержимое)

---

### Scenario 5: Modal Dialog (Enter & ESC)

**Duration:** 25-35 seconds  
**Goal:** Проверить modal dialog с default button (Enter) и cancel (ESC)

**Steps:**
1. Открыть modal dialog (например, "Delete file?" confirmation)
2. Убедиться, что default button (например, "OK") выделен (outset bevel)
3. Нажать Enter → dialog закрывается, действие выполняется
4. Открыть modal dialog снова
5. Нажать ESC → dialog закрывается, действие отменяется

**Expected Behavior:**
- Modal dialog имеет z-index 10001 (выше Taskbar)
- Default button выделен (outset bevel)
- Enter активирует default button
- ESC отменяет dialog
- Dialog имеет правильные bevels (window frame)

**Test Files:**
- `front/__tests__/fp7/modal.enter-esc.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/modal.enter-esc.test.tsx` — проверка Enter для default button и ESC для cancel

---

### Scenario 6: Desktop Icons (Single vs Double Click)

**Duration:** 25-35 seconds  
**Goal:** Проверить single-click selection и double-click open для Desktop Icons

**Steps:**
1. На Desktop кликнуть по иконке (single-click) → иконка выделена (blue background или highlight)
2. Кликнуть по другой иконке → предыдущая иконка снимает выделение, новая выделена
3. Double-click по иконке → открывается соответствующее окно (Explorer, Viewer, etc.)
4. Убедиться, что окно открылось с правильным title bar (active: blue gradient)

**Expected Behavior:**
- Single-click → selection (highlight)
- Double-click → открытие окна/приложения
- Иконки имеют правильные размеры (48x48px контейнер, outset bevel)
- Нет плавных анимаций при выделении

**Test Files:**
- `front/__tests__/fp7/desktop.icons.from-desktop-only.test.tsx` (существует)
- `front/__tests__/fp7/desktop.icons.single-double-click.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/desktop.icons.single-double-click.test.tsx` — проверка single-click selection vs double-click open

---

### Scenario 7: Window Control Buttons (Pressed States)

**Duration:** 20-30 seconds  
**Goal:** Проверить pressed states для window control buttons (minimize/maximize/close)

**Steps:**
1. Открыть окно (например, Explorer)
2. Навести курсор на кнопку Close (X) → опционально: hover state (красный фон)
3. Кликнуть и удерживать кнопку Close → pressed state (inset bevel, `translate(1px, 1px)`)
4. Отпустить → окно закрывается
5. Открыть окно снова
6. Проверить pressed state для кнопки Minimize (если реализована)
7. Проверить pressed state для кнопки Maximize (если реализована)

**Expected Behavior:**
- Window control buttons имеют размер 18x18px
- Pressed state: inset bevel (top/left grayDark, bottom/right white) + `translate(1px, 1px)`
- Close button hover (опционально): красный фон (`#ff0000`)
- Кнопки имеют gap 2px между ними

**Test Files:**
- `front/__tests__/fp7/window.controls.pressed-state.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/window.controls.pressed-state.test.tsx` — проверка pressed states для window control buttons

---

### Scenario 8: Taskbar Pressed State

**Duration:** 20-30 seconds  
**Goal:** Проверить pressed state для кнопок в Taskbar

**Steps:**
1. Открыть несколько окон (например, Explorer, Notepad)
2. Кликнуть и удерживать кнопку окна в Taskbar → pressed state (inset bevel, `translate(1px, 1px)`)
3. Отпустить → окно становится active (если не было active)
4. Повторить для другой кнопки в Taskbar

**Expected Behavior:**
- Taskbar кнопки имеют pressed state при клике
- Pressed state: inset bevel (top/left grayDark, bottom/right white) + `translate(1px, 1px)`
- После отпускания кнопка возвращается в default state (или active state, если окно focused)

**Test Files:**
- `front/__tests__/fp7/taskbar.pressed-state.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/taskbar.pressed-state.test.tsx` — проверка pressed state для Taskbar кнопок

---

### Scenario 9: Input Fields (Inset Bevel & Focus)

**Duration:** 20-30 seconds  
**Goal:** Проверить input fields с inset bevel и focus behavior

**Steps:**
1. Открыть окно с input полем (например, Notepad или modal dialog с input)
2. Убедиться, что input поле имеет inset bevel (top/left grayDark, bottom/right white, inner shadow)
3. Кликнуть по input полю → focus (но без визуального изменения в Win95)
4. Ввести текст → текст отображается правильно
5. Убедиться, что input поле имеет правильный фон (`#ffffff`), текст (`#000000`)

**Expected Behavior:**
- Input fields имеют inset bevel (sunken panel)
- Focus не меняет визуальный вид (Win95 behavior)
- Disabled state: серый фон (`#c0c0c0`), серый текст (`#808080`), text-shadow для "engraved" effect

**Test Files:**
- `front/__tests__/fp7/input.inset-bevel.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/input.inset-bevel.test.tsx` — проверка inset bevel для input fields и focus behavior

---

### Scenario 10: Scrollbar (3D Bevel & Drag)

**Duration:** 25-35 seconds  
**Goal:** Проверить scrollbar с 3D bevel и drag behavior

**Steps:**
1. Открыть окно с контентом, требующим скролла (например, Explorer с большим списком файлов)
2. Убедиться, что scrollbar имеет правильную ширину (16px)
3. Убедиться, что scrollbar track имеет inset bevel
4. Убедиться, что scrollbar thumb имеет outset bevel (raised)
5. Захватить thumb и начать drag → thumb перемещается, контент скроллится
6. Убедиться, что thumb имеет pressed state во время drag (inset bevel)

**Expected Behavior:**
- Scrollbar width: 16px
- Track: inset bevel (sunken)
- Thumb: outset bevel (raised) в default state, inset bevel (pressed) во время drag
- Scrollbar buttons (up/down): outset bevel
- Нет плавных анимаций при скролле

**Test Files:**
- `front/__tests__/fp7/scrollbar.bevel-drag.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/fp7/scrollbar.bevel-drag.test.tsx` — проверка 3D bevel для scrollbar и drag behavior

---

## Quality Metrics (Definition of Done)

### Metric 1: Zero "Web Smells"

**Definition:** Отсутствие признаков веб-сайта, которые размывают "OS illusion".

**Checklist:**
- ✅ **0 скруглений:** `border-radius: 0` для всех элементов (или отсутствие `border-radius`)
- ✅ **0 easing функций:** Нет `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()` в transitions
- ✅ **0 современных теней:** Нет blur shadows (`box-shadow: 0 4px 6px rgba(...)`), только простые 1px shadows
- ✅ **0 blur эффектов:** Нет `filter: blur()`, `backdrop-filter: blur()`
- ✅ **0 glassmorphism:** Нет прозрачных фонов с blur
- ✅ **0 современных градиентов:** Только title bar gradient (`linear-gradient(90deg, #000080 0%, #1084d0 100%)`)
- ✅ **0 современных шрифтов:** Только system fonts (`"MS Sans Serif", "Tahoma", sans-serif`)
- ✅ **0 font smoothing:** `-webkit-font-smoothing: none`, `font-smooth: never`
- ✅ **0 overscroll:** `overscroll-behavior: none`

**Measurement:**
- **Lint rules:** ESLint/Stylelint блокируют `border-radius`, `filter: blur`, `backdrop-filter`, длинные transitions, easing functions
- **Manual review:** Визуальная проверка каждого компонента на отсутствие "web smells"
- **Automated checks:** Script для проверки CSS на наличие запрещенных паттернов

**Test Files:**
- `front/__tests__/style-guardrails/web-smells.test.tsx` — **НЕ СУЩЕСТВУЕТ, нужно создать**
- `front/scripts/check-web-smells.cjs` — **НЕ СУЩЕСТВУЕТ, нужно создать**

**Missing Tests:**
- `front/__tests__/style-guardrails/web-smells.test.tsx` — проверка отсутствия "web smells" в компонентах
- `front/scripts/check-web-smells.cjs` — скрипт для проверки CSS на запрещенные паттерны

---

### Metric 2: Zero Visual Regressions on Golden Screens

**Definition:** Все golden screens проходят visual regression тесты (pixel-perfect match с baseline).

**Golden Screens (из FP7.md):**
1. **Desktop Shell (Empty):** Desktop с wallpaper, Desktop Icons, Taskbar (Tray: User Icon + Clock)
2. **Desktop Shell (Active Window):** Desktop + одно активное окно (синий градиент title bar)
3. **Desktop Shell (Multiple Windows):** Desktop + 2-3 окна (одно active, остальные inactive)
4. **Explorer (Tree + Grid):** Explorer окно с Tree view (слева) и Grid view (справа)
5. **Explorer (Selection):** Explorer с выбранным файлом в Grid (blue background, white text)
6. **Notepad Window:** Notepad окно с открытым .txt файлом
7. **Internet Explorer Window:** Internet Explorer окно с открытым .html файлом
8. **User Panel Window:** User Panel окно (открыто через клик по User Icon в Tray)
9. **Taskbar (Pressed State):** Taskbar с нажатой кнопкой окна (pressed state)
10. **Desktop Icon (Pressed State):** Desktop с нажатой иконкой (pressed state)

**Measurement:**
- **Visual regression tests:** Playwright или аналогичный инструмент сравнивает текущие screenshots с baseline
- **Baseline screenshots:** Хранятся в `docs/design/references/screenshots/golden/` или `front/__tests__/visual/screenshots/golden/`
- **Tolerance:** 1-2px для font rendering differences (если используется фиксированная среда)

**Test Files:**
- `front/__tests__/visual/golden-screens.spec.ts` — **НЕ СУЩЕСТВУЕТ, нужно создать** (Playwright visual tests)

**Missing Tests:**
- `front/__tests__/visual/golden-screens.spec.ts` — visual regression тесты для всех 10 golden screens

---

## Test Files Summary

### Existing Tests (Covering Scenarios)

✅ **Scenario 1 (Explorer Navigation):**
- `front/__tests__/fp7/explorer.tree-grid-navigation.test.tsx`
- `front/__tests__/fp7/content.image-opens-viewer.test.tsx`
- `front/__tests__/fp7/content.txt-opens-notepad.test.tsx`
- `front/__tests__/fp7/content.html-opens-ie.test.tsx`

✅ **Scenario 4 (Window Drag Boundary):**
- `front/__tests__/fp7/window.viewport-boundary.test.tsx`

✅ **Scenario 6 (Desktop Icons):**
- `front/__tests__/fp7/desktop.icons.from-desktop-only.test.tsx`

### Missing Tests (Required for Scenarios)

❌ **Scenario 1 (Explorer):**
- `front/__tests__/fp7/explorer.single-double-click.test.tsx` — single-click selection vs double-click open
- `front/__tests__/fp7/explorer.instant-update.test.tsx` — мгновенное обновление Grid view (без анимаций)

❌ **Scenario 2 (Multiple Windows & Focus):**
- `front/__tests__/fp7/window.focus.test.tsx` — focus model (active/inactive title bar, z-index)
- `front/__tests__/fp7/taskbar.window-switch.test.tsx` — переключение окон через Taskbar

❌ **Scenario 3 (Menu ESC):**
- `front/__tests__/fp7/menu.esc-close.test.tsx` — закрытие меню через ESC

❌ **Scenario 4 (Window Drag):**
- `front/__tests__/fp7/window.drag.test.tsx` — drag только за title bar (не за содержимое)

❌ **Scenario 5 (Modal Dialog):**
- `front/__tests__/fp7/modal.enter-esc.test.tsx` — Enter для default button, ESC для cancel

❌ **Scenario 6 (Desktop Icons):**
- `front/__tests__/fp7/desktop.icons.single-double-click.test.tsx` — single-click selection vs double-click open

❌ **Scenario 7 (Window Controls):**
- `front/__tests__/fp7/window.controls.pressed-state.test.tsx` — pressed states для window control buttons

❌ **Scenario 8 (Taskbar Pressed):**
- `front/__tests__/fp7/taskbar.pressed-state.test.tsx` — pressed state для Taskbar кнопок

❌ **Scenario 9 (Input Fields):**
- `front/__tests__/fp7/input.inset-bevel.test.tsx` — inset bevel для input fields и focus behavior

❌ **Scenario 10 (Scrollbar):**
- `front/__tests__/fp7/scrollbar.bevel-drag.test.tsx` — 3D bevel для scrollbar и drag behavior

### Missing Tests (Quality Metrics)

❌ **Metric 1 (Zero Web Smells):**
- `front/__tests__/style-guardrails/web-smells.test.tsx` — проверка отсутствия "web smells" в компонентах
- `front/scripts/check-web-smells.cjs` — скрипт для проверки CSS на запрещенные паттерны

❌ **Metric 2 (Zero Visual Regressions):**
- `front/__tests__/visual/golden-screens.spec.ts` — visual regression тесты для всех 10 golden screens

---

## Implementation Checklist

### Phase 1: Test Files (Required)

- [ ] `front/__tests__/fp7/explorer.single-double-click.test.tsx`
- [ ] `front/__tests__/fp7/explorer.instant-update.test.tsx`
- [ ] `front/__tests__/fp7/window.focus.test.tsx`
- [ ] `front/__tests__/fp7/taskbar.window-switch.test.tsx`
- [ ] `front/__tests__/fp7/menu.esc-close.test.tsx`
- [ ] `front/__tests__/fp7/window.drag.test.tsx`
- [ ] `front/__tests__/fp7/modal.enter-esc.test.tsx`
- [ ] `front/__tests__/fp7/desktop.icons.single-double-click.test.tsx`
- [ ] `front/__tests__/fp7/window.controls.pressed-state.test.tsx`
- [ ] `front/__tests__/fp7/taskbar.pressed-state.test.tsx`
- [ ] `front/__tests__/fp7/input.inset-bevel.test.tsx`
- [ ] `front/__tests__/fp7/scrollbar.bevel-drag.test.tsx`

### Phase 2: Quality Metrics Tests

- [ ] `front/__tests__/style-guardrails/web-smells.test.tsx`
- [ ] `front/scripts/check-web-smells.cjs`
- [ ] `front/__tests__/visual/golden-screens.spec.ts` (Playwright)

### Phase 3: Baseline Screenshots

- [ ] Создать baseline screenshots для всех 10 golden screens
- [ ] Сохранить в `docs/design/references/screenshots/golden/` или `front/__tests__/visual/screenshots/golden/`

---

## References

- **FP7.md:** Feature Pack 7 contract (Golden Screens, Acceptance Criteria)
- **CHICAGO95_UI_CONTRACT.md:** UI contract (OS Illusion Rules, No-Web Rules)
- **WIN95_SPEC.md:** Windows 95 UI specification (Metrics, States, Bevels)
- **VISUAL_TESTS.md:** Visual regression testing guide
- **GUIDE_STYLE.md:** Style guide rules

---

## Version History

- **v1.0 (2026-01-22):** Initial document with 10 scenarios and quality metrics
