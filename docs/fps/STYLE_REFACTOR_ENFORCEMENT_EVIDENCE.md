# Style System Refactor - Enforcement Evidence

**Date:** 2026-01-22  
**Feature Pack:** FP7  
**Subproject:** style-system-refactor  
**Task:** Усиление enforcement для предотвращения регрессии inline styles  
**Status:** ✅ **COMPLETED**

---

## Executive Summary

Усилено enforcement для предотвращения возврата inline styles после миграции. Все проверки работают корректно и блокируют нарушения в pre-commit hook.

---

## Изменения в Enforcement

### 1. ESLint Configuration

**Проблема:** ESLint блокировал ВСЕ inline styles, даже с allow-tag комментариями, что конфликтовало со скриптом `check-inline-styles.cjs`, который правильно проверяет allow-tag.

**Решение:** Убрана блокировка inline styles из ESLint. Проверка inline styles теперь выполняется только через скрипт `check-inline-styles.cjs`, который правильно обрабатывает allow-tag комментарии.

**Файл:** `front/.eslintrc.json`

**До:**
```json
"overrides": [
  {
    "files": ["*.tsx", "*.ts"],
    "rules": {
      "no-restricted-syntax": [
        "error",
        {
          "selector": "JSXAttribute[name.name='style']",
          "message": "Inline styles are not allowed..."
        }
      ]
    }
  }
]
```

**После:**
```json
"overrides": [
  {
    "files": ["*.tsx", "*.ts"],
    "rules": {
      "no-restricted-syntax": "off"
    }
  }
]
```

**Доказательство:**
```bash
$ cd front && npx eslint __tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# ✅ Теперь проходит (ранее блокировался)
```

---

### 2. Stylelint Configuration

**Проблема:** Stylelint игнорировал `__tests__/**`, что не позволяло проверять canary тесты для `!important`.

**Решение:** Изменён `ignoreFiles` для исключения только тестовых файлов (`.test.{ts,tsx,js,jsx}`), но не CSS файлов в `__tests__/`.

**Файл:** `front/.stylelintrc.json`

**До:**
```json
"ignoreFiles": [
  "**/*.js",
  "**/*.jsx",
  "**/*.ts",
  "**/*.tsx",
  "node_modules/**",
  "dist/**",
  "coverage/**",
  "__tests__/**"  // ❌ Игнорировал все файлы в __tests__/
]
```

**После:**
```json
"ignoreFiles": [
  "**/*.js",
  "**/*.jsx",
  "**/*.ts",
  "**/*.tsx",
  "node_modules/**",
  "dist/**",
  "coverage/**",
  "__tests__/**/*.test.{ts,tsx,js,jsx}"  // ✅ Игнорирует только тестовые файлы
]
```

**Доказательство:**
```bash
$ cd front && npx stylelint __tests__/style-guardrails/canary-important.test.css

__tests__/style-guardrails/canary-important.test.css
 2:1   ✖  Expected empty line before comment  comment-empty-line-before
 5:14  ✖  Unexpected !important               declaration-no-important

2 problems (2 errors, 0 warnings)
# ✅ Теперь правильно блокирует !important
```

---

### 3. Lint-Staged Configuration

**Изменения:**
- Добавлен `--max-warnings=0` для ESLint и Stylelint
- Синхронизирована конфигурация между `package.json` и `.lintstagedrc.json`

**Файл:** `front/.lintstagedrc.json`

**После:**
```json
{
  "*.{ts,tsx}": [
    "node scripts/check-inline-styles.cjs",
    "eslint --max-warnings=0 --fix",
    "prettier --write"
  ],
  "*.{css,scss}": [
    "stylelint --max-warnings=0 --fix",
    "prettier --write"
  ]
}
```

**Доказательство:**
- Pre-commit hook теперь блокирует коммиты с предупреждениями
- Все проверки выполняются последовательно

---

### 4. Pre-Commit Hook Enhancement

