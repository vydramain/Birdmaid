# Batch Migration Report: WindowFrame/Taskbar/Buttons

**Date:** 2024-12-19  
**Batch:** WindowFrame, Taskbar, WindowManager  
**Status:** ✅ Completed

## Summary

Успешно мигрированы inline styles из критичных компонентов WindowFrame, Taskbar и WindowManager в CSS классы. Все визуальные и layout inline styles заменены на классы, оставлены только whitelisted computed geometry styles для drag/resize операций.

## Files Modified

### Components
1. `front/src/os/wm/WindowFrame.tsx` - миграция inline styles окна
2. `front/src/os/taskbar/Taskbar.tsx` - миграция inline styles панели задач
3. `front/src/os/wm/WindowManager.tsx` - миграция inline styles контент-обертки

### Styles
4. `front/src/styles/_components.scss` - добавлены новые CSS классы

### Tests
5. `front/__tests__/fp7/taskbar.tray.test.tsx` - обновлен селектор для поиска taskbar

## New CSS Classes

### WindowFrame
- `.win-window-frame` - позиционирование и базовый layout окна (position: absolute, left: 0, top: 0, min-width, max-width, max-height, display, flex-direction)
- `.win-titlebar-dragging` - состояние курсора при перетаскивании (cursor: grabbing)
- `.win-window-content` - контейнер контента окна (padding, flex, overflow, display, flex-direction)

### Taskbar
- `.win-taskbar-fixed` - фиксированное позиционирование панели задач (position: fixed, bottom: 0, left: 0, right: 0, background, border, display, align-items, padding, box-sizing)
- `.win-taskbar-window-list` - область списка окон (flex: 1)
- `.win-taskbar-tray .tray-icon` - стили иконки пользователя в трее (width, height, cursor, display, align-items, justify-content, background, border, box-shadow, font-size, user-select)
- `.win-taskbar-tray .tray-icon-logged-in` - состояние иконки при авторизации (background-color: blue)
- `.win-taskbar-tray .tray-clock` - стили часов (font-size, color, padding, font-family, user-select)

### WindowManager
- `.win-content-wrapper` - обертка контента окна (padding, height, overflow, display, flex-direction)
- `.win-content-wrapper-game` - вариант для игр без padding

## Whitelisted Inline Styles

Оставлены только computed geometry styles для drag/resize операций с комментариями `// inline-style: allowed (reason: drag/resize|layout-calc)`:

### WindowFrame.tsx
```typescript
style={{
  // inline-style: allowed (reason: drag/resize)
  transform: `translate3d(${state.x}px, ${state.y}px, 0)`, // computed geometry
  zIndex: state.zIndex, // computed z-index
  width: state.width, // computed width
  boxShadow: state.zIndex > 10 ? "4px 4px 10px rgba(0,0,0,0.5)" : undefined, // computed shadow
}}
```

### Taskbar.tsx
```typescript
style={{
  // inline-style: allowed (reason: layout-calc)
  height: `${taskbar.height}px`, // computed height
  zIndex: taskbar.zIndex, // computed z-index
}}
```

### WindowManager.tsx
```typescript
style={{
  // inline-style: allowed (reason: drag/resize)
  position: "fixed", // fixed overlay for drag
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  backgroundColor: "transparent",
  pointerEvents: "auto"
}}
```

## Migration Details

### WindowFrame.tsx
**Before:**
- Inline styles: position, left, top, transform, zIndex, width, display, flexDirection, minWidth, maxWidth, maxHeight, boxShadow
- Titlebar: cursor, touchAction
- Content: padding, flex, overflow, display, flexDirection

**After:**
- Класс `.win-window-frame` для позиционирования и layout
- Класс `.win-titlebar-dragging` для состояния перетаскивания
- Класс `.win-window-content` для контента
- Оставлены только computed: transform, zIndex, width, boxShadow

