# Style System Refactor - Gate Report

**Date:** 2026-01-22  
**Feature Pack:** FP7  
**Subproject:** style-system-refactor  
**Gate Type:** Final Release Gate  
**Status:** ❌ **REJECT**

---

## Executive Summary

Проведена финальная проверка gate для style-system-refactor. Результат: **REJECT** из-за невыполнения критических условий PASS.

### Основные проблемы:
1. ❌ **INLINE_STYLES_INVENTORY.md не пуст** - содержит 281 occurrence inline styles (требуется 0 кроме whitelist)
2. ❌ **Whitelist не соответствует требованиям** - Win95Modal.tsx не имеет allow-tag для drag/resize inline styles
3. ❌ **npm run lint не зелёный** - 280 проблем (268 errors, 12 warnings)
4. ✅ **npm run test зелёный** - 74 теста прошли
5. ✅ **Темы реализованы** - 2 темы (win95-default, win95-high-contrast) с переключением
6. ✅ **Документация актуальна** - GUIDE_STYLE.md и THEME_CONTRACT.md актуальны

---

## Детальная проверка условий PASS

### 1. INLINE_STYLES_INVENTORY.md пуст (0 inline styles) кроме whitelist

**Статус:** ❌ **FAIL**

**Доказательства:**
```bash
$ wc -l front/INLINE_STYLES_INVENTORY.md
433 INLINE_STYLES_INVENTORY.md
```

**Детали:**
- Файл содержит 433 строки
- **Total Files with Inline Styles:** 25
- **Total Inline Style Occurrences:** ~281
- Файл не пуст и содержит обширный инвентарь inline styles

**Требование:** INLINE_STYLES_INVENTORY.md должен быть пуст (0 inline styles) кроме whitelist списка.

**Вывод:** Условие не выполнено. Файл содержит 281 occurrence inline styles, что значительно превышает допустимый whitelist.

---

### 2. Whitelist строго ограничен drag/resize geometry и содержит allow-tag в коде

**Статус:** ❌ **FAIL**

**Доказательства:**

#### Найденные allow-tag комментарии:
```bash
$ grep -r "inline-style: allowed" front/src
front/src/components/ExplorerWindow.tsx:34:        // inline-style: allowed (reason: layout-calc - computed paddingLeft via CSS variable)
front/src/os/taskbar/Taskbar.tsx:44:        // inline-style: allowed (reason: layout-calc)
front/src/os/wm/WindowManager.tsx:20:            // inline-style: allowed (reason: drag/resize)
front/src/os/wm/WindowFrame.tsx:72:        // inline-style: allowed (reason: drag/resize)
front/src/components/Header.tsx:16:          // inline-style: allowed (reason: layout-calc)
front/src/components/Header.tsx:34:                    // inline-style: allowed (reason: layout-calc)
front/src/components/DesktopIcon.tsx:29:          // inline-style: allowed (reason: layout-calc)
```

#### Проблемные случаи без allow-tag:

**Win95Modal.tsx (drag/resize без allow-tag):**
```typescript
// Строки 115-120: drag/resize positioning БЕЗ allow-tag
style={{
  position: "absolute",
  left: `${position.x}px`,  // ❌ Нет allow-tag
  top: `${position.y}px`,   // ❌ Нет allow-tag
  ...modalStyles,
}}

// Строка 126: cursor для drag БЕЗ allow-tag
style={{ cursor: isDragging ? "grabbing" : "grab" }}  // ❌ Нет allow-tag

// Строка 138: contentStyles spread БЕЗ allow-tag
<div className="content" style={contentStyles}>  // ❌ Нет allow-tag
```

**WindowFrame.tsx (дополнительные inline styles без allow-tag):**
```typescript
// Строки 71-77: есть allow-tag для transform, но width и boxShadow без allow-tag
style={{
  // inline-style: allowed (reason: drag/resize)
  transform: `translate3d(${state.x}px, ${state.y}px, 0)`,  // ✅ Есть allow-tag
  zIndex: state.zIndex,  // ❌ Нет allow-tag (не drag/resize)
  width: state.width,    // ❌ Нет allow-tag (не drag/resize)
  boxShadow: state.zIndex > 10 ? "4px 4px 10px rgba(0,0,0,0.5)" : undefined,  // ❌ Нет allow-tag
}}
```

