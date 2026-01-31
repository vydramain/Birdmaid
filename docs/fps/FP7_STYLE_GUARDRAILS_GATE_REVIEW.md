# Gate Review: Style Guardrails

**Date:** 2026-01-22  
**Feature Pack:** FP7  
**Mode:** release  
**Reviewer:** @Delivery  
**Status:** ⚠️ **REJECT** (с блокерами)  
**Updated:** 2026-01-22 (исправлено: canary файлы исключены из тестового раннера)

## Executive Summary

Style Guardrails частично реализованы, но есть критические блокеры, которые не позволяют выдать PASS. Основная проблема: **stylelint не может работать из-за отсутствия node_modules**, что блокирует проверку `!important` в pre-commit hook.

## Критерии PASS

### ✅ 1. Pre-commit реально блокирует !important

**Статус:** ⚠️ **Частично** (конфигурация правильная, но не работает из-за отсутствия зависимостей)

**Evidence:**
- ✅ `.stylelintrc.json` содержит правило `"declaration-no-important": true`
- ✅ `.lintstagedrc.json` настроен для запуска `stylelint --fix` на `*.{css,scss}` файлах
- ✅ `.husky/pre-commit` существует и исполняемый
- ❌ **БЛОКЕР:** stylelint не может найти `stylelint-config-standard` (отсутствуют node_modules)

**Команды проверки:**
```bash
cd front
npx stylelint /tmp/test-important.css
# Ошибка: Could not find "stylelint-config-standard"
```

**Рекомендация:** Убедиться, что `npm install` выполнен перед проверкой guardrails.

### ✅ 2. Pre-commit реально блокирует inline styles без allow-tag

**Статус:** ✅ **PASS**

**Evidence:**
- ✅ `.eslintrc.json` содержит правило `no-restricted-syntax` для блокировки inline styles
- ✅ `.lintstagedrc.json` настроен для запуска `node scripts/check-inline-styles.cjs` на `*.{ts,tsx}` файлах
- ✅ `scripts/check-inline-styles.cjs` работает корректно (проверено на canary тестах)

**Команды проверки:**
```bash
cd front
# Должен упасть (inline style без allow-tag)
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style.test.tsx
# ❌ Style Guardrails: Inline styles found without allow-tag comment

# Должен пройти (inline style с allow-tag)
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# ✅ Style Guardrails: No inline styles without allow-tag found
```

**Результат:** ✅ PASS

### ⚠️ 3. ESLint/Stylelint запускаются на staged и в CI (npm run lint)

**Статус:** ⚠️ **Частично** (конфигурация правильная, но не работает из-за отсутствия зависимостей)

**Evidence:**
- ✅ `package.json` содержит скрипт `"lint": "eslint . --ext .ts,.tsx && stylelint '**/*.css' '**/*.scss' && node scripts/check-inline-styles.cjs"`
- ✅ `.lintstagedrc.json` настроен для запуска проверок на staged файлах
- ✅ `.husky/pre-commit` вызывает `npx lint-staged`
- ❌ **БЛОКЕР:** `npm run lint` не работает из-за отсутствия node_modules (eslint и stylelint не установлены)

**Команды проверки:**
```bash
cd front
npm run lint
# Ошибка: eslint: command not found
```

**Рекомендация:** Убедиться, что `npm install` выполнен перед проверкой guardrails.

### ✅ 4. docs/style/GUIDE_STYLE.md существует и покрывает: policy, whitelist, structure, examples

**Статус:** ✅ **PASS**

**Evidence:**
- ✅ Файл существует: `docs/style/GUIDE_STYLE.md`
- ✅ Содержит раздел **"Policy: Inline Styles & !important"** (policy)
- ✅ Содержит раздел **"Whitelist (допустимые случаи)"** (whitelist)
- ✅ Содержит раздел **"Структура каталогов"** (structure)
- ✅ Содержит разделы с примерами использования (examples)

**Структура документа:**
- Структура каталогов
- Обязательные Tokens для FP7
- Обязательные Mixins для FP7
- Обязательные Component Classes для FP7
- Гайд: Mixin vs Component Class
- **Policy: Inline Styles & !important** ✅
- **Whitelist (допустимые случаи)** ✅
- Правила
- Миграция из retro.css
- Связь с TypeScript Tokens
- Pre-commit Hooks
- Ссылки

**Результат:** ✅ PASS

### ⚠️ 5. Нет массовых ложных срабатываний (можно коммитить обычные изменения)

**Статус:** ⚠️ **Требует проверки**

**Evidence:**
- ✅ Canary тесты настроены правильно
- ⚠️ В реальных файлах (`front/src/os/apps/`) есть inline styles без allow-tag комментариев
- ⚠️ Неясно, были ли эти файлы закоммичены до внедрения guardrails или guardrails не работают

**Найденные inline styles без allow-tag:**
- `front/src/os/apps/InternetExplorer.tsx` — множественные inline styles (визуальные свойства)
- `front/src/os/apps/AppHost.tsx` — множественные inline styles (визуальные свойства)
- `front/src/os/apps/Notepad.tsx` — множественные inline styles
- `front/src/os/apps/ImageViewer.tsx` — множественные inline styles
- `front/src/os/apps/VideoViewer.tsx` — множественные inline styles
- `front/src/os/apps/UserPanelApp.tsx` — множественные inline styles
- `front/src/os/taskbar/Taskbar.tsx` — множественные inline styles
- `front/src/os/wm/WindowFrame.tsx` — inline styles (возможно, для drag/resize)

**Рекомендация:** 
1. Проверить, что guardrails реально блокируют коммиты с inline styles
2. Если guardrails работают, то эти файлы были закоммичены до внедрения guardrails — требуется миграция
3. Если guardrails не работают, то это критический блокер