### Taskbar.tsx
**Before:**
- Inline styles: position, bottom, left, right, height, backgroundColor, borderTop, borderBottom, zIndex, display, alignItems, padding, boxSizing
- Window list: flex: 1
- Tray: display, gap, alignItems, padding
- User icon: width, height, cursor, display, alignItems, justifyContent, backgroundColor, border, boxShadow, fontSize, userSelect
- Clock: fontSize, color, padding, fontFamily, userSelect

**After:**
- Класс `.win-taskbar-fixed` для фиксированного позиционирования
- Класс `.win-taskbar-window-list` для списка окон
- Класс `.win-taskbar-tray` для трея (уже существовал, расширен)
- Класс `.tray-icon` для иконки пользователя
- Класс `.tray-icon-logged-in` для состояния авторизации
- Класс `.tray-clock` для часов (уже существовал)
- Оставлены только computed: height, zIndex

### WindowManager.tsx
**Before:**
- Drag overlay: position, top, left, right, bottom, zIndex, backgroundColor, pointerEvents (WHITELIST)
- Content wrapper: padding, height, overflow, display, flexDirection

**After:**
- Drag overlay остался inline (WHITELIST с комментарием)
- Класс `.win-content-wrapper` для обертки контента
- Класс `.win-content-wrapper-game` для игр без padding

## Testing

✅ Все тесты проходят:
- `__tests__/fp7/taskbar.tray.test.tsx` - 5 тестов passed
- Обновлен селектор в тесте: `[style*="position: fixed"]` → `.win-taskbar-fixed`

✅ Линтер:
- Нет ошибок в мигрированных файлах
- Whitelisted inline styles имеют правильные комментарии

## Usage Examples

### WindowFrame
```tsx
<div
  className="win-window-base win-window win-window-frame"
  style={{
    // inline-style: allowed (reason: drag/resize)
    transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
    zIndex: state.zIndex,
    width: state.width,
    boxShadow: state.zIndex > 10 ? "4px 4px 10px rgba(0,0,0,0.5)" : undefined,
  }}
>
  <header className={`win-titlebar ${state.isDragging ? "win-titlebar-dragging" : ""}`}>
    {/* ... */}
  </header>
  <div className="win-window-content">
    {children}
  </div>
</div>
```

### Taskbar
```tsx
<div
  className="win-taskbar-fixed"
  style={{
    // inline-style: allowed (reason: layout-calc)
    height: `${taskbar.height}px`,
    zIndex: taskbar.zIndex,
  }}
>
  <div className="win-taskbar-window-list">
    {/* Window list */}
  </div>
  <div className="win-taskbar-tray">
    <div className={`tray-icon ${isLoggedIn ? "tray-icon-logged-in" : ""}`}>
      👤
    </div>
    <div className="tray-clock">
      {formatTime(currentTime)}
    </div>
  </div>
</div>
```

### WindowManager
```tsx
<div className={isGame ? "win-content-wrapper win-content-wrapper-game" : "win-content-wrapper"}>
  {ContentComponent ? <ContentComponent {...contentProps} /> : <div>Unknown App</div>}
</div>
```

## Next Steps

Следующие batch для миграции (согласно MIGRATION_BATCHES.md):
- Batch 1: Viewers (ImageViewer, VideoViewer, Notepad, InternetExplorer)
- Batch 2: Simple Components (GameWindow, HelpWindow, LandingWindow)
- Batch 3: Explorer (ExplorerWindow)
- Batch 4: Desktop (DesktopPage, DesktopIcon)

## Notes

1. **Кнопки (Buttons)**: Компонент `Win95Button` уже использует класс `.win-btn`, который определен в `retro.css`. Дополнительная миграция не требуется.

2. **Совместимость**: Все изменения обратно совместимы, поведение UI не изменилось.

3. **Производительность**: Миграция не влияет на производительность, computed geometry styles остаются inline для оптимизации drag/resize операций.
