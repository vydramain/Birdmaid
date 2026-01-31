# Batch Migration Report: Viewers (Batch 1)

**Date:** 2024-12-19  
**Subproject:** style-system-refactor  
**FP:** FP7  
**Mode:** build  
**Step:** batch-migration  

## Summary

Успешно мигрированы inline styles из всех Viewer компонентов в CSS классы. Все inline styles удалены, кроме whitelist случаев (нет в этом batch).

## Мигрированные файлы

1. `front/src/os/apps/ImageViewer.tsx`
2. `front/src/os/apps/VideoViewer.tsx`
3. `front/src/os/apps/Notepad.tsx`
4. `front/src/os/apps/InternetExplorer.tsx`
5. `front/src/os/apps/AppHost.tsx` (Executor)

## Новые CSS классы

### Общие классы (shared across viewers)

**Файл:** `front/src/styles/_components.scss`

```scss
// Common viewer states
.viewer-container          // Base container: width/height 100%, flex center
.viewer-loading           // Loading state: extends viewer-container + white bg
.viewer-error             // Error state: padding, red text, white bg
.viewer-empty             // Empty state: padding, gray text, white bg
```

### ImageViewer классы

```scss
.viewer-image-container   // Image container: extends viewer-container + gray bg + overflow + padding
.viewer-image             // Image element: max-width/height 100%, object-fit contain
```

### VideoViewer классы

```scss
.viewer-video-container   // Video container: extends viewer-container + black bg + padding
.viewer-video             // Video element: max-width/height 100%, width/height 100%, object-fit contain
```

### Notepad классы

```scss
.notepad-container        // Notepad container: width/height 100%, flex column, white bg
.notepad-preview          // Markdown preview: flex 1, padding, overflow, font styles
.notepad-textarea         // Textarea: flex 1, padding, no border/outline, font styles, no resize
```

### InternetExplorer классы

```scss
.viewer-ie-container      // IE container: width/height 100%, position relative, white bg
.viewer-iframe            // Iframe: width/height 100%, no border, display block
.viewer-iframe-hidden     // Modifier: display none (для условного скрытия)
```

### AppHost (Executor) классы

```scss
.apphost-container        // AppHost container: width/height 100%, position relative, flex column
.apphost-loading-overlay  // Loading overlay: absolute, full size, flex center, white bg, z-index 1
.apphost-error            // Error state: padding, red text
.apphost-iframe          // Iframe: flex 1, no border, width/height 100%, display block
.apphost-iframe-hidden    // Modifier: display none (для условного скрытия)
```

## Использование классов

### ImageViewer
- Loading: `.viewer-loading`
- Error: `.viewer-error`
- Empty: `.viewer-empty`
- Container: `.viewer-image-container`
- Image: `.viewer-image`

### VideoViewer
- Loading: `.viewer-loading`
- Error: `.viewer-error`
- Empty: `.viewer-empty`
- Container: `.viewer-video-container`
- Video: `.viewer-video`

### Notepad
- Loading: `.viewer-loading`
- Error: `.viewer-error`
- Container: `.notepad-container`
- Preview: `.notepad-preview` (для markdown)
- Textarea: `.notepad-textarea` (для plain text)

### InternetExplorer
- Loading: `.viewer-loading`
- Error: `.viewer-error`
- Empty: `.viewer-empty`
- Container: `.viewer-ie-container`
- Iframe: `.viewer-iframe`

### AppHost
- Container: `.apphost-container`
- Loading overlay: `.apphost-loading-overlay`
- Error: `.apphost-error`
- Iframe: `.apphost-iframe` (+ `.apphost-iframe-hidden` для условного скрытия)

## Оставшиеся inline styles

**Нет** - все inline styles удалены из мигрированных файлов.

## Изменения в тестах

Обновлен тест `front/__tests__/fp7/shell.boot.desktop.test.tsx`:
- Заменен поиск по inline style `[style*="008080"]` на поиск по классу `.desktop-background`
- Все 4 теста проходят успешно

## Результаты проверки

### Тесты
```bash
npm run test
```
✅ **Все тесты прошли:** 16 test files, 74 tests passed

### Линтер
```bash
npm run lint
```
⚠️ **Ошибки в других файлах** (не связаны с этой миграцией):
- `MobilePage.tsx` - inline styles (не в scope этого batch)
- `WindowManager.tsx` - inline styles (whitelist для drag overlay)
- `WindowRegistry.tsx` - React Hook warning (не связан с миграцией)
- Test files - TypeScript errors (не связаны с миграцией)

**Viewers компоненты:** ✅ Нет ошибок линтера

## Статистика миграции

- **Удалено inline styles:** ~35 occurrences
- **Создано CSS классов:** 18 классов
- **Обновлено компонентов:** 5 компонентов
- **Обновлено тестов:** 1 тест файл

## Следующие шаги

Следующий batch согласно `MIGRATION_BATCHES.md`:
- **Batch 2:** Simple Components (GameWindow, HelpWindow, LandingWindow)

## Примечания

1. Все классы используют CSS custom properties (CSS variables) из темы для цветов и spacing
2. Общие состояния (loading/error/empty) вынесены в shared классы для переиспользования
3. Условное скрытие iframe реализовано через модификатор класса (`.apphost-iframe-hidden`, `.viewer-iframe-hidden`)
4. Все классы добавлены в `front/src/styles/_components.scss` в секцию "Viewers Component"