**Изменения:**
- Добавлены информативные сообщения об ошибках
- Добавлены подсказки по исправлению проблем
- Улучшена читаемость вывода

**Файл:** `front/.husky/pre-commit`

**После:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Get git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
FRONT_DIR="$GIT_ROOT/front"

cd "$GIT_ROOT" 2>/dev/null || exit 1
cd "$FRONT_DIR" || exit 1

echo "🔍 Running style guardrails checks..."

# Run lint-staged (includes inline styles check, eslint, stylelint)
npx lint-staged

# Exit code from lint-staged
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Style guardrails check failed!"
  echo ""
  echo "Common issues:"
  echo "  - Inline styles without allow-tag: Add // inline-style: allowed (reason: drag/resize|layout-calc|performance)"
  echo "  - !important in CSS/SCSS: Remove !important, use proper CSS specificity"
  echo ""
  echo "See docs/style/GUIDE_STYLE.md for details."
  exit $EXIT_CODE
fi

echo "✅ Style guardrails check passed"
exit 0
```

**Доказательство:**
```bash
$ git add test-inline.tsx
$ git commit -m "test: inline style without allow-tag"

🔍 Running style guardrails checks...

❌ Style guardrails: Inline styles found without allow-tag comment:

  front/test-inline.tsx:12
    Inline style found without allow-tag comment. Add: // inline-style: allowed (reason: drag/resize|layout-calc|performance)

  Allowed reasons: drag/resize, layout-calc, performance

❌ Style guardrails check failed!

Common issues:
  - Inline styles without allow-tag: Add // inline-style: allowed (reason: drag/resize|layout-calc|performance)
  - !important in CSS/SCSS: Remove !important, use proper CSS specificity

See docs/style/GUIDE_STYLE.md for details.
# ✅ Коммит заблокирован
```

---

### 5. CI Canary Tests

**Добавлены команды для проверки canary тестов в CI:**

**Файл:** `front/package.json`

**Новые команды:**
```json
"lint:canary": "node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style.test.tsx && npx stylelint __tests__/style-guardrails/canary-important.test.css",
"lint:canary:should-fail": "node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style.test.tsx 2>&1 | grep -q 'Inline style found' && echo '✅ Canary inline-style test correctly fails' || (echo '❌ Canary inline-style test should fail but passed' && exit 1)",
"lint:canary:should-pass": "node scripts/check-inline-styles.cjs __tests__/style-guardrails/canary-inline-style-allowed.test.tsx 2>&1 | grep -q 'No inline styles' && echo '✅ Canary inline-style-allowed test correctly passes' || (echo '❌ Canary inline-style-allowed test should pass but failed' && exit 1)",
"test:canary": "npm run lint:canary:should-fail && npm run lint:canary:should-pass && npx stylelint __tests__/style-guardrails/canary-important.test.css 2>&1 | grep -q 'Unexpected !important' && echo '✅ Canary !important test correctly fails' || (echo '❌ Canary !important test should fail but passed' && exit 1)"
```

**Доказательство:**
```bash
$ cd front && npm run lint:canary:should-fail
✅ Canary inline-style test correctly fails

$ cd front && npm run lint:canary:should-pass
✅ Canary inline-style-allowed test correctly passes

$ cd front && npm run test:canary
✅ Canary inline-style test correctly fails
✅ Canary inline-style-allowed test correctly passes
✅ Canary !important test correctly fails
```

---

## Проверка Enforcement

### Тест 1: Inline Style без allow-tag (должен блокироваться)

**Команда:**
```bash
$ cd front
$ echo 'export function Test() { return <div style={{padding: "8px"}}>Test</div>; }' > test-inline.tsx
$ git add test-inline.tsx
$ git commit -m "test: inline style without allow-tag"
```

**Результат:**
```
🔍 Running style guardrails checks...

❌ Style guardrails: Inline styles found without allow-tag comment:

  front/test-inline.tsx:1
    Inline style found without allow-tag comment. Add: // inline-style: allowed (reason: drag/resize|layout-calc|performance)

  Allowed reasons: drag/resize, layout-calc, performance

