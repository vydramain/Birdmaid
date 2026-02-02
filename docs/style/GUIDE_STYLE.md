# Win95 UI Style Guide

**Version:** 1.0  
**Created:** 2026-01-22  
**Updated:** 2026-01-22  
**Purpose:** Style guide for Win95 UI implementation in FP7  
**Status:** Active (обязательное правило для FP7)  
**Source:** [FP7.md](../fps/FP7.md) — Phase 9: Style Guardrails

> **⚠️ ВАЖНО:** Этот документ является обязательным правилом для FP7. Все разработчики должны следовать правилам, описанным в этом документе. Нарушения блокируются pre-commit hooks.

## Структура каталогов

```
front/src/styles/
  ├── themes/
  │   ├── _win95-default.scss        # Default theme (Chicago95 palette)
  │   ├── _win95-high-contrast.scss  # High contrast theme (accessibility)
  │   └── _index.scss                # Theme entry point
  ├── tokens/
  │   ├── _colors.scss              # Color tokens
  │   ├── _spacing.scss             # Spacing tokens
  │   ├── _borders.scss             # Border tokens
  │   ├── _typography.scss          # Typography tokens
  │   └── _zindex.scss              # Z-index tokens
  ├── mixins/
  │   ├── _bevel.scss               # Bevel mixins (inset/outset)
  │   ├── _window-frame.scss        # Window frame mixins
  │   ├── _taskbar.scss             # Taskbar mixins
  │   └── _icons.scss               # Icon mixins
  ├── components/
  │   ├── _window.scss              # Window component classes
  │   ├── _explorer.scss            # Explorer component classes
  │   ├── _desktop-icons.scss       # Desktop icons component classes
  │   ├── _buttons.scss             # Button component classes
  │   └── _inputs.scss              # Input component classes
  ├── utilities/
  │   ├── _layout.scss              # Layout utilities
  │   └── _text.scss                # Text utilities
  ├── _tokens.scss                  # Legacy: aggregated tokens (deprecated, use tokens/)
  ├── _mixins.scss                  # Legacy: aggregated mixins (deprecated, use mixins/)
  ├── _components.scss              # Legacy: aggregated components (deprecated, use components/)
  ├── _utilities.scss               # Legacy: aggregated utilities (deprecated, use utilities/)
  ├── index.scss                    # Main entry point
  └── guide.md                      # Гайд "когда делать mixin vs component class"
```

**Примечание:** Текущая структура использует агрегированные файлы (`_tokens.scss`, `_mixins.scss`, etc.). Целевая структура (tokens/, mixins/, components/, utilities/) будет реализована в процессе миграции. Темы уже реализованы в `themes/`.

## Обязательные Tokens для FP7