**Требование:** Whitelist строго ограничен drag/resize geometry и содержит allow-tag в коде.

**Вывод:** Условие не выполнено. Win95Modal.tsx использует drag/resize inline styles без allow-tag комментариев. WindowFrame.tsx имеет дополнительные inline styles (width, boxShadow, zIndex) без allow-tag.

---

### 3. Темы переключаются (минимум 2) и реально меняют tokens

**Статус:** ✅ **PASS**

**Доказательства:**

#### Реализованные темы:
1. **win95-default** (`front/src/styles/themes/_win95-default.scss`)
   - Chicago95 palette
   - Все обязательные токены определены
   - CSS custom properties через `:root[data-theme="win95-default"]`

2. **win95-high-contrast** (`front/src/styles/themes/_win95-high-contrast.scss`)
   - High contrast palette (accessibility)
   - Все обязательные токены определены
   - CSS custom properties через `:root[data-theme="win95-high-contrast"]`

#### Theme switching API:
```typescript
// front/src/utils/theme.ts
export function setTheme(theme: Theme | 'default') {
  const root = document.documentElement;
  if (theme === 'default') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
```

#### Различия в токенах между темами:

**win95-default:**
```scss
--win-gray: #c0c0c0;
--win-gray-dark: #808080;
--win-teal: #008080;
```

**win95-high-contrast:**
```scss
--win-gray: #ffffff;  // Белый фон вместо серого
--win-gray-dark: #000000;  // Чистый чёрный для границ
--win-teal: #00ffff;  // Яркий cyan вместо teal
```

**Требование:** Темы переключаются (минимум 2) и реально меняют tokens.

**Вывод:** Условие выполнено. Реализованы 2 темы с переключением через data-attribute и реальными различиями в токенах.

---

### 4. npm run test зелёный

**Статус:** ✅ **PASS**

**Доказательства:**
```bash
$ cd front && npm run test

Test Files  16 passed (16)
     Tests  74 passed (74)
  Start at  02:13:53
  Duration  2.71s
```

**Требование:** npm run test зелёный.

**Вывод:** Условие выполнено. Все 74 теста прошли успешно.

---

### 5. npm run lint зелёный

**Статус:** ❌ **FAIL**

**Доказательства:**
```bash
$ cd front && npm run lint

✖ 280 problems (268 errors, 12 warnings)
```

**Основные категории ошибок:**

1. **Inline styles без allow-tag (большинство ошибок):**
   - `front/src/components/win95/Win95Modal.tsx` - 4 ошибки
   - `front/src/os/wm/WindowFrame.tsx` - 1 ошибка
   - `front/src/legacy/pages.tsx` - множество ошибок
   - `front/apps/mobile/**` - множество ошибок
   - И другие файлы

2. **TypeScript/ESLint ошибки:**
   - `'React' is not defined` - несколько файлов
   - `'RequestInit' is not defined` - несколько файлов
   - React hooks warnings (exhaustive-deps)

**Примеры ошибок:**
```
/data/fst/Repositories/vydramain/Birdmaid/front/src/components/win95/Win95Modal.tsx
  94:7   error  Inline styles are not allowed...
  115:9   error  Inline styles are not allowed...
  126:11  error  Inline styles are not allowed...
  138:34  error  Inline styles are not allowed...

/data/fst/Repositories/vydramain/Birdmaid/front/src/os/wm/WindowFrame.tsx
  71:7   error  Inline styles are not allowed...
```

**Требование:** npm run lint зелёный.

**Вывод:** Условие не выполнено. Линтер обнаружил 280 проблем (268 errors, 12 warnings), в основном связанных с inline styles без allow-tag.

---

### 6. docs/style/GUIDE_STYLE.md + THEME_CONTRACT.md актуальны

**Статус:** ✅ **PASS**

**Доказательства:**

