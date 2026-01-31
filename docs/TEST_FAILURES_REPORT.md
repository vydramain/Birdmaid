# TEST FAILURES REPORT

**Date:** 2026-01-22  
**Context:** FP7 mode=tests-red-diagnosis  
**Source:** `front/test.log`  
**Total:** 11 failed test files, 38 failed tests, 40 passed tests

---

## 1. Failure Summary Table

| Category | #Failing files | Typical error | Example file(s) |
|----------|----------------|---------------|-----------------|
| **A) Import/Module Resolution** | 6 | `Cannot find module '@/os/apps/registry-init'` | `content.*-opens-*.test.tsx` (5 files) |
| **A) Import/Module Resolution** | 1 | `Failed to resolve import "../../../../src/os/apps/AppRegistry"` | `mobile.boot.test.tsx` |
| **B) Missing alias/path mapping** | 0 | (covered in A) | - |
| **C) Test assumptions broken** | 2 | `Found multiple elements with the text: ...` | `explorer.tree-grid-navigation.test.tsx`, `desktop.icons.from-desktop-only.test.tsx` |
| **D) RBAC/Permissions mismatch** | 1 | `PermissionDenied: Read-only access for Guest/Participant` | `fp6/platform.contracts.test.tsx` |
| **E) Legacy tests (should remove)** | 1 | FP6 contracts (should be removed per CUTLIST) | `fp6/platform.contracts.test.tsx` |
| **F) Runtime errors** | 3 | `ReferenceError`, `AssertionError` | `auth.logout.test.tsx`, `auth.user-panel.test.tsx` |

---

## 2. Root Cause Report

### Category A: Import/Module Resolution (P0 - Blockers)

#### A1: `Cannot find module '@/os/apps/registry-init'`

**Root Cause:**  
Тесты используют `require("@/os/apps/registry-init")` для инициализации, но:
1. Файл существует: `front/src/os/apps/registry-init.tsx`
2. Алиас `@` настроен в `vite.config.ts` и `tsconfig.json`
3. **Проблема:** `require()` в Vitest не резолвит алиасы Vite правильно для `.tsx` файлов

**Affected files:**
- `__tests__/fp7/content.image-opens-viewer.test.tsx` (line 20)
- `__tests__/fp7/content.video-opens-viewer.test.tsx`
- `__tests__/fp7/content.txt-opens-notepad.test.tsx`
- `__tests__/fp7/content.html-opens-ie.test.tsx`
- `__tests__/fp7/content.webapp-opens-executor.test.tsx`

**Error example:**
```
Error: Cannot find module '@/os/apps/registry-init'
Serialized Error: { code: 'MODULE_NOT_FOUND', requireStack: [...] }
```

**Minimal fix:**
- Заменить `require("@/os/apps/registry-init")` на прямой импорт: `import { initApps } from "@/os/apps/registry-init"` и вызвать `initApps()` в `beforeEach`
- ИЛИ использовать относительный путь: `require("../../src/os/apps/registry-init")`
- ИЛИ создать helper в `src/test/utils` для инициализации apps

**Risk:** Низкий — только меняем способ импорта, функциональность не меняется.

**Verification:**
```bash
vitest run __tests__/fp7/content.image-opens-viewer.test.tsx --reporter=verbose
```

---

#### A2: `Failed to resolve import "../../../../src/os/apps/AppRegistry"`

**Root Cause:**  
В `front/apps/mobile/viewers/MobileViewer.tsx` используется неправильный относительный путь:
- Текущий: `import { appRegistry } from "../../../../src/os/apps/AppRegistry";`
- Файл находится: `front/apps/mobile/viewers/MobileViewer.tsx`
- Целевой файл: `front/src/os/apps/AppRegistry.ts`
- **Проблема:** Путь `../../../../src/` неверен — нужно `../../../src/` (3 уровня вверх от `apps/mobile/viewers/`)

**Affected files:**
- `apps/mobile/viewers/MobileViewer.tsx` (line 7)
- Тест: `__tests__/fp7/mobile.boot.test.tsx` (падает из-за этого импорта)

**Error example:**
```
Error: Failed to resolve import "../../../../src/os/apps/AppRegistry" from "apps/mobile/viewers/MobileViewer.tsx". Does the file exist?
```

**Minimal fix:**
- Заменить на алиас: `import { appRegistry } from "@/os/apps/AppRegistry";`
- ИЛИ исправить относительный путь: `import { appRegistry } from "../../../src/os/apps/AppRegistry";`

**Risk:** Низкий — только исправление пути импорта.

