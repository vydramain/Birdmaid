# TEST_FAILURE_PATTERNS.md

## Failure Catalog

| Category | Symptom (error msg) | #Occurrences | Representative test file | Root cause hypothesis |
|----------|---------------------|-------------|-------------------------|----------------------|
| **G** | `PermissionDenied: Read-only access for Guest/Participant` | 2 | `content.txt-opens-notepad.test.tsx` | Тест устанавливает Guest роль, но пытается писать в VFS через `vfs.writeFile()` |
| **A** | `Found multiple elements with the text: /My Computer\|Explorer/` | 2 | `desktop.icons.from-desktop-only.test.tsx` | Использование regex `/A\|B/` для поиска одного элемента, когда есть несколько |
| **C** | `expected null to be truthy` (token check) | 1 | `auth.logout.test.tsx` | Неправильный селектор для userIcon (использует `document.querySelector` вместо `screen.getByTestId`) |
| **C** | `expected <div>... to be falsy` (window close) | 1 | `auth.user-panel.test.tsx` | Окно не закрывается после клика на close button, возможно проблема с async timing |
| **D** | `Failed to resolve import "../../../../src/api/client"` | 5+ | `mobile.boot.test.tsx`, `apps/mobile/viewers/*.tsx` | Неправильные импорты (относительные пути вместо alias `@/`) |
| **H** | `TypeError: URL.createObjectURL is not a function` | 3+ | `content.image-opens-viewer.test.tsx`, `content.video-opens-viewer.test.tsx`, `content.html-opens-ie.test.tsx` | jsdom не поддерживает `URL.createObjectURL`, нужно мокировать в test setup |
| **C** | `expected null to be truthy` (video element) | 1 | `content.video-opens-viewer.test.tsx` | Тест ищет `queryByTitle("test.mp4")`, но video элемент не имеет title атрибута |
| **C** | `expected null to be truthy` (viewer content) | 1 | `mobile.boot.test.tsx` | `vfs.readFile()` возвращает только контент, а не VFSNode; нужно использовать `vfs.stat()` |

## Pattern Fix Rules

### A) Ambiguous selectors / wrong scope
- **Rule 1**: Запрещено использовать regex вида `/A\|B/` для поиска одного элемента
- **Rule 2**: Использовать `within(container).getByText(...)` для scoped поиска
- **Rule 3**: Если нужно проверить наличие любого из нескольких элементов, использовать `getAllByText` и проверять длину
- **Rule 4**: Для системных элементов shell использовать стабильные `data-testid`

### C) Async timing / state update
- **Rule 1**: Использовать `screen.getByTestId` вместо `document.querySelector` для стабильности
- **Rule 2**: Ждать observable UI state (окно закрыто = `queryByTestId` возвращает `null`)
- **Rule 3**: Использовать `waitFor` с правильными проверками состояния
- **Rule 4**: Для video элементов использовать `getByRole('video')` или `querySelector('video')` вместо `queryByTitle`
- **Rule 5**: Использовать `fireEvent` для простых кликов (если `userEvent` недоступен)

### D) Import/alias/module resolution
- **Rule 1**: Использовать alias `@/` вместо относительных путей `../../..`
- **Rule 2**: Проверить, что все необходимые провайдеры включены
- **Rule 3**: В тестах только ESM import, никаких `require(...)`

### G) RBAC fixtures mismatch
- **Rule 1**: Перед операциями записи в VFS устанавливать роль `Organizer`
- **Rule 2**: После записи можно вернуть роль обратно, если нужно тестировать read-only поведение

### H) Browser API missing (NEW)
- **Rule 1**: Мокировать `URL.createObjectURL` и `URL.revokeObjectURL` в test setup
- **Rule 2**: Возвращать стабильный URL (например, `blob:test://...`)

### I) VFS API misuse (NEW)
- **Rule 1**: `vfs.readFile(path)` возвращает `string | Blob | undefined`, а не `VFSNode`
- **Rule 2**: Для получения VFSNode использовать `vfs.stat(path)`
- **Rule 3**: Проверять, что node существует и имеет правильный тип (`node.type === 'file'`)