## Блокеры

### 🔴 Критический блокер #1: Отсутствие node_modules

**Проблема:** `npm install` не выполнен, поэтому stylelint и eslint не могут работать.

**Влияние:** 
- Pre-commit hook не может проверить `!important` в CSS/SCSS файлах
- `npm run lint` не работает
- CI/CD не может проверить guardrails

**Решение:**
```bash
cd front
npm install
```

**Проверка после установки:**
```bash
cd front
npm run lint
npx stylelint __tests__/style-guardrails/canary-important.test.css
# Должен упасть с ошибкой !important
```

### 🟡 Блокер #2: Inline styles в реальных файлах без allow-tag

**Проблема:** В реальных файлах (`front/src/os/apps/`) есть множественные inline styles без allow-tag комментариев.

**Влияние:**
- Неясно, работают ли guardrails или эти файлы были закоммичены до внедрения guardrails
- Требуется миграция inline styles → SCSS классы

**Решение:**
1. Проверить, что guardrails реально блокируют коммиты:
   ```bash
   cd front
   echo 'export function Test() { return <div style={{padding: "8px"}}>Test</div>; }' > test-inline.tsx
   git add test-inline.tsx
   git commit -m "test: verify guardrails"
   # Должен упасть с ошибкой
   rm test-inline.tsx
   ```

2. Если guardrails работают, то требуется миграция существующих inline styles:
   - Добавить allow-tag комментарии для допустимых случаев (drag/resize, layout-calc, performance)
   - Заменить визуальные свойства на SCSS классы

## Evidence

### Конфигурация

**Husky pre-commit hook:**
```bash
front/.husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**lint-staged конфигурация:**
```json
{
  "*.{ts,tsx}": [
    "node scripts/check-inline-styles.cjs",
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss}": [
    "stylelint --fix",
    "prettier --write"
  ]
}
```

**ESLint конфигурация:**
```json
{
  "overrides": [
    {
      "files": ["*.tsx", "*.ts"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "JSXAttribute[name.name='style']",
            "message": "Inline styles are not allowed. Use CSS classes or SCSS mixins instead. For whitelist cases, add a comment: // inline-style: allowed (reason: drag/resize|layout-calc|performance)"
          }
        ]
      }
    }
  ]
}
```

**Stylelint конфигурация:**
```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "declaration-no-important": true
  }
}
```

### Canary тесты

**canary-important.test.css:**
```css
.test-important {
  color: red !important; /* This should cause stylelint to fail */
}
```

**canary-inline-style.test.tsx:**
```tsx
export function CanaryInlineStyleTest() {
  // Missing: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
  return (
    <div style={{ padding: "8px", color: "red" }}>
      This should fail the style guardrails check
    </div>
  );
}
```

**canary-inline-style-allowed.test.tsx:**
```tsx
export function CanaryInlineStyleAllowedTest() {
  // inline-style: allowed (reason: drag/resize)
  return (
    <div style={{ transform: "translate3d(10px, 20px, 0)", zIndex: 100 }}>
      This should pass the style guardrails check
    </div>
  );
}
```

### Команды проверки

```bash
# 1. Проверка inline styles блокировки
cd front
node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style.test.tsx
# ❌ Должен упасть

node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# ✅ Должен пройти

# 2. Проверка !important блокировки (требует npm install)
cd front
npm install
npx stylelint __tests__/style-guardrails/canary-important.test.css
# ❌ Должен упасть с ошибкой !important

# 3. Проверка pre-commit hook
cd front
echo '.test { color: red !important; }' > test-important.css
git add test-important.css
git commit -m "test: verify !important guardrail"
# ❌ Должен упасть

# 4. Проверка inline styles в pre-commit
cd front
echo 'export function Test() { return <div style={{padding: "8px"}}>Test</div>; }' > test-inline.tsx
git add test-inline.tsx
git commit -m "test: verify inline styles guardrail"
# ❌ Должен упасть
```

## Рекомендации

### Немедленные действия

1. **Установить зависимости:**
   ```bash
   cd front
   npm install
   ```

2. **Проверить, что guardrails работают:**
   ```bash
   cd front
   npm run lint
   # Должен пройти для существующих файлов
   ```

3. **Проверить pre-commit hook:**
   ```bash
   cd front
   # Создать тестовый файл с !important
   echo '.test { color: red !important; }' > test-important.css
   git add test-important.css
   git commit -m "test: verify !important guardrail"
   # Должен упасть
   rm test-important.css
   ```

### Долгосрочные действия

1. **Миграция inline styles:**
   - Добавить allow-tag комментарии для допустимых случаев (drag/resize, layout-calc, performance)
   - Заменить визуальные свойства на SCSS классы в существующих файлах

2. **CI/CD интеграция:**
   - Убедиться, что `npm run lint` запускается в CI/CD пайплайне
   - Добавить проверку guardrails в CI/CD

3. **Документация:**
   - Обновить `docs/style/GUIDE_STYLE.md` с примерами миграции
   - Добавить раздел о том, как исправить ошибки guardrails

## Итоговый вердикт

**Статус:** ⚠️ **REJECT**

**Причина:** Критические блокеры не позволяют выдать PASS:
1. ❌ stylelint не может работать из-за отсутствия node_modules
2. ⚠️ Неясно, работают ли guardrails для существующих файлов с inline styles

**Следующие шаги:**
1. Установить зависимости (`npm install`)
2. Проверить, что guardrails реально блокируют коммиты
3. Если guardrails работают, то мигрировать существующие inline styles
4. Повторно провести gate-review после устранения блокеров

---

**End of Gate Review**