**Verification:**
```bash
vitest run __tests__/fp7/mobile.boot.test.tsx --reporter=verbose
```

---

### Category C: Test Assumptions Broken (P2)

#### C1: `Found multiple elements with the text: My Computer`

**Root Cause:**  
Тесты используют `getByText('My Computer')` или `getByText(/My Computer|\//)`, но в DOM есть несколько элементов с таким текстом:
1. В Tree view (Explorer слева)
2. В Toolbar (path display)
3. Возможно в других местах

**Affected files:**
- `__tests__/fp7/explorer.tree-grid-navigation.test.tsx` (lines 36, 47, 91)
- `__tests__/fp7/desktop.icons.from-desktop-only.test.tsx` (multiple)

**Error example:**
```
TestingLibraryElementError: Found multiple elements with the text: /My Computer|\//
Here are the matching elements:
  <span>My Computer</span>
  <div style="...">My Computer</div>
```

**Minimal fix:**
- Использовать `getAllByText()` и выбрать нужный элемент по контексту (within, role, testid)
- ИЛИ добавить `data-testid` в компоненты Explorer для детерминированных селекторов
- ИЛИ использовать `within()` для ограничения области поиска:
  ```typescript
  const treeView = screen.getByRole('tree'); // или другой селектор
  const myComputer = within(treeView).getByText('My Computer');
  ```

**Risk:** Средний — нужно убедиться, что тест проверяет правильный элемент, не ломая контракт.

**Verification:**
```bash
vitest run __tests__/fp7/explorer.tree-grid-navigation.test.tsx --reporter=verbose
```

---

#### C2: `Found multiple elements with the text: Disk C`

**Root Cause:**  
Аналогично C1 — "Disk C" появляется и в Tree view, и в Grid view.

**Affected files:**
- `__tests__/fp7/explorer.tree-grid-navigation.test.tsx` (line 47)
- `__tests__/fp7/desktop.icons.from-desktop-only.test.tsx`

**Minimal fix:**  
То же, что C1 — использовать `within()` или `getAllByText()[index]`.

**Risk:** Средний.

**Verification:**
```bash
vitest run __tests__/fp7/explorer.tree-grid-navigation.test.tsx --reporter=verbose
```

---

### Category D: RBAC/Permissions Mismatch (P3)

#### D1: `PermissionDenied: Read-only access for Guest/Participant`

**Root Cause:**  
FP6 тесты в `beforeEach` вызывают `vfs.mkdir('/desktop')` и `vfs.writeFile('/desktop/test.url', ...)`, но:
1. VFS по умолчанию имеет роль `Guest` (read-only)
2. `vfs.mkdir()` и `vfs.writeFile()` требуют роль `Organizer`
3. Тесты не устанавливают роль перед операциями записи

**Affected files:**
- `__tests__/fp6/platform.contracts.test.tsx` (lines 37-38, 63)

**Error example:**
```
Error: PermissionDenied: Read-only access for Guest/Participant
    at VirtualFileSystem.mkdir (VirtualFileSystem.ts:119)
```

**Minimal fix:**
- Добавить `vfs.setUserRole('Organizer')` в `beforeEach` перед операциями записи:
  ```typescript
  beforeEach(() => {
    // ...
    vfs.setUserRole('Organizer'); // Добавить эту строку
    vfs.mkdir('/desktop');
    vfs.mkdir('/documents');
    // ...
  });
  ```

**Risk:** Низкий — только исправление фикстур, не меняет контракт.

**Verification:**
```bash
vitest run __tests__/fp6/platform.contracts.test.tsx --reporter=verbose
```

**Note:** По CUTLIST, FP6 тесты должны быть удалены, но если их оставляют для истории, нужно исправить.

---

### Category E: Legacy Tests (P4 - Should Remove)

#### E1: FP6 Platform Contracts Tests

**Root Cause:**  
Согласно CUTLIST.md (Section 5), тесты FP6 должны быть удалены:
> **Frontend тесты для react-router:**
> - `front/__tests__/fp6/`
> - **Причина:** Заменяются новыми тестами для shell-only контракта
> - **Действие:** Удалить или переместить в `front/__tests__/legacy/`

**Affected files:**
- `__tests__/fp6/platform.contracts.test.tsx` (7 failed tests)

**Minimal fix:**
- Удалить файл: `front/__tests__/fp6/platform.contracts.test.tsx`
- ИЛИ переместить в `front/__tests__/legacy/fp6/platform.contracts.test.tsx`

**Risk:** Низкий — это legacy тесты, которые не соответствуют FP7 контракту.

