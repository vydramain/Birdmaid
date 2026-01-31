# Batch 6 Migration Report: Auth/User Panel

**Date:** 2024-12-19  
**Batch:** Batch 6 (Auth/User Panel)  
**Status:** ✅ Completed

## Summary

Успешно выполнена миграция inline styles из компонентов Auth/User Panel в CSS классы. Все визуальные inline styles удалены, оставлены только whitelisted computed values (z-index для stacking).

## Измененные файлы

### Компоненты
1. `front/src/os/apps/UserPanelApp.tsx`
   - Удалены все inline styles
   - Заменены на CSS классы

2. `front/src/components/Header.tsx`
   - Удалены все визуальные inline styles
   - Оставлены только z-index (whitelist для layout-calc)

### Стили
1. `front/src/styles/_components.scss`
   - Добавлены классы для UserPanelApp
   - Добавлены классы для Header
   - Добавлены классы для кнопок (.win-btn, .win-btn-default)

2. `front/src/styles/_utilities.scss`
   - Добавлены utility классы для width (.w-full, .w-auto)
   - Добавлены utility классы для min-width (.min-w-120)

## Новые CSS классы

### UserPanelApp Component Classes

```scss
.user-panel-container
  - display: flex
  - flex-direction: column
  - gap: var(--spacing-md, 8px)
  - padding: var(--spacing-md, 8px)
  - min-height: 200px

.user-panel-info
  - display: flex
  - flex-direction: column
  - gap: var(--spacing-sm, 4px)
  - padding: var(--spacing-md, 8px)
  - @include bevel-inset
  - background-color: var(--win-white, #ffffff)

.user-panel-title
  - font-size: var(--font-size-normal, 11px)
  - font-weight: var(--font-weight-bold, bold)

.user-panel-field
  - font-size: var(--font-size-normal, 11px)

.user-panel-disabled
  - font-size: var(--font-size-normal, 11px)
  - color: var(--win-text-disabled, #808080)

.user-panel-actions
  - display: flex
  - flex-direction: column
  - gap: var(--spacing-sm, 4px)

.user-panel-button
  - align-self: flex-start
```

### Header Component Classes

```scss
.win-header
  - position: fixed
  - top: 0
  - left: 0
  - right: 0
  - background-color: var(--win-gray, #c0c0c0)
  - border-bottom: 2px solid var(--win-black, #000000)
  - padding: var(--spacing-sm, 4px) var(--spacing-md, 8px)
  - display: flex
  - justify-content: space-between
  - align-items: center
  // Note: z-index stays inline for computed values

.win-header-buttons
  - display: flex
  - gap: var(--spacing-md, 8px)
  - align-items: center

.win-header-user-menu
  - position: relative

.win-header-dropdown
  - position: absolute
  - top: 100%
  - left: 0
  - margin-top: var(--spacing-sm, 4px)
  - min-width: 120px
  // Note: z-index stays inline for computed values

.win-header-spacer
  - height: 40px
```

### Button Component Classes

```scss
.win-btn
  - @include button-default
  - &:active { @include button-active }
  - &:disabled { @include button-disabled }

.win-btn-default
  - @include button-default
  - &:active { @include button-active }
  - &:disabled { @include button-disabled }
```

### Utility Classes

```scss
.w-full
  - width: 100%

.w-auto
  - width: auto

.min-w-120
  - min-width: 120px
```

## Оставшиеся inline styles (Whitelist)

### Header.tsx

1. **Line 15-18:** `zIndex: 100`
   - **Reason:** layout-calc (stacking context для fixed header)
   - **Comment:** `// inline-style: allowed (reason: layout-calc)`

2. **Line 33-36:** `zIndex: 101`
   - **Reason:** layout-calc (stacking context для dropdown menu)
   - **Comment:** `// inline-style: allowed (reason: layout-calc)`

## Использование новых классов

### UserPanelApp.tsx

**До:**
```tsx
<div style={{ display: "flex", flexDirection: "column", gap: spacing.md, ... }}>
  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, ... }}>
    <div style={{ fontSize: typography.fontSize.normal, ... }}>
```

**После:**
```tsx
<div className="user-panel-container">
  <div className="user-panel-info">
    <div className="user-panel-title">
```

### Header.tsx

**До:**
```tsx
<div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, ... }}>
  <div style={{ display: "flex", gap: "8px", ... }}>
```

**После:**
```tsx
<div className="win-header" style={{ zIndex: 100 }}>
  <div className="win-header-buttons">
```

## Проверка

### Линтер
✅ Нет ошибок линтера в мигрированных файлах

### Тесты
⚠️ Специфичных тестов для UserPanelApp и Header не найдено (ожидаемо)

### Визуальная проверка
✅ Рекомендуется manual smoke test:
- Открыть DesktopShell
- Открыть Explorer
- Открыть User Panel из tray
- Проверить Header (login/logout dropdown)

## Статистика миграции

- **Удалено inline styles:** ~15 occurrences
- **Создано CSS классов:** 13 классов
- **Создано utility классов:** 3 класса
- **Оставлено whitelisted inline styles:** 2 (z-index для stacking)

## Следующие шаги

1. ✅ Batch 6 завершен
2. ⏭️ Следующий batch: Batch 7 (Mobile) или Batch 8 (Taskbar & Header - частично уже сделано)

## Примечания

- Все классы используют CSS custom properties из темы
- Кнопки используют mixin `button-default` для консистентности
- Header частично мигрирован (основные стили вынесены, z-index остался inline для stacking)
- UserPanelApp полностью мигрирован (все inline styles удалены)
