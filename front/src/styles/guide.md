# Win95 UI Style Guide: Mixin vs Component Class

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Guide for deciding when to use mixin vs component class in Win95 UI styling

## Правило выбора

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

## Обязательные Mixins для FP7

### 1. Bevel Mixins (обязательно)
```scss
@include bevel-inset;    // Для input полей, sunken панелей
@include bevel-outset;   // Для кнопок, raised панелей
@include window-frame;   // Для окон
```

**Где используется:**
- Input fields → `bevel-inset`
- Buttons → `bevel-outset`
- Window borders → `window-frame`
- Explorer tree/grid → `bevel-inset`

### 2. Window Mixins (обязательно)
```scss
@include window-titlebar;              // Заголовок окна
@include window-control-button;        // Кнопки управления окном
@include window-control-button-active; // Активное состояние кнопки
```

**Где используется:**
- Все окна (WindowFrame, Explorer, Viewers) → `window-titlebar`
- Кнопки minimize/maximize/close → `window-control-button`

### 3. Button Mixins (обязательно)
```scss
@include button-default;    // Стандартная кнопка
@include button-active;    // Активное состояние (pressed)
@include button-disabled;  // Отключенное состояние
```

**Где используется:**
- Все кнопки в окнах → `button-default`
- Кнопки в формах → `button-default` + `button-active`

### 4. Input Mixin (обязательно)
```scss
@include input-text;  // Текстовое поле (inset)
```

**Где используется:**
- Input поля в формах → `input-text`
- Textarea → `input-text` (можно расширить)

## Обязательные Component Classes для FP7

### 1. Window Component (обязательно)
```scss
.win-window-base      // Базовый класс окна
.win-window           // Основное окно приложения
.win-window-modal     // Модальное окно
.win-titlebar         // Заголовок окна
.win-window-controls  // Контролы окна
.win-content          // Контент окна
```

**Где используется:**
- WindowFrame компонент → `.win-window-base`, `.win-titlebar`
- Все окна приложений → `.win-window`
- Модальные окна → `.win-window-modal`

### 2. Taskbar Component (обязательно)
```scss
.win-taskbar         // Базовый класс taskbar
.win-taskbar-tray    // Tray область (справа)
```

**Где используется:**
- Taskbar компонент → `.win-taskbar`
- Tray area (User Icon, Clock) → `.win-taskbar-tray`

### 3. Explorer Component (обязательно)
```scss
.win-explorer           // Базовый класс explorer
.explorer-tree          // Tree view (слева)
.explorer-divider       // Разделитель
.explorer-grid          // Grid view (справа)
```

**Где используется:**
- Explorer компонент → `.win-explorer`
- Tree view → `.explorer-tree`
- Grid view → `.explorer-grid`

### 4. Desktop Icons Component (обязательно)
```scss
.win-desktop-icons    // Grid иконок на desktop
.desktop-icon         // Отдельная иконка
```

**Где используется:**
- Desktop Icons компонент → `.win-desktop-icons`
- Отдельные иконки → `.desktop-icon`

## Миграция: Inline Styles → SCSS

### Шаг 1: Заменить inline styles на mixins
```typescript
// ❌ Было (inline style)
<div style={{
  borderTop: '1px solid #808080',
  borderLeft: '1px solid #808080',
  borderRight: '1px solid #ffffff',
  borderBottom: '1px solid #ffffff',
  boxShadow: 'inset 1px 1px 0 #000000',
}}>

// ✅ Стало (SCSS mixin)
<div className="input-field">
```
```scss
.input-field {
  @include bevel-inset;
}
```

### Шаг 2: Заменить повторяющиеся паттерны на component classes
```typescript
// ❌ Было (inline style в каждом компоненте)
<div style={{
  height: '20px',
  padding: '2px 4px',
  background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
  color: '#ffffff',
}}>

// ✅ Стало (component class)
<div className="win-titlebar">
```

### Шаг 3: Использовать utility classes для одноразовых стилей
```typescript
// ❌ Было (inline style)
<div style={{ marginTop: '8px', textAlign: 'center' }}>

// ✅ Стало (utility class)
<div className="mt-md text-center">
```

## Примеры использования

### Пример 1: Кнопка (Mixin)
```scss
// Mixin для кнопки (можно применить к любому button)
.my-custom-button {
  @include button-default;
  
  &:active {
    @include button-active;
  }
  
  &:disabled {
    @include button-disabled;
  }
}
```

### Пример 2: Окно (Component Class)
```scss
// Component class для окна (фиксированная структура)
.win-window-base {
  @include window-frame;
  
  .win-titlebar {
    @include window-titlebar;
  }
  
  .win-content {
    // content styles
  }
}
```

### Пример 3: Input поле (Mixin)
```scss
// Mixin для input (можно применить к input, textarea)
input[type="text"],
textarea {
  @include input-text;
}
```

### Пример 4: Explorer (Component Class)
```scss
// Component class для explorer (фиксированная структура)
.win-explorer {
  .explorer-tree {
    @include bevel-inset;
  }
  
  .explorer-grid {
    @include bevel-inset;
  }
}
```

## Чек-лист для FP7

### Tokens (обязательно)
- [x] Colors (Chicago95 palette)
- [x] Spacing (xs, sm, md, lg, xl)
- [x] Borders (inset, outset, window)
- [x] Z-index (desktop, window, taskbar, modal)
- [x] Typography (font-family, sizes, weights, line-heights)

### Mixins (обязательно)
- [x] `bevel-inset` — для input полей, sunken панелей
- [x] `bevel-outset` — для кнопок, raised панелей
- [x] `window-frame` — для окон
- [x] `window-titlebar` — для заголовков окон
- [x] `window-control-button` — для кнопок управления окном
- [x] `button-default` — для стандартных кнопок
- [x] `button-active` — для активного состояния кнопок
- [x] `button-disabled` — для отключенных кнопок
- [x] `input-text` — для текстовых полей

### Component Classes (обязательно)
- [x] `.win-window-base` — базовый класс окна
- [x] `.win-titlebar` — заголовок окна
- [x] `.win-window-controls` — контролы окна
- [x] `.win-taskbar` — taskbar
- [x] `.win-taskbar-tray` — tray область
- [x] `.win-explorer` — explorer
- [x] `.win-desktop-icons` — desktop icons

### Utilities (опционально, но полезно)
- [x] Spacing utilities (m-*, p-*, gap-*)
- [x] Text utilities (text-*, font-*)
- [x] Layout utilities (flex, items-*, justify-*)
- [x] Display utilities (block, inline, hidden)

## Анти-паттерны

### ❌ Не используй !important
```scss
// ❌ Плохо
.my-class {
  color: $win-text !important;
}

// ✅ Хорошо
.my-class {
  color: $win-text;
}
```

### ❌ Не дублируй mixins в component classes
```scss
// ❌ Плохо (дублирование)
.win-button {
  padding: 4px 12px;
  border: 1px solid $win-black;
  // ... все стили кнопки
}

// ✅ Хорошо (используй mixin)
.win-button {
  @include button-default;
}
```

### ❌ Не создавай component class для одноразового использования
```scss
// ❌ Плохо (component class для одноразового использования)
.my-special-button {
  // стили только для одной кнопки
}

// ✅ Хорошо (используй mixin или utility)
.my-special-button {
  @include button-default;
  // дополнительные стили если нужно
}
```

## Ссылки

- **FP7.md:** UX Rules Desktop Win95
- **WIN95_TOKENS_RULES.md:** Token rules
- **WIN95_UI_KIT.md:** Design requirements
- **front/src/ui/win95/tokens.ts:** TypeScript tokens (mirror)