❌ Style guardrails check failed!
```

**Статус:** ✅ **БЛОКИРУЕТСЯ**

---

### Тест 2: Inline Style с allow-tag (должен проходить)

**Команда:**
```bash
$ cd front
$ echo '// inline-style: allowed (reason: drag/resize)
export function Test() { return <div style={{transform: "translate3d(10px, 20px, 0)"}}>Test</div>; }' > test-inline-allowed.tsx
$ git add test-inline-allowed.tsx
$ git commit -m "test: inline style with allow-tag"
```

**Результат:**
```
🔍 Running style guardrails checks...

✅ Style Guardrails: No inline styles without allow-tag found
✅ Style guardrails check passed
```

**Статус:** ✅ **ПРОХОДИТ**

---

### Тест 3: !important в CSS (должен блокироваться)

**Команда:**
```bash
$ cd front
$ echo '.test { color: red !important; }' > test-important.css
$ git add test-important.css
$ git commit -m "test: !important in CSS"
```

**Результат:**
```
🔍 Running style guardrails checks...

test-important.css
 1:14  ✖  Unexpected !important               declaration-no-important

1 problem (1 error, 0 warnings)
```

**Статус:** ✅ **БЛОКИРУЕТСЯ**

---

### Тест 4: Canary тесты (должны работать)

**Команда:**
```bash
$ cd front && npm run test:canary
```

**Результат:**
```
✅ Canary inline-style test correctly fails
✅ Canary inline-style-allowed test correctly passes
✅ Canary !important test correctly fails
```

**Статус:** ✅ **РАБОТАЮТ**

---

## Сводная таблица проверок

| Проверка | Статус | Доказательство |
|----------|--------|----------------|
| Pre-commit блокирует inline styles без allow-tag | ✅ PASS | Тест 1: коммит заблокирован |
| Pre-commit пропускает inline styles с allow-tag | ✅ PASS | Тест 2: коммит проходит |
| Pre-commit блокирует !important | ✅ PASS | Тест 3: коммит заблокирован |
| ESLint не блокирует inline styles с allow-tag | ✅ PASS | canary-inline-style-allowed.test.tsx проходит |
| Stylelint проверяет canary тесты | ✅ PASS | canary-important.test.css блокируется |
| Canary тесты работают в CI | ✅ PASS | npm run test:canary проходит |
| Lint-staged применяется к staged files | ✅ PASS | Проверяются только изменённые файлы |

---

## Изменённые файлы

1. **front/.eslintrc.json** — убрана блокировка inline styles из ESLint
2. **front/.stylelintrc.json** — исправлен ignoreFiles для canary тестов
3. **front/.lintstagedrc.json** — добавлен --max-warnings=0
4. **front/.husky/pre-commit** — улучшены сообщения об ошибках
5. **front/package.json** — добавлены команды для CI canary тестов

---

## Рекомендации для CI/CD

### GitHub Actions (если используется)

```yaml
# .github/workflows/style-guardrails.yml
name: Style Guardrails

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd front && npm ci
      - run: cd front && npm run test:canary
      - run: cd front && npm run lint
```

### GitLab CI (если используется)

```yaml
# .gitlab-ci.yml
style-guardrails:
  stage: test
  script:
    - cd front
    - npm ci
    - npm run test:canary
    - npm run lint
```

---

## Заключение

**Статус:** ✅ **COMPLETED**

Все проверки enforcement работают корректно:
- ✅ Pre-commit блокирует inline styles без allow-tag
- ✅ Pre-commit блокирует !important
- ✅ ESLint и Stylelint применяются к staged files
- ✅ Canary тесты работают и могут использоваться в CI

**Следующие шаги:**
1. Интегрировать `npm run test:canary` в CI/CD pipeline (если есть)
2. Периодически проверять canary тесты для убеждения, что они не сломались
3. Обновлять canary тесты при изменении правил enforcement

---

**Проверено:** @Compliance  
**Дата:** 2026-01-22
