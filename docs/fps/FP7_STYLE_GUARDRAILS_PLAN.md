# Style Guardrails: План внедрения атомарными PR

**Версия:** 1.0  
**Дата:** 2026-01-22  
**Связано с:** [FP7.md](./FP7.md) (Phase 9: Style Guardrails)  
**Агент:** @Delivery

## Цель

Внедрить style guardrails атомарными PR, чтобы не сломать пайплайн. Каждый PR должен быть независимым, проверяемым и откатываемым.

## Текущее состояние

**Уже есть:**
- ✅ Husky и lint-staged установлены в `package.json`
- ✅ ESLint конфигурация с правилом для inline styles (`.eslintrc.json`)
- ✅ Stylelint конфигурация с запретом `!important` (`.stylelintrc.json`)
- ✅ Скрипт `scripts/check-inline-styles.js` для проверки allow-tag комментариев
- ✅ Документация `docs/style/GUIDE_STYLE.md`
- ✅ Canary тесты в `front/__tests__/style-guardrails/`

**Отсутствует:**
- ❌ Husky не инициализирован (нет `.husky/` директории)
- ❌ Pre-commit hook не настроен
- ❌ ESLint plugin не подключен к `.eslintrc.json`
- ❌ Canary тесты не интегрированы в CI/CD

---

## PR1: Tooling Baseline (Husky + lint-staged + scripts)

**Цель:** Настроить базовую инфраструктуру для pre-commit hooks без включения правил.

### Изменения

1. **Инициализация Husky:**
   ```bash
   cd front
   npx husky install
   ```

2. **Создание pre-commit hook:**
   - Создать `.husky/pre-commit` с `npx lint-staged`
   - Убедиться, что hook исполняемый (`chmod +x`)

3. **Проверка lint-staged конфигурации:**
   - Убедиться, что `.lintstagedrc.json` существует и корректен
   - Временно отключить проверки (только prettier для проверки работы)

4. **Обновление package.json:**
   - Убедиться, что `prepare` скрипт есть: `"prepare": "husky install"`

### Файлы

- `.husky/pre-commit` (новый)
- `.husky/_/husky.sh` (создается автоматически)
- `front/package.json` (проверка prepare скрипта)

### Команды проверки

```bash
# 1. Проверить, что husky инициализирован
cd front
ls -la .husky/
# Должны быть: pre-commit, _/husky.sh

# 2. Проверить, что pre-commit hook исполняемый
chmod +x .husky/pre-commit
test -x .husky/pre-commit && echo "✅ Hook is executable"

# 3. Проверить, что prepare скрипт работает
npm run prepare
# Должно вывести: husky install

# 4. Тестовый коммит (должен пройти, т.к. проверки отключены)
git add .
git commit -m "test: verify husky setup"
# Должен пройти без ошибок
```

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Husky не работает в CI/CD | Low | Medium | Проверить, что `npm run prepare` вызывается в CI |
| Pre-commit hook блокирует коммиты | Low | Low | Временно отключить проверки, только prettier |
| Hook не исполняемый | Medium | Low | Добавить `chmod +x` в инструкции |

### Откат

```bash
# Удалить husky hook
rm -rf front/.husky/
# Удалить prepare скрипт из package.json (опционально)
```

### DoD

- [ ] `.husky/pre-commit` существует и исполняемый
- [ ] `npm run prepare` работает
- [ ] Тестовый коммит проходит
- [ ] CI/CD не ломается (если есть)

---

## PR2: Stylelint запрет !important + прогон на staged files

**Цель:** Включить проверку `!important` в stylelint и запускать на staged CSS/SCSS файлах.

### Изменения

1. **Проверка stylelint конфигурации:**
   - Убедиться, что `.stylelintrc.json` содержит `"declaration-no-important": true`
   - Проверить, что `ignoreFiles` корректны

2. **Обновление lint-staged:**
   - Включить `stylelint --fix` для `*.{css,scss}` в `.lintstagedrc.json`
   - Убедиться, что проверка запускается на staged files

