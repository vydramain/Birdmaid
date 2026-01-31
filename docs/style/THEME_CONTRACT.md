# Theme Contract

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Contract for theme system in FP7 (Win95 Desktop + WM6 Mobile)  
**Status:** Design Phase  
**Source:** [FP7.md](../fps/FP7.md) — M6: Style System Refactor

## Overview

Theme system позволяет переключать темы без изменения компонентов. Темизация реализована через CSS custom properties (CSS variables) и data-attribute на root элементе.

## Theme Structure

```
front/src/styles/
  themes/
    _win95-default.scss        # Default theme (Chicago95 palette)
    _win95-high-contrast.scss  # High contrast theme (accessibility)
    _index.scss                # Theme entry point
```

## Theme Mechanism

### CSS Custom Properties (CSS Variables)

Темы задают значения токенов через **CSS custom properties** (CSS variables) в `:root`:

```scss
:root[data-theme="win95-default"] {
  --win-gray: #c0c0c0;
  --win-text: #000000;
  // ... другие токены
}
```

### Theme Switching

Переключение темы происходит через **data-attribute на root элементе** (`<html>` или `<body>`):

```typescript
// Переключение темы
document.documentElement.setAttribute('data-theme', 'win95-high-contrast');

// Возврат к default
document.documentElement.setAttribute('data-theme', 'win95-default');
// или
document.documentElement.removeAttribute('data-theme');
```

**Правило:** Default theme применяется, если `data-theme` отсутствует или равен `win95-default`:

```scss
:root[data-theme="win95-default"],
:root:not([data-theme]) {
  // default theme tokens
}
```

### Usage in SCSS

В SCSS файлах используй CSS variables через `var()`:

```scss
.win-window-base {
  background: var(--win-gray);
  color: var(--win-text);
  border: 1px solid var(--win-gray-dark);
}
```

### Usage in TypeScript/React

В TypeScript компонентах используй CSS variables через inline styles (только для динамических значений):

```typescript
// ❌ НЕ используй для статических значений (используй классы)
<div style={{ backgroundColor: 'var(--win-gray)' }} />

// ✅ Используй классы для статических значений
<div className="win-window-base" />

// ✅ Используй CSS variables только для динамических значений (layout-calc)
<div style={{ 
  width: `calc(100% - ${var(--spacing-md)})` 
}} />
```

## Required Tokens for Win95

Все темы должны определять следующие обязательные токены:

### Colors (обязательно)

```scss
--win-gray: <color>;           // Main window background
--win-gray-light: <color>;      // Top/left borders (raised)
--win-gray-dark: <color>;      // Bottom/right borders (sunken)
--win-gray-darker: <color>;    // Deepest shadows
--win-white: <color>;          // Text on dark, top/left highlights
--win-black: <color>;          // Text, outer borders
--win-blue: <color>;           // Title bar background (start)
--win-blue-light: <color>;    // Title bar background (end gradient)
--win-teal: <color>;          // Desktop background
--win-red: <color>;           // Error states, close button hover
--win-text: <color>;          // Default text
--win-text-inverse: <color>;  // Text on dark backgrounds
--win-text-disabled: <color>; // Disabled text
```

### Spacing (обязательно)

```scss
--spacing-xs: <length>;  // 2px (default)
--spacing-sm: <length>;  // 4px (default)
--spacing-md: <length>;  // 8px (default)
--spacing-lg: <length>;  // 12px (default)
--spacing-xl: <length>; // 16px (default)
```

### Typography (обязательно)

```scss
--font-family: <font-family>;
--font-size-small: <length>;   // 10px (default)
--font-size-normal: <length>;  // 11px (default)
--font-size-medium: <length>;  // 12px (default)
--font-size-large: <length>;   // 14px (default)
--font-weight-normal: <weight>;
--font-weight-bold: <weight>;
--line-height-tight: <number>;    // 1.2 (default)
--line-height-normal: <number>;   // 1.4 (default)
--line-height-relaxed: <number>;  // 1.6 (default)
```

### Z-Index Layers (обязательно)

```scss
--z-desktop: <number>;         // 1 (default)
--z-window: <number>;          // 10 (default)
--z-window-focused: <number>; // 20 (default)
--z-taskbar: <number>;        // 10000 (default)
--z-modal: <number>;          // 10001 (default)
```

### Window Dimensions (обязательно)

```scss
--window-titlebar-height: <length>;    // 20px (default)
--window-titlebar-padding: <length>;  // 2px 4px (default)
--window-titlebar-margin: <length>;  // 2px (default)
--window-controls-size: <length>;    // 18px (default)
--window-controls-gap: <length>;     // 2px (default)
```

### Taskbar Dimensions (обязательно)

```scss
--taskbar-height: <length>;        // 40px (default)
--taskbar-padding: <length>;       // 0 8px (default)
--taskbar-tray-gap: <length>;      // 8px (default)
--taskbar-tray-icon-size: <length>; // 24px (default)
```