**Verification:**
```bash
# После удаления/перемещения:
vitest run --reporter=verbose
# FP6 тесты не должны запускаться
```

---

### Category F: Runtime Errors (P1)

#### F1: `ReferenceError: user is not defined`

**Root Cause:**  
В `auth.logout.test.tsx` строка 130 использует `user.click()`, но переменная `user` не определена. Должно быть `fireEvent.click()`.

**Affected files:**
- `__tests__/fp7/auth.logout.test.tsx` (line 130)

**Error example:**
```
ReferenceError: user is not defined
    at __tests__/fp7/auth.logout.test.tsx:130:26
     129|     const logoutButton = screen.getByText(/Log out/i);
     130|      await user.click(logoutButton);
```

**Minimal fix:**
- Заменить `await user.click(logoutButton)` на `fireEvent.click(logoutButton)`
- ИЛИ импортировать `userEvent` из `@testing-library/user-event` и использовать `await userEvent.click(logoutButton)`

**Risk:** Низкий — просто исправление опечатки.

**Verification:**
```bash
vitest run __tests__/fp7/auth.logout.test.tsx --reporter=verbose
```

---

#### F2: `AssertionError: expected null to be truthy`

**Root Cause:**  
Тесты ищут элементы по неоднозначным селекторам (querySelector с атрибутами), которые не находят элементы:
- `document.querySelector('[title*="logged"]')` — может не найти элемент
- `screen.getByText(/User Information/i)` — может не существовать в DOM

**Affected files:**
- `__tests__/fp7/auth.logout.test.tsx` (lines 40, 75, 96, 111, 134)
- `__tests__/fp7/auth.user-panel.test.tsx` (lines 38, 44, 49, 58, 74, 81, 96)

**Error example:**
```
AssertionError: expected null to be truthy
    at __tests__/fp7/auth.logout.test.tsx:40:9
     39|     await waitFor(() => {
     40|       const userIcon = document.querySelector('[title*="logged"]');
     41|       expect(userIcon).toBeTruthy();
```

**Minimal fix:**
- Использовать более надежные селекторы:
  - Добавить `data-testid="user-icon"` в компонент Taskbar Tray
  - Использовать `screen.getByTestId('user-icon')`
  - ИЛИ использовать `screen.getByRole('button', { name: /user/i })` если это кнопка
- Проверить, что User Panel действительно рендерится с текстом "User Information" или другим ожидаемым текстом

**Risk:** Средний — нужно проверить реальную структуру DOM компонентов Taskbar и UserPanel.

**Verification:**
```bash
vitest run __tests__/fp7/auth.logout.test.tsx __tests__/fp7/auth.user-panel.test.tsx --reporter=verbose
```

---

## 3. Fix Plan (Ordered)

### P0: Blockers (Import/Module Resolution)

1. **Fix A1: registry-init import**
   - **Files:** `__tests__/fp7/content.*-opens-*.test.tsx` (5 files)
   - **Action:** Заменить `require("@/os/apps/registry-init")` на `import { initApps } from "@/os/apps/registry-init"` и вызвать `initApps()` в `beforeEach`
   - **Commits:** `fix: use import instead of require for registry-init in content tests`

2. **Fix A2: MobileViewer import path**
   - **Files:** `apps/mobile/viewers/MobileViewer.tsx`
   - **Action:** Заменить `import { appRegistry } from "../../../../src/os/apps/AppRegistry"` на `import { appRegistry } from "@/os/apps/AppRegistry"`
   - **Commits:** `fix: correct AppRegistry import path in MobileViewer.tsx`

### P1: Mass Failures (Runtime Errors)

3. **Fix F1: ReferenceError in auth.logout.test.tsx**
   - **Files:** `__tests__/fp7/auth.logout.test.tsx`
   - **Action:** Заменить `await user.click()` на `fireEvent.click()` или импортировать `userEvent`
   - **Commits:** `fix: replace undefined user.click with fireEvent.click in auth.logout.test.tsx`

4. **Fix F2: AssertionError in auth tests**
   - **Files:** `__tests__/fp7/auth.logout.test.tsx`, `__tests__/fp7/auth.user-panel.test.tsx`
   - **Action:** Добавить `data-testid` в Taskbar Tray User Icon и UserPanel, использовать `getByTestId()` или более надежные селекторы
   - **Commits:** `test: add data-testid to User Icon and UserPanel for deterministic selectors`

### P2: Flaky/Ambiguous Selectors