3. **Тестирование на canary файле:**
   - Использовать `front/__tests__/style-guardrails/canary-important.test.css`
   - Убедиться, что pre-commit блокирует коммит с `!important`

### Файлы

- `.stylelintrc.json` (проверка)
- `.lintstagedrc.json` (обновление)
- `front/__tests__/style-guardrails/canary-important.test.css` (тест)

### Команды проверки

```bash
# 1. Проверить stylelint конфигурацию
cd front
cat .stylelintrc.json | grep -A 1 "declaration-no-important"
# Должно быть: "declaration-no-important": true

# 2. Проверить lint-staged конфигурацию
cat .lintstagedrc.json
# Должно быть: "*.{css,scss}": ["stylelint --fix", "prettier --write"]

# 3. Тест: попытка закоммитить файл с !important (должен упасть)
echo ".test { color: red !important; }" > test-important.css
git add test-important.css
git commit -m "test: verify !important check"
# Должен упасть с ошибкой stylelint

# 4. Очистка тестового файла
rm test-important.css
git reset HEAD test-important.css

# 5. Проверка на canary файле (должен упасть)
git add front/__tests__/style-guardrails/canary-important.test.css
git commit -m "test: canary !important"
# Должен упасть с ошибкой stylelint
```

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Существующие файлы с !important | High | High | Добавить в ignoreFiles или исправить перед мержем |
| Stylelint не находит файлы | Medium | Medium | Проверить ignoreFiles, убедиться что staged files не игнорируются |
| Ложные срабатывания | Low | Low | Проверить конфигурацию, уточнить правила |

### Откат

```bash
# Временно отключить stylelint в lint-staged
# В .lintstagedrc.json заменить:
"*.{css,scss}": ["stylelint --fix", "prettier --write"]
# На:
"*.{css,scss}": ["prettier --write"]
```

### DoD

- [ ] Stylelint конфигурация корректна
- [ ] Lint-staged запускает stylelint на staged CSS/SCSS
- [ ] Pre-commit блокирует коммит с `!important`
- [ ] Canary тест падает (как ожидается)
- [ ] Существующие файлы не ломаются (если нет !important)

---

## PR3: ESLint guard на inline styles + whitelist protocol

**Цель:** Включить проверку inline styles через ESLint и скрипт, с поддержкой whitelist через allow-tag комментарии.

### Изменения

1. **Проверка ESLint конфигурации:**
   - Убедиться, что `.eslintrc.json` содержит правило `no-restricted-syntax` для `JSXAttribute[name.name='style']`
   - Проверить, что правило включено для `*.{ts,tsx}`

2. **Проверка скрипта check-inline-styles.js:**
   - Убедиться, что скрипт корректно проверяет allow-tag комментарии
   - Проверить, что скрипт вызывается в lint-staged

3. **Обновление lint-staged:**
   - Убедиться, что `node scripts/check-inline-styles.js` вызывается для `*.{ts,tsx}`
   - Проверить порядок: сначала скрипт, потом eslint

4. **Тестирование на canary файлах:**
   - `canary-inline-style.test.tsx` должен падать (нет allow-tag)
   - `canary-inline-style-allowed.test.tsx` должен проходить (есть allow-tag)

### Файлы

- `.eslintrc.json` (проверка)
- `scripts/check-inline-styles.js` (проверка)
- `.lintstagedrc.json` (проверка)
- `front/__tests__/style-guardrails/canary-inline-style.test.tsx` (тест)
- `front/__tests__/style-guardrails/canary-inline-style-allowed.test.tsx` (тест)

### Команды проверки