### Desktop Icons (обязательно)

```scss
--desktop-icon-size: <length>;              // 48px (default)
--desktop-icon-label-max-width: <length>;   // 64px (default)
--desktop-icon-grid-column-gap: <length>;   // 8px (default)
--desktop-icon-grid-row-gap: <length>;      // 16px (default)
--desktop-icon-padding: <length>;          // 8px (default)
```

### Explorer (обязательно)

```scss
--explorer-divider-width: <length>;        // 4px (default)
--explorer-tree-width: <length>;          // 200px (default)
--explorer-tree-min-width: <length>;      // 150px (default)
--explorer-tree-max-width: <length>;      // 400px (default)
--explorer-grid-item-width: <length>;      // 64px (default)
--explorer-grid-item-icon-size: <length>; // 32px (default)
```

### Scrollbar (обязательно)

```scss
--scrollbar-width: <length>;            // 16px (default)
--scrollbar-thumb-min-height: <length>; // 20px (default)
--scrollbar-button-size: <length>;      // 16px (default)
```

## Theme Implementation

### Step 1: Import Themes

В `front/src/styles/index.scss` импортируй themes:

```scss
@import './themes';  // Импортирует все темы
@import './tokens';  // SCSS переменные (fallback)
@import './mixins';
@import './components';
@import './utilities';
```

### Step 2: Update Tokens to Use CSS Variables

В `_tokens.scss` определи SCSS переменные как fallback для CSS variables:

```scss
// Fallback to SCSS variables if CSS variables not available
$win-gray: var(--win-gray, #c0c0c0);
$win-text: var(--win-text, #000000);
// ... другие токены
```

**Важно:** SCSS переменные используются как fallback, но основным источником правды являются CSS variables из themes.

### Step 3: Update Mixins to Use CSS Variables

В `_mixins.scss` используй CSS variables через `var()`:

```scss
@mixin bevel-inset {
  border-top: 1px solid var(--win-gray-dark);
  border-left: 1px solid var(--win-gray-dark);
  border-right: 1px solid var(--win-white);
  border-bottom: 1px solid var(--win-white);
  box-shadow: inset 1px 1px 0 var(--win-black);
}
```

### Step 4: Update Components to Use CSS Variables

В `_components.scss` используй CSS variables:

```scss
.win-window-base {
  background: var(--win-gray);
  @include window-frame;
  display: flex;
  flex-direction: column;
}
```

## Theme Switching API

### TypeScript Helper

Создай helper для переключения темы:

```typescript
// front/src/utils/theme.ts
export type Theme = 'win95-default' | 'win95-high-contrast';

export function setTheme(theme: Theme | 'default') {
  const root = document.documentElement;
  if (theme === 'default') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function getTheme(): Theme {
  const theme = document.documentElement.getAttribute('data-theme');
  return (theme as Theme) || 'win95-default';
}
```

### React Hook (опционально)

```typescript
// front/src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { setTheme, getTheme, Theme } from '@/utils/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeState(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const changeTheme = (newTheme: Theme | 'default') => {
    setTheme(newTheme);
    setThemeState(getTheme());
  };

  return { theme, changeTheme };
}
```

## Migration from SCSS Variables

### Current State

Сейчас используются SCSS переменные (`$win-gray`, etc.) напрямую в mixins и компонентах.

### Target State

CSS variables (`var(--win-gray)`) из themes, SCSS переменные как fallback.

### Migration Steps

1. **Создать themes** с CSS variables (✅ сделано)
2. **Обновить `_tokens.scss`** для использования CSS variables как fallback
3. **Обновить `_mixins.scss`** для использования `var()` вместо SCSS переменных
4. **Обновить `_components.scss`** для использования `var()` вместо SCSS переменных
5. **Обновить `index.scss`** для импорта themes
6. **Протестировать переключение тем** без изменения компонентов

## Examples

### Example 1: Default Theme

```scss
:root[data-theme="win95-default"],
:root:not([data-theme]) {
  --win-gray: #c0c0c0;
  --win-text: #000000;
}
```

### Example 2: High Contrast Theme

```scss
:root[data-theme="win95-high-contrast"] {
  --win-gray: #c0c0c0;
  --win-gray-dark: #000000;  // Higher contrast
  --win-text: #000000;
}
```

### Example 3: Component Using Theme

```scss
.win-window-base {
  background: var(--win-gray);
  color: var(--win-text);
  border: 1px solid var(--win-gray-dark);
}
```

## References

- **FP7.md:** [M6: Style System Refactor](../fps/FP7.md#m6-style-system-refactor)
- **GUIDE_STYLE.md:** [Style guide rules](./GUIDE_STYLE.md)
- **WIN95_TOKENS_RULES.md:** Token rules
- **WIN95_UI_KIT.md:** Design requirements