## Applied Fixes

### Fix G-1: RBAC fixtures in content.txt-opens-notepad.test.tsx ✅
- **Problem**: Тест устанавливает Guest роль, но пытается писать в VFS
- **Solution**: Установить роль Organizer перед `vfs.writeFile()`, затем вернуть Guest для тестирования read-only поведения
- **Status**: FIXED

### Fix A-1: Ambiguous selector in desktop.icons.from-desktop-only.test.tsx ✅
- **Problem**: Regex `/My Computer|Explorer/` находит несколько элементов
- **Solution**: Проверять каждый элемент отдельно через `within(container).getByText('My Computer')` и `within(container).getByText('Explorer')`
- **Status**: FIXED

### Fix C-1: Wrong selector in auth.logout.test.tsx ✅
- **Problem**: Используется `document.querySelector('[title*="logged"]')` вместо `screen.getByTestId`
- **Solution**: Заменить на `screen.getByTestId("tray-user-icon")`
- **Status**: FIXED

### Fix C-2: Window close timing in auth.user-panel.test.tsx ✅
- **Problem**: Несколько окон с кнопками "Close window" (User Panel + Landing), ambiguous selector
- **Solution**: Использовать scoped поиск - найти окно User Panel через `getByTestId("user-panel-window")`, затем найти close button внутри этого окна через `within(userPanel).getByRole('button', { name: /close window/i })`
- **Status**: FIXED

### Fix D-1: Import paths in mobile app files ✅
- **Problem**: Относительные пути `../../../../src/...` вместо alias `@/`
- **Solution**: Заменить все импорты в `apps/mobile/viewers/*.tsx`, `apps/mobile/MobileApp.tsx`, `apps/mobile/main-mobile.tsx` на `@/` alias
- **Status**: FIXED

### Fix H-1: URL.createObjectURL mock ✅
- **Problem**: jsdom не поддерживает `URL.createObjectURL`
- **Solution**: Добавить мок в `src/test/setup.ts`
- **Status**: FIXED

### Fix C-3: Video element selector in content.video-opens-viewer.test.tsx ✅
- **Problem**: Тест ищет `queryByTitle("test.mp4")`, но video элемент не имеет title атрибута
- **Solution**: Использовать `screen.queryByRole('video')` или `document.querySelector('video')` для поиска video элемента
- **Status**: FIXED

### Fix I-1: VFS API misuse in MobileApp.tsx ✅
- **Problem**: `vfs.readFile(path)` возвращает только контент, а не VFSNode; MobileViewer ожидает VFSNode
- **Solution**: Заменить `vfs.readFile(path)` на `vfs.stat(path)` и проверить `node.type === 'file'`
- **Status**: FIXED

## Final Status

### ✅ ALL TESTS PASSING

**Test Files**: 16 passed (16) ✅
**Tests**: 74 passed (74) ✅

### Test Files Status
- ✅ `taskbar.tray.test.tsx` - 5/5 tests passing
- ✅ `auth.user-panel.test.tsx` - 5/5 tests passing  
- ✅ `auth.logout.test.tsx` - 3/3 tests passing
- ✅ `mobile.boot.test.tsx` - 3/3 tests passing
- ✅ `content.video-opens-viewer.test.tsx` - 4/4 tests passing
- ✅ All other test files passing

**Total: 74/74 tests passing** ✅

## Success Criteria Met ✅

All tests are green:
- ✅ tray renders
- ✅ clock stable format (HH:MM:SS)
- ✅ user panel opens/closes
- ✅ logout clears token
- ✅ mobile app boot and content opening
- ✅ video viewer rendering
- ✅ All other features tested

## Categories Summary

| Category | Description | Fixes Applied |
|----------|-------------|---------------|
| **A** | Ambiguous selectors / wrong scope | 1 fix |
| **C** | Async timing / state update | 3 fixes |
| **D** | Import/alias/module resolution | 1 fix |
| **G** | RBAC fixtures mismatch | 1 fix |
| **H** | Browser API missing | 1 fix |
| **I** | VFS API misuse | 1 fix |

**Total: 8 pattern fixes applied**