```bash
# 1. Проверить ESLint конфигурацию
cd front
cat .eslintrc.json | grep -A 5 "no-restricted-syntax"
# Должно быть правило для JSXAttribute[name.name='style']

# 2. Проверить скрипт check-inline-styles.js
node scripts/check-inline-styles.js front/__tests__/style-guardrails/canary-inline-style.test.tsx
# Должен упасть с ошибкой (нет allow-tag)

# 3. Проверить скрипт на файле с allow-tag
node scripts/check-inline-styles.js front/__tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# Должен пройти (есть allow-tag)

# 4. Проверить lint-staged конфигурацию
cat .lintstagedrc.json
# Должно быть: "*.{ts,tsx}": ["node scripts/check-inline-styles.js", "eslint --fix", "prettier --write"]

# 5. Тест: попытка закоммитить файл без allow-tag (должен упасть)
echo 'export function Test() { return <div style={{padding: "8px"}}>Test</div>; }' > test-inline.tsx
git add test-inline.tsx
git commit -m "test: verify inline style check"
# Должен упасть с ошибкой

# 6. Очистка тестового файла
rm test-inline.tsx
git reset HEAD test-inline.tsx

# 7. Проверка на canary файлах
git add front/__tests__/style-guardrails/canary-inline-style.test.tsx
git commit -m "test: canary inline style"
# Должен упасть

git add front/__tests__/style-guardrails/canary-inline-style-allowed.test.tsx
git commit -m "test: canary inline style allowed"
# Должен пройти
```

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Существующие файлы с inline styles | High | High | Добавить allow-tag комментарии или мигрировать в CSS перед мержем |
| Скрипт не находит allow-tag | Medium | Medium | Проверить логику поиска комментариев (в пределах 2 строк) |
| ESLint и скрипт конфликтуют | Low | Low | Проверить порядок выполнения в lint-staged |
| Ложные срабатывания | Medium | Medium | Уточнить правила, проверить edge cases |

### Откат

```bash
# Временно отключить проверку inline styles в lint-staged
# В .lintstagedrc.json заменить:
"*.{ts,tsx}": ["node scripts/check-inline-styles.js", "eslint --fix", "prettier --write"]
# На:
"*.{ts,tsx}": ["eslint --fix", "prettier --write"]

# Или отключить правило в ESLint (временно)
# В .eslintrc.json закомментировать правило no-restricted-syntax
```

### DoD

- [ ] ESLint конфигурация корректна
- [ ] Скрипт check-inline-styles.js работает
- [ ] Lint-staged запускает проверку на staged TS/TSX
- [ ] Pre-commit блокирует inline styles без allow-tag
- [ ] Pre-commit пропускает inline styles с allow-tag
- [ ] Canary тесты работают как ожидается
- [ ] Существующие файлы не ломаются (если нет inline styles без allow-tag)

---

## PR4: Guide-style каркас + docs/style/GUIDE_STYLE.md

**Цель:** Убедиться, что документация полная и актуальная, добавить недостающие разделы.

### Изменения

1. **Проверка документации:**
   - Убедиться, что `docs/style/GUIDE_STYLE.md` существует и полный
   - Проверить, что все правила описаны
   - Проверить, что примеры корректны

2. **Добавление недостающих разделов (если нужно):**
   - Troubleshooting
   - FAQ (расширить, если нужно)
   - Ссылки на конфигурационные файлы

3. **Обновление ссылок:**
   - Убедиться, что ссылки на конфигурационные файлы актуальны
   - Проверить, что ссылки на FP7.md корректны

### Файлы

- `docs/style/GUIDE_STYLE.md` (проверка/обновление)
- `docs/fps/FP7.md` (проверка ссылок)

### Команды проверки