#### GUIDE_STYLE.md:
- ✅ Версия: 1.0, обновлён: 2026-01-22
- ✅ Содержит правила для inline styles и whitelist
- ✅ Описывает структуру themes/
- ✅ Содержит правила для allow-tag комментариев
- ✅ Описывает theme switching механизм
- ✅ Содержит ссылки на THEME_CONTRACT.md

#### THEME_CONTRACT.md:
- ✅ Версия: 1.0, создан: 2026-01-22
- ✅ Описывает theme system через CSS custom properties
- ✅ Содержит список обязательных токенов
- ✅ Описывает theme switching API
- ✅ Содержит примеры использования

**Требование:** docs/style/GUIDE_STYLE.md + THEME_CONTRACT.md актуальны.

**Вывод:** Условие выполнено. Оба документа актуальны и содержат полную информацию о style system и theme contract.

---

## Сводная таблица проверок

| Условие | Статус | Детали |
|---------|--------|--------|
| INLINE_STYLES_INVENTORY.md пуст (0 кроме whitelist) | ❌ FAIL | 281 occurrence inline styles |
| Whitelist строго ограничен drag/resize + allow-tag | ❌ FAIL | Win95Modal.tsx без allow-tag для drag/resize |
| Темы переключаются (минимум 2) и меняют tokens | ✅ PASS | 2 темы реализованы с различиями |
| npm run test зелёный | ✅ PASS | 74 теста прошли |
| npm run lint зелёный | ❌ FAIL | 280 проблем (268 errors, 12 warnings) |
| Документация актуальна | ✅ PASS | GUIDE_STYLE.md и THEME_CONTRACT.md актуальны |

**Итого:** 3 из 6 условий выполнены (50%)

---

## Рекомендации для исправления

### Критические (для PASS):

1. **Очистить INLINE_STYLES_INVENTORY.md:**
   - Мигрировать все inline styles (кроме whitelist) в SCSS классы
   - Оставить только whitelist список с allow-tag комментариями
   - Цель: 0 inline styles кроме whitelist

2. **Добавить allow-tag для Win95Modal.tsx:**
   ```typescript
   // front/src/components/win95/Win95Modal.tsx
   style={{
     // inline-style: allowed (reason: drag/resize)
     position: "absolute",
     left: `${position.x}px`,
     top: `${position.y}px`,
     ...modalStyles,
   }}
   
   style={{
     // inline-style: allowed (reason: drag/resize)
     cursor: isDragging ? "grabbing" : "grab"
   }}
   ```

3. **Исправить WindowFrame.tsx:**
   - Добавить allow-tag для width (если это resize) или мигрировать в класс
   - Мигрировать boxShadow в класс
   - Мигрировать zIndex в класс (или добавить allow-tag если это динамическое значение)

4. **Исправить все ошибки линтера:**
   - Добавить allow-tag для всех whitelist случаев
   - Мигрировать остальные inline styles в SCSS классы
   - Исправить TypeScript/ESLint ошибки (React, RequestInit)

### Некритические (улучшения):

1. **Добавить тесты для theme switching:**
   - Проверить, что темы реально переключаются
   - Проверить, что токены меняются

2. **Обновить INLINE_STYLES_INVENTORY.md:**
   - После миграции обновить файл с финальным whitelist списком

---

## Команды для проверки

```bash
# Проверка тестов
cd front && npm run test

# Проверка линтера
cd front && npm run lint

# Проверка количества inline styles
cd front && wc -l INLINE_STYLES_INVENTORY.md

# Поиск allow-tag комментариев
cd front && grep -r "inline-style: allowed" src/

# Проверка тем
cd front && ls -la src/styles/themes/
```

---

## Заключение

**Статус Gate:** ❌ **REJECT**

**Причина:** Не выполнены критические условия PASS:
1. INLINE_STYLES_INVENTORY.md не пуст (281 occurrence)
2. Whitelist не соответствует требованиям (Win95Modal.tsx без allow-tag)
3. npm run lint не зелёный (280 проблем)

**Следующие шаги:**
1. Мигрировать inline styles в SCSS классы
2. Добавить allow-tag для всех whitelist случаев
3. Исправить все ошибки линтера
4. Повторить gate после исправлений

---

**Проверено:** @Delivery  
**Дата:** 2026-01-22