5. **Fix C1/C2: Multiple elements in Explorer tests**
   - **Files:** `__tests__/fp7/explorer.tree-grid-navigation.test.tsx`, `__tests__/fp7/desktop.icons.from-desktop-only.test.tsx`
   - **Action:** Использовать `within()` для ограничения области поиска или `getAllByText()[index]`
   - **Commits:** `test: use within() for deterministic selectors in Explorer tests`

### P3: RBAC Fixtures

6. **Fix D1: PermissionDenied in FP6 tests**
   - **Files:** `__tests__/fp6/platform.contracts.test.tsx`
   - **Action:** Добавить `vfs.setUserRole('Organizer')` в `beforeEach` перед операциями записи
   - **Commits:** `fix: set Organizer role in FP6 tests before VFS write operations`
   - **Note:** Если FP6 тесты удаляются (P4), этот фикс не нужен.

### P4: Legacy Tests Removal

7. **Remove E1: FP6 Platform Contracts Tests**
   - **Files:** `__tests__/fp6/platform.contracts.test.tsx`
   - **Action:** Удалить файл или переместить в `__tests__/legacy/fp6/`
   - **Commits:** `chore: remove FP6 platform contracts tests (replaced by FP7 shell-only tests)`
   - **Verification:** Проверить CUTLIST.md — FP6 тесты должны быть удалены.

---

## 4. PR Checklist

### Atomic Commits (in order)

1. ✅ `fix: use import instead of require for registry-init in content tests`
   - Files: `__tests__/fp7/content.*-opens-*.test.tsx` (5 files)
   - Fixes: A1

2. ✅ `fix: correct AppRegistry import path in MobileViewer.tsx`
   - Files: `apps/mobile/viewers/MobileViewer.tsx`
   - Fixes: A2

3. ✅ `fix: replace undefined user.click with fireEvent.click in auth.logout.test.tsx`
   - Files: `__tests__/fp7/auth.logout.test.tsx`
   - Fixes: F1

4. ✅ `test: add data-testid to User Icon and UserPanel for deterministic selectors`
   - Files: `__tests__/fp7/auth.logout.test.tsx`, `__tests__/fp7/auth.user-panel.test.tsx`, компоненты Taskbar/UserPanel
   - Fixes: F2

5. ✅ `test: use within() for deterministic selectors in Explorer tests`
   - Files: `__tests__/fp7/explorer.tree-grid-navigation.test.tsx`, `__tests__/fp7/desktop.icons.from-desktop-only.test.tsx`
   - Fixes: C1, C2

6. ✅ `chore: remove FP6 platform contracts tests (replaced by FP7 shell-only tests)`
   - Files: `__tests__/fp6/platform.contracts.test.tsx`
   - Fixes: E1 (и D1, если удаляем)

7. ⚠️ `fix: set Organizer role in FP6 tests before VFS write operations` (только если FP6 тесты НЕ удаляются)
   - Files: `__tests__/fp6/platform.contracts.test.tsx`
   - Fixes: D1

---

## 5. Verification Commands

После каждого фикса проверить:

```bash
# P0: Import fixes
vitest run __tests__/fp7/content.image-opens-viewer.test.tsx --reporter=verbose
vitest run __tests__/fp7/mobile.boot.test.tsx --reporter=verbose

# P1: Runtime errors
vitest run __tests__/fp7/auth.logout.test.tsx --reporter=verbose
vitest run __tests__/fp7/auth.user-panel.test.tsx --reporter=verbose

# P2: Selectors
vitest run __tests__/fp7/explorer.tree-grid-navigation.test.tsx --reporter=verbose
vitest run __tests__/fp7/desktop.icons.from-desktop-only.test.tsx --reporter=verbose

# P3: RBAC (если FP6 не удаляется)
vitest run __tests__/fp6/platform.contracts.test.tsx --reporter=verbose

# Full suite
vitest run --reporter=verbose
```

---

## 6. Summary

**Total issues:** 11 failing test files, 38 failed tests

**By priority:**
- **P0 (Blockers):** 2 issues (A1, A2) — 6 test files
- **P1 (Mass failures):** 2 issues (F1, F2) — 2 test files
- **P2 (Flaky):** 2 issues (C1, C2) — 2 test files
- **P3 (RBAC):** 1 issue (D1) — 1 test file (может быть удален)
- **P4 (Legacy):** 1 issue (E1) — 1 test file (должен быть удален)

**Estimated fixes:**
- P0: ~30 минут (импорты)
- P1: ~1 час (селекторы + data-testid)
- P2: ~30 минут (within() селекторы)
- P3: ~5 минут (добавить setUserRole)
- P4: ~1 минута (удалить файл)

**Total estimated time:** ~2 часа

---

**End of TEST_FAILURES_REPORT**