```bash
# 1. Проверить, что документация существует
test -f docs/style/GUIDE_STYLE.md && echo "✅ Documentation exists"

# 2. Проверить основные разделы
grep -E "^## " docs/style/GUIDE_STYLE.md
# Должны быть: Overview, Rules, Pre-commit Hooks, Manual Checks, Migration Path, FAQ

# 3. Проверить ссылки на конфигурационные файлы
grep -E "\.eslintrc|\.stylelintrc|\.lintstagedrc" docs/style/GUIDE_STYLE.md
# Должны быть ссылки на конфигурационные файлы

# 4. Проверить примеры кода
grep -A 5 "Example (❌ Bad):" docs/style/GUIDE_STYLE.md
grep -A 5 "Example (✅ Good):" docs/style/GUIDE_STYLE.md
# Должны быть примеры

# 5. Проверить ссылку на FP7.md
grep "FP7.md" docs/style/GUIDE_STYLE.md
# Должна быть ссылка
```

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Документация неполная | Low | Low | Проверить все разделы, добавить недостающие |
| Устаревшие ссылки | Low | Low | Проверить все ссылки, обновить при необходимости |
| Неточные примеры | Low | Low | Проверить примеры, убедиться что они работают |

### Откат

```bash
# Откат не требуется (документация не влияет на работу системы)
# Можно просто откатить изменения в файле
```

### DoD

- [ ] Документация существует и полная
- [ ] Все правила описаны
- [ ] Примеры корректны
- [ ] Ссылки актуальны
- [ ] FAQ покрывает основные вопросы

---

## PR5: Canary checks + финальный gate checklist

**Цель:** Интегрировать canary тесты в CI/CD и создать финальный gate checklist.

### Изменения

1. **Интеграция canary тестов:**
   - Убедиться, что canary тесты находятся в `front/__tests__/style-guardrails/`
   - Проверить, что тесты не запускаются в обычном test suite (должны быть исключены)

2. **Создание gate checklist:**
   - Создать `docs/fps/FP7_STYLE_GUARDRAILS_GATE.md` с финальным чеклистом
   - Включить проверки для каждого PR
   - Включить команды проверки

3. **Обновление FP7.md:**
   - Обновить Phase 9: Style Guardrails с ссылкой на gate checklist
   - Убедиться, что все задачи выполнены

### Файлы

- `front/__tests__/style-guardrails/canary-important.test.css` (проверка)
- `front/__tests__/style-guardrails/canary-inline-style.test.tsx` (проверка)
- `front/__tests__/style-guardrails/canary-inline-style-allowed.test.tsx` (проверка)
- `docs/fps/FP7_STYLE_GUARDRAILS_GATE.md` (новый)
- `docs/fps/FP7.md` (обновление)

### Команды проверки

```bash
# 1. Проверить, что canary тесты существуют
ls -la front/__tests__/style-guardrails/
# Должны быть: canary-important.test.css, canary-inline-style.test.tsx, canary-inline-style-allowed.test.tsx

# 2. Проверить, что canary тесты не запускаются в test suite
# (должны быть исключены из vitest или иметь .skip)
grep -r "canary" front/vite.config.ts front/package.json
# Проверить, что canary тесты не включены в обычный test run

# 3. Проверить canary-important.test.css вручную
cd front
npx stylelint __tests__/style-guardrails/canary-important.test.css
# Должен упасть с ошибкой !important

# 4. Проверить canary-inline-style.test.tsx вручную
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style.test.tsx
# Должен упасть (нет allow-tag)

# 5. Проверить canary-inline-style-allowed.test.tsx вручную
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style-allowed.test.tsx
# Должен пройти (есть allow-tag)

# 6. Финальная проверка: попытка закоммитить canary файлы
git add front/__tests__/style-guardrails/canary-important.test.css
git commit -m "test: canary !important"
# Должен упасть

git add front/__tests__/style-guardrails/canary-inline-style.test.tsx
git commit -m "test: canary inline style"
# Должен упасть

git add front/__tests__/style-guardrails/canary-inline-style-allowed.test.tsx
git commit -m "test: canary inline style allowed"
# Должен пройти
```

### Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Canary тесты запускаются в CI | Medium | Low | Исключить из test suite, проверить конфигурацию |
| Gate checklist неполный | Low | Low | Проверить все пункты, добавить недостающие |
| Canary тесты не работают | Low | Medium | Проверить вручную, исправить при необходимости |