### Colors (Chicago95 Palette)
- `$win-gray` (#c0c0c0) — Main window background
- `$win-gray-light` (#dfdfdf) — Top/left borders (raised)
- `$win-gray-dark` (#808080) — Bottom/right borders (sunken)
- `$win-gray-darker` (#404040) — Deepest shadows
- `$win-white` (#ffffff) — Text on dark, top/left highlights
- `$win-black` (#000000) — Text, outer borders
- `$win-blue` (#000080) — Title bar background (start)
- `$win-blue-light` (#1084d0) — Title bar background (end gradient)
- `$win-teal` (#008080) — Desktop background
- `$win-red` (#ff0000) — Error states, close button hover
- `$win-text` (#000000) — Default text
- `$win-text-inverse` (#ffffff) — Text on dark backgrounds
- `$win-text-disabled` (#808080) — Disabled text

### Spacing
- `$spacing-xs` (2px) — Minimal spacing
- `$spacing-sm` (4px) — Small spacing
- `$spacing-md` (8px) — Medium spacing
- `$spacing-lg` (12px) — Large spacing
- `$spacing-xl` (16px) — Extra large spacing

### Borders (3D Bevels)
- Inset (sunken): top/left dark, bottom/right light
- Outset (raised): top/left light, bottom/right dark
- Window frame: outer black + 3D bevel

### Z-Index Layers
- `$z-desktop` (1) — Desktop background
- `$z-window` (10) — Base window z-index
- `$z-window-focused` (20) — Focused window (higher)
- `$z-taskbar` (10000) — Taskbar (always on top)
- `$z-modal` (10001) — Modal overlays (above taskbar)

### Typography
- `$font-family`: "MS Sans Serif", "Tahoma", sans-serif
- `$font-size-small` (10px) — Tooltips, small labels
- `$font-size-normal` (11px) — Default text, buttons, inputs
- `$font-size-medium` (12px) — Title bar, menu items
- `$font-size-large` (14px) — Headings
- `$font-weight-normal` / `$font-weight-bold`
- `$line-height-tight` (1.2) / `$line-height-normal` (1.4) / `$line-height-relaxed` (1.6)

## Обязательные Mixins для FP7

### 1. Bevel Mixins
- `@include bevel-inset;` — Sunken panel (input fields, explorer tree)
- `@include bevel-outset;` — Raised panel (buttons, desktop icons)
- `@include window-frame;` — Window border (3D bevel)

### 2. Window Mixins
- `@include window-titlebar;` — Window title bar styling
- `@include window-control-button;` — Window control button (minimize/maximize/close)
- `@include window-control-button-active;` — Active state for control button

### 3. Button Mixins
- `@include button-default;` — Default button styling (outset)
- `@include button-active;` — Button active state (pressed)
- `@include button-disabled;` — Button disabled state

### 4. Input Mixin
- `@include input-text;` — Text input field (inset)

## Обязательные Component Classes для FP7

### 1. Window Component
- `.win-window-base` — Base window class
- `.win-window` — Main application window
- `.win-window-modal` — Modal window
- `.win-titlebar` — Window title bar
- `.win-window-controls` — Window control buttons
- `.win-content` — Window content area

### 2. Taskbar Component
- `.win-taskbar` — Taskbar base class
- `.win-taskbar-tray` — Tray area (right side)

### 3. Explorer Component
- `.win-explorer` — Explorer base class
- `.explorer-tree` — Tree view (left pane)
- `.explorer-divider` — Divider between tree and grid
- `.explorer-grid` — Grid view (right pane)

### 4. Desktop Icons Component
- `.win-desktop-icons` — Desktop icons grid
- `.desktop-icon` — Individual desktop icon

## Гайд: Mixin vs Component Class

### Используй Mixin, когда:
- **Паттерн повторяется** в разных компонентах
- **Нужна гибкость** применения к разным элементам
- **Паттерн не привязан** к конкретной структуре DOM

**Примеры:**
- `@include bevel-inset;` — можно применить к input, panel, explorer tree
- `@include button-default;` — можно применить к любой кнопке
- `@include window-titlebar;` — можно применить к любому заголовку окна

### Используй Component Class, когда:
- **Фиксированная структура** компонента (window, taskbar, explorer)
- **Специфичная иерархия** DOM элементов
- **Компонент имеет состояние** (selected, hover, active)

**Примеры:**
- `.win-window-base` — структура окна (titlebar + content)
- `.win-taskbar` — структура taskbar (tray area + clock)
- `.win-explorer` — структура explorer (tree + divider + grid)

**Подробнее:** См. `front/src/styles/guide.md`

## Theme System

Темы реализованы через CSS custom properties (CSS variables) и data-attribute на root элементе. Подробнее см. [THEME_CONTRACT.md](./THEME_CONTRACT.md).

### Quick Start

```typescript
// Переключение темы
document.documentElement.setAttribute('data-theme', 'win95-high-contrast');

// Возврат к default
document.documentElement.setAttribute('data-theme', 'win95-default');
// или
document.documentElement.removeAttribute('data-theme');
```

### Available Themes

- `win95-default` — Default Windows 95 theme (Chicago95 palette)
- `win95-high-contrast` — High contrast theme (accessibility)

### Usage in SCSS

```scss
.win-window-base {
  background: var(--win-gray);
  color: var(--win-text);
  border: 1px solid var(--win-gray-dark);
}
```

## Policy: Inline Styles & !important

### Inline Styles Policy

**Общее правило:** Inline styles запрещены для визуальных свойств (цвета, бордеры, шрифты, отступы). Используй классы/SCSS.

**Whitelist (допустимые случаи):**

Inline styles разрешены **только** для следующих случаев с обязательным allow-tag комментарием:

1. **Drag/Resize positioning:**
   - `transform: translate3d(x, y, 0)` — для позиционирования окон при drag
   - `left`, `top` — для абсолютного позиционирования (только если вычисляется динамически)
   - `width`, `height` — для динамических размеров при resize

2. **Layout calculations:**
   - `width`, `height` — только если вычисляется динамически (например, `calc()` или вычисления на основе viewport)
   - `maxWidth`, `maxHeight` — только если вычисляется динамически

3. **Performance-critical properties:**
   - `transform` — для GPU-ускорения анимаций
   - `opacity` — для fade анимаций (только если анимируется через JS)

**Обязательный allow-tag формат v2:**

```typescript
// inline-style: allowed (reason: drag/resize; why: mouse position during drag; revisit: FP7)
<div style={{ transform: `translate3d(${x}px, ${y}px, 0)` }} />
```

**Обязательные поля:**
- `reason` — одна из: `drag/resize`, `layout-calc`, `performance`
- `why` — краткое обоснование: откуда берётся динамика (например: `taskbar height measured via ResizeObserver`, `mouse position during drag`)
- `revisit` — milestone для пересмотра (например: `M6`, `FP7`)

**Разрешённые причины (reason):**
- `drag/resize` — для drag и resize операций
- `layout-calc` — для вычисляемых размеров/позиций (см. ограничения ниже)
- `performance` — для GPU-ускорения (transform, opacity)

**Жёсткое правило:** Inline style с allow-tag всё равно **запрещён**, если все значения в `style` — литералы (string/number) и не зависят от runtime (state, refs, ResizeObserver, getBoundingClientRect, window/visualViewport).

**layout-calc** разрешён **только** если:
1. Значение вычисляется из измерений: `getBoundingClientRect`, `ResizeObserver`, `window.innerWidth/Height`, `visualViewport`
2. Вынос в CSS невозможен без потери корректности

**Если нет явного источника измерения — reason=layout-calc недействителен.**

**Запрещённые паттерны (всегда, даже с allow-tag):**

| Паттерн | Пример нарушения | Как правильно |
|---------|------------------|---------------|
| Fixed fullscreen backdrop/overlay | `position: fixed`, `inset: 0`, `zIndex: 9998` | CSS класс (например `.start-menu-backdrop`) + z-index token |
| Позиционирование меню/окон константами | `bottom: 40px`, `left: 4px`, `minWidth: 150px` | CSS класс + tokens (rem) |
| zIndex-магические числа | `zIndex: 9999` | Только через z-index tokens/classes |

**Как правильно (примеры):**
```scss
.start-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-taskbar-backdrop);
}
.start-menu {
  position: fixed;
  bottom: var(--taskbar-h, 2.5rem);
  left: var(--spacing-xs);
  min-width: 9.375rem;
  z-index: var(--z-taskbar-menu);
}
```

**Правило предпочтения (сначала CSS vars, потом inline):** Если нужен runtime-результат — **сначала** ставим CSS custom property (inline только `--var`), а применение делаем в классе.

```typescript
// inline-style: allowed (reason: layout-calc; why: taskbar height measured; revisit: M6)
<div className="start-menu" style={{ ["--taskbar-h" as any]: `${taskbarH}px` }} />
```
```scss
.start-menu { bottom: var(--taskbar-h); }
```

**Запрещённые свойства в inline styles:**
- ❌ `color`, `backgroundColor`, `borderColor` — используй классы
- ❌ `border`, `borderWidth`, `borderStyle` — используй mixins
- ❌ `fontSize`, `fontFamily`, `fontWeight` — используй классы
- ❌ `padding`, `margin` — используй классы/utilities
- ❌ `boxShadow` — используй mixins (кроме динамических теней для z-index)
- ❌ `cursor` — используй классы (кроме динамических состояний drag)

### Migration Rules: Inline Styles → SCSS Classes

**Правило 1: Визуальные свойства → Классы**

Все визуальные свойства (цвета, бордеры, шрифты, отступы) должны быть вынесены в SCSS классы:

```typescript
// ❌ Было (inline style)
<div style={{
  color: '#000000',
  padding: '8px',
  backgroundColor: '#c0c0c0',
  border: '1px solid #808080'
}} />

// ✅ Стало (SCSS класс)
<div className="win-window-base" />
```

```scss
.win-window-base {
  color: var(--win-text);
  padding: var(--spacing-md);
  background: var(--win-gray);
  border: 1px solid var(--win-gray-dark);
}
```

**Правило 2: Повторяющиеся паттерны → Mixins**

Повторяющиеся паттерны (bevels, buttons, window frame) должны быть вынесены в mixins:

```typescript
// ❌ Было (inline style в каждом компоненте)
<div style={{
  borderTop: '1px solid #808080',
  borderLeft: '1px solid #808080',
  borderRight: '1px solid #ffffff',
  borderBottom: '1px solid #ffffff',
  boxShadow: 'inset 1px 1px 0 #000000'
}} />

// ✅ Стало (SCSS mixin)
<div className="input-field" />
```

```scss
.input-field {
  @include bevel-inset;
}
```

**Правило 3: Фиксированные структуры → Component Classes**

Фиксированные структуры компонентов (window, taskbar, explorer) должны использовать component classes:

```typescript
// ❌ Было (inline style для структуры окна)
<div style={{
  height: '20px',
  padding: '2px 4px',
  background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
  color: '#ffffff'
}}>
  Window Title
</div>

// ✅ Стало (component class)
<div className="win-titlebar">
  Window Title
</div>
```

**Правило 4: Одноразовые стили → Utility Classes**

Одноразовые стили (spacing, text alignment) должны использовать utility classes:

```typescript
// ❌ Было (inline style)
<div style={{ marginTop: '8px', textAlign: 'center' }} />

// ✅ Стало (utility class)
<div className="mt-md text-center" />
```

**Правило 5: Динамические значения → Inline Styles с allow-tag v2**

Динамические значения (drag/resize positioning, layout calculations) могут оставаться в inline styles с allow-tag v2:

```typescript
// ✅ Разрешено (drag/resize)
// inline-style: allowed (reason: drag/resize; why: mouse position during drag; revisit: FP7)
<div style={{ 
  transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
  zIndex: state.zIndex 
}} />

// ✅ Разрешено (layout-calc) — только при измерении из viewport/ResizeObserver
// inline-style: allowed (reason: layout-calc; why: viewport measured; revisit: FP7)
<div style={{ 
  width: `${viewportWidth - 40}px`,
  maxHeight: `${viewportHeight - 100}px` 
}} />
```

**Примеры:**

✅ **Разрешено (drag/resize):**
```typescript
// inline-style: allowed (reason: drag/resize; why: mouse position during drag; revisit: FP7)
<div style={{ 
  transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
  zIndex: state.zIndex 
}} />
```

✅ **Разрешено (layout-calc):**
```typescript
// inline-style: allowed (reason: layout-calc; why: viewport measured; revisit: FP7)
<div style={{ 
  width: `${viewportWidth - 40}px`,
  maxHeight: `${viewportHeight - 100}px` 
}} />
```

❌ **Запрещено (визуальные свойства):**
```typescript
// НЕПРАВИЛЬНО: визуальные свойства должны быть в классах
<div style={{ 
  color: '#000',
  padding: '8px',
  backgroundColor: '#c0c0c0' 
}} />
```

**Правильно:**
```typescript
<div className="win-window-base win-window">
  {/* содержимое */}
</div>
```

### !important Policy

**Общее правило:** `!important` запрещён во всех CSS/SCSS файлах.

**Почему запрещён:**
1. **Специфичность:** `!important` ломает каскадность CSS, делает стили непредсказуемыми
2. **Поддержка:** Сложно переопределить стили при необходимости
3. **Архитектура:** Правильная специфичность селекторов решает все проблемы без `!important`

**Безопасность и доступность:**
- ✅ **Безопасность:** Запрет `!important` не влияет на безопасность (XSS, CSP)
- ✅ **Доступность:** Запрет `!important` не влияет на доступность (screen readers, keyboard navigation)
- ✅ **Правильная специфичность:** Использование правильной специфичности селекторов обеспечивает предсказуемое поведение стилей

**Если нужна высокая специфичность:**
- Используй более специфичные селекторы: `.win-window-base.win-window` вместо `.win-window`
- Используй вложенность в SCSS: `.win-window-base { .win-window { ... } }`
- Используй атрибуты: `[data-state="active"]` для состояний

**Проверка:**
- Stylelint правило `declaration-no-important: true` блокирует `!important` в CSS/SCSS
- Pre-commit hook проверяет наличие `!important` перед коммитом
- CI проверяет все стили при push

### Style Guardrails Summary

**Запрещено:**
- ❌ `!important` — используй правильную специфичность селекторов
- ❌ Абсолютные единицы (`px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `Q`) в SCSS — используй относительные единицы (`rem`, `em`, `%`, `vh`, `vw`, `vmin`, `vmax`, `ch`, `ex`)
- ❌ Inline styles для визуальных свойств (без allow-tag v2) — используй классы/SCSS
- ❌ Константные inline styles (даже с allow-tag) — все значения должны зависеть от runtime
- ❌ Disallowed patterns: fixed fullscreen backdrop/overlay, позиционирование меню константами, zIndex magic numbers — всегда CSS классы + tokens

**Разрешено:**
- ✅ Относительные единицы (`rem`, `em`, `%`, `vh`, `vw`, `vmin`, `vmax`, `ch`, `ex`)
- ✅ Unitless `0` (например, `margin: 0`)
- ✅ Inline styles с allow-tag v2 (reason + why + revisit) для drag/resize/layout-calc/performance случаев

## Правила

### ❌ Никаких !important
Все стили должны работать без `!important`. Используй правильную специфичность селекторов.

### ❌ Никаких inline styles для визуальных свойств
Используй классы/SCSS для цветов, бордеров, шрифтов, отступов. Inline styles только для whitelist случаев с allow-tag.

### ✅ Повторяющиеся паттерны через mixins/компонентные классы
Не дублируй код. Используй mixins для повторяющихся паттернов, component classes для фиксированных структур.

### ✅ Постепенная миграция inline styles → SCSS
Структура позволяет постепенную миграцию:
1. Заменить inline styles на mixins
2. Заменить повторяющиеся паттерны на component classes
3. Использовать utility classes для одноразовых стилей

## Unit Policy: Запрет абсолютных единиц

**Общее правило:** Все абсолютные единицы измерения запрещены в стилях. Stylelint блокирует коммиты с абсолютными единицами.

**Исключение для inline styles:** В коде допускаются `px` **только** в runtime-координатах (drag/resize) и **только** внутри `transform`/`translate`; все постоянные размеры — `rem`.

### Запрещённые единицы (absolute units)

❌ **Запрещено:**
- `px` (pixels)
- `pt` (points)
- `pc` (picas)
- `in` (inches)
- `cm` (centimeters)
- `mm` (millimeters)
- `q` / `Q` (quarter-millimeters)

**Почему запрещены:**
- Абсолютные единицы не масштабируются с пользовательскими настройками браузера
- Ухудшают доступность для пользователей с увеличенным размером шрифта
- Не адаптируются к различным размерам экранов

### Разрешённые единицы (relative units)

✅ **Разрешено:**
- `rem` — для typography, spacing, borders, размеров элементов
- `em` — для относительных размеров внутри компонентов
- `%` — для относительных размеров внутри контейнера
- `vh` / `vw` — для viewport-dependent размеров
- `vmin` / `vmax` — для минимальных/максимальных размеров viewport
- `ch` — для ширины символов (typography)
- `ex` — для высоты символов (typography)

**Unitless `0`:**
- Разрешено использовать `0` без единиц измерения (например, `margin: 0`, `padding: 0`)
- Запрещено использовать `0px`, `0pt` и т.д. — используй просто `0`

### Когда использовать какие единицы

1. **rem** — для typography, spacing, borders, размеров элементов
   - Root font-size: 16px (если не задано — зафиксируй явно на app root)
   - Conversion: `rem = px / 16`
   - Округление: до 3 знаков (пример: 11px → 0.688rem)

2. **vh/vw** — для viewport-dependent размеров
   - Fullscreen overlays / shell root: `width: 100vw`, `height: 100vh`
   - Окна: `max-width: calc(100vw - 2rem)` и т.п. (где уместно)

3. **%** — для относительных размеров внутри контейнера
   - Используй где уместно (например, `width: 100%` внутри контейнера)

4. **em** — для относительных размеров внутри компонентов
   - Используй когда размер должен зависеть от размера шрифта родителя

5. **ch/ex** — для typography
   - Используй для точного позиционирования текста относительно символов

### Conversion Table

**Источник правды — rem.** В SCSS используй rem; px в таблице — только для справки/конвертации.

| px | rem | Примечание |
|----|-----|------------|
| 1px | 0.0625rem | Hairline border |
| 2px | 0.125rem | Minimal spacing |
| 4px | 0.25rem | Small spacing |
| 6px | 0.375rem | - |
| 8px | 0.5rem | Medium spacing |
| 10px | 0.625rem | Small font |
| 11px | 0.688rem | Normal font (Win95) |
| 12px | 0.75rem | Medium font |
| 14px | 0.875rem | Large font |
| 16px | 1rem | Base unit, XL spacing |
| 18px | 1.125rem | Window controls |
| 20px | 1.25rem | Titlebar height |
| 24px | 1.5rem | Icon size |
| 30px | 1.875rem | - |
| 32px | 2rem | - |
| 40px | 2.5rem | Taskbar height |
| 48px | 3rem | Desktop icon size |
| 64px | 4rem | - |
| 80px | 5rem | - |
| 120px | 7.5rem | - |
| 150px | 9.375rem | - |
| 200px | 12.5rem | - |
| 300px | 18.75rem | - |
| 400px | 25rem | - |
| 1440px | 90rem | Max window width |

### Проверка

Stylelint автоматически проверяет отсутствие абсолютных единиц:
- Pre-commit hook блокирует коммиты с абсолютными единицами (`px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `Q`)
- CI проверяет все стили при push
- Правило применяется ко всем CSS/SCSS/SASS/STYL файлам
- Проверка работает внутри `calc()` и `var()` выражений

**Команда проверки:**
```bash
npx stylelint "front/**/*.{css,scss,sass,styl}" --max-warnings=0
```

**Примеры ошибок:**
```css
/* ❌ Запрещено */
width: 10px;
height: 2cm;
margin: 1pt;
padding: calc(10px + 2rem); /* px внутри calc() тоже запрещено */

/* ✅ Разрешено */
width: 0.625rem; /* 10px → 0.625rem */
height: 2rem;
margin: 0; /* unitless 0 */
padding: calc(2rem + 1vh);
```

## Миграция из retro.css

Существующий `retro.css` использует CSS переменные (`--win-gray`, etc.). Новая структура SCSS использует SCSS переменные (`$win-gray`, etc.).

**Стратегия миграции:**
1. SCSS переменные и CSS переменные могут сосуществовать
2. Постепенно заменять CSS переменные на SCSS переменные в новых компонентах
3. TypeScript компоненты используют `tokens.ts` для type safety
4. SCSS компоненты используют `_tokens.scss` для стилей

## Связь с TypeScript Tokens

SCSS tokens (`_tokens.scss`) **зеркалируют** TypeScript tokens (`ui/win95/tokens.ts`). Оба являются источниками правды для своих контекстов:
- **TypeScript tokens** — для inline styles в компонентах
- **SCSS tokens** — для SCSS стилей и классов

**Важно:** При изменении токенов обновляй оба файла синхронно.

## Pre-commit Hooks

Style guardrails проверяются автоматически через pre-commit hooks (husky + lint-staged):

### Проверки

1. **ESLint:** Проверяет inline styles в `.ts` и `.tsx` файлах
2. **Stylelint:** Проверяет `!important` и запрещает `px` в `.css` и `.scss` файлах
3. **Custom Script:** `scripts/check-inline-styles.cjs` проверяет allow-tag комментарии для inline styles

### Команды проверки

```bash
# Полная проверка
npm run lint

# Отдельные проверки
npm run lint:js      # ESLint только
npm run lint:css     # Stylelint только
npm run lint:staged  # Проверка staged файлов (через lint-staged)
```

### Canary Checks

Canary тесты в `front/__tests__/style-guardrails/` проверяют, что guardrails работают:

- `canary-important.test.css` — должен падать при коммите (содержит `!important`)
- `canary-absolute-units.test.css` — должен падать при коммите (содержит абсолютные единицы: `px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `Q`)
- `canary-inline-style.test.tsx` — должен падать при коммите (inline style без allow-tag)
- `canary-inline-absolute-units.test.tsx` — должен падать при коммите (inline style с абсолютными единицами)
- `canary-inline-style-allowed.test.tsx` — должен проходить (inline style с allow-tag v2)
- `canary-inline-style-constants.test.tsx` — должен падать (inline с литералами и allow-tag layout-calc)
- `canary-inline-style-backdrop.test.tsx` — должен падать (fullscreen backdrop с allow-tag)

**Проверка canary тестов:**
```bash
# Проверка всех canary тестов
cd front
npm run test:canary

# Отдельные проверки:

# Проверка !important
npx stylelint __tests__/style-guardrails/canary-important.test.css
# Должен упасть с ошибкой "Unexpected !important"

# Проверка абсолютных единиц в CSS
npx stylelint __tests__/style-guardrails/canary-absolute-units.test.css
# Должен упасть с ошибкой "Unexpected unit"

# Проверка inline style без allow-tag
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style.test.tsx
# Должен упасть с ошибкой "Inline style found without allow-tag"

# Проверка абсолютных единиц в inline styles
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-absolute-units.test.tsx
# Должен упасть с ошибкой "Absolute units found in inline style"

# Проверка inline style с allow-tag v2
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# Должен пройти

# Проверка constants (должен падать)
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-constants.test.tsx
# Должен упасть

# Проверка backdrop (должен падать)
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-backdrop.test.tsx
# Должен упасть
```

## Migration Checklist

### Wave 1: Theme Tokens System (Foundation)
- [x] Создать структуру `themes/` с `win95-default.scss` и `win95-high-contrast.scss`
- [x] Определить CSS custom properties для всех обязательных токенов
- [ ] Обновить `_tokens.scss` для использования CSS variables как fallback
- [ ] Обновить `_mixins.scss` для использования `var()` вместо SCSS переменных
- [ ] Обновить `_components.scss` для использования `var()` вместо SCSS переменных
- [ ] Обновить `index.scss` для импорта themes
- [ ] Протестировать переключение тем без изменения компонентов

### Wave 2-5: Component Migration (5-10 компонентов за PR)
- [ ] Мигрировать WindowFrame: inline styles → SCSS классы
- [ ] Мигрировать WindowManager: inline styles → SCSS классы
- [ ] Мигрировать DesktopIcon: inline styles → SCSS классы
- [ ] Мигрировать Explorer: inline styles → SCSS классы
- [ ] Мигрировать Taskbar: inline styles → SCSS классы
- [ ] Мигрировать Viewers (ImageViewer, VideoViewer, Notepad, InternetExplorer): inline styles → SCSS классы
- [ ] Мигрировать MobileShell: inline styles → SCSS классы
- [ ] Обновить тесты/селекторы для мигрированных компонентов
- [ ] Проверить: `npm run test` + `npm run lint` зеленые

### Wave 6: Documentation & Examples
- [x] Создать `THEME_CONTRACT.md` с описанием механизма переключения тем
- [x] Обновить `GUIDE_STYLE.md` с информацией о темах и правилами миграции
- [ ] Создать examples: "как добавить новый компонент правильно"
- [ ] Создать migration guide: "как мигрировать inline styles → SCSS"

## Ссылки

- **FP7.md:** [M6: Style System Refactor](../fps/FP7.md#m6-style-system-refactor) — Style System Refactor
- **THEME_CONTRACT.md:** [Theme contract](./THEME_CONTRACT.md) — Theme system contract
- **WIN95_TOKENS_RULES.md:** Token rules
- **WIN95_UI_KIT.md:** Design requirements
- **front/src/ui/win95/tokens.ts:** TypeScript tokens
- **front/src/styles/guide.md:** Подробный гайд по mixin vs component class
- **Конфигурация:**
  - `.eslintrc.json` — ESLint конфигурация
  - `.stylelintrc.json` — Stylelint конфигурация
  - `.lintstagedrc.json` — lint-staged конфигурация
  - `.husky/pre-commit` — pre-commit hook