### Откат

```bash
# Откат не требуется (canary тесты не влияют на работу системы)
# Можно просто удалить canary тесты, если нужно
```

### DoD

- [ ] Canary тесты существуют и работают
- [ ] Canary тесты не запускаются в обычном test suite
- [ ] Gate checklist создан и полный
- [ ] Все команды проверки работают
- [ ] FP7.md обновлен с ссылкой на gate checklist

---

## Общий план выполнения

### Порядок PR

1. **PR1** → Merge → Проверить, что husky работает
2. **PR2** → Merge → Проверить, что stylelint блокирует !important
3. **PR3** → Merge → Проверить, что inline styles блокируются
4. **PR4** → Merge → Проверить документацию
5. **PR5** → Merge → Финальная проверка

### Критерии готовности каждого PR

- ✅ Все команды проверки проходят
- ✅ Canary тесты работают как ожидается
- ✅ CI/CD не ломается
- ✅ Существующие файлы не ломаются (если нет нарушений)
- ✅ DoD выполнен

### Общие риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Существующие файлы с нарушениями | High | High | Исправить перед мержем каждого PR |
| CI/CD ломается | Medium | High | Проверить каждый PR в CI/CD перед мержем |
| Pre-commit блокирует все коммиты | Medium | High | Временно отключить проверки, исправить проблемы |
| Конфликты между правилами | Low | Medium | Проверить порядок выполнения в lint-staged |

### Общий откат

Если что-то ломается:

```bash
# 1. Временно отключить все проверки в lint-staged
# В .lintstagedrc.json оставить только prettier:
{
  "*.{ts,tsx}": ["prettier --write"],
  "*.{css,scss}": ["prettier --write"]
}

# 2. Откатить изменения в ESLint/Stylelint конфигурациях
git checkout HEAD~1 -- front/.eslintrc.json front/.stylelintrc.json

# 3. Удалить husky hook (если нужно)
rm -rf front/.husky/
```

---

## Команды проверки (сводка)

### PR1: Tooling Baseline

```bash
cd front
ls -la .husky/
chmod +x .husky/pre-commit
npm run prepare
git commit -m "test: verify husky setup"
```

### PR2: Stylelint !important

```bash
cd front
cat .stylelintrc.json | grep "declaration-no-important"
cat .lintstagedrc.json
echo ".test { color: red !important; }" > test-important.css
git add test-important.css && git commit -m "test" # должен упасть
rm test-important.css
```

### PR3: ESLint inline styles

```bash
cd front
cat .eslintrc.json | grep "no-restricted-syntax"
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style.test.tsx # должен упасть
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style-allowed.test.tsx # должен пройти
echo 'export function Test() { return <div style={{padding: "8px"}}>Test</div>; }' > test-inline.tsx
git add test-inline.tsx && git commit -m "test" # должен упасть
rm test-inline.tsx
```

### PR4: Documentation

```bash
test -f docs/style/GUIDE_STYLE.md
grep -E "^## " docs/style/GUIDE_STYLE.md
```

### PR5: Canary + Gate

```bash
ls -la front/__tests__/style-guardrails/
cd front
npx stylelint __tests__/style-guardrails/canary-important.test.css # должен упасть
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style.test.tsx # должен упасть
node scripts/check-inline-styles.js __tests__/style-guardrails/canary-inline-style-allowed.test.tsx # должен пройти
```

---

## Следующие шаги

После завершения всех PR:

1. **Миграция существующих файлов:**
   - Найти все файлы с `!important`
   - Найти все файлы с inline styles без allow-tag
   - Исправить или добавить allow-tag комментарии

2. **Мониторинг:**
   - Отслеживать, сколько коммитов блокируется
   - Собирать feedback от команды
   - Корректировать правила при необходимости

3. **Документация:**
   - Обновить README с инструкциями
   - Добавить примеры в GUIDE_STYLE.md

---

**End of Style Guardrails Plan**
