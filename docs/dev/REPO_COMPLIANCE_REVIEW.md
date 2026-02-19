# Repo Compliance Review — соответствие новым правилам

**Дата:** 2025-02-20  
**Правила:** GUARDRAILS.md, STYLE_GUIDE.md, COMMITS.md, ARCHITECTURE.md, SECURITY.md, TWELVE_FACTOR.md

---

## 1. Executive Summary

| Область                  | Статус                          | Критично |
| ------------------------ | ------------------------------- | -------- |
| Frontend inline styles   | ❌ Не соответствует             | Да       |
| Frontend CSS (index.css) | ⚠️ px в :root, stylelint ignore | Средне   |
| Pre-commit / lint-staged | ⚠️ Только staged files          | Да       |
| CI                       | ⚠️ Нет check-inline-styles      | Да       |
| Back (env, config)       | ✅ Соответствует                | —        |
| Security (.env, secrets) | ✅ Соответствует                | —        |
| Commit format            | ✅ commitlint в pre-commit      | —        |
| Docs / agents            | ✅ Ссылки на правила            | —        |

---

## 2. Frontend — Inline Styles

### 2.1 Нарушения (check-inline-styles)

| Файл                            | Строки                                     | Проблема                     |
| ------------------------------- | ------------------------------------------ | ---------------------------- |
| `front/App.tsx`                 | 5                                          | Inline style без allow-tag   |
| `front/ui/DesktopView.tsx`      | 18                                         | Inline style без allow-tag   |
| `front/ui/TaskbarItemView.tsx`  | 16                                         | Inline style + px в fallback |
| `front/ui/TaskbarView.tsx`      | 16                                         | Inline style + px в fallback |
| `front/ui/WindowChromeView.tsx` | 30, 57, 74, 78, 86, 97, 108, 115, 123, 143 | Inline styles + px           |

**Итого:** 5 файлов, ~20+ нарушений.

### 2.2 Соответствующие файлы

- `front/Shell.tsx` — стили вынесены в CSS (shell-root, shell-toolbar, shell-btn)
- `front/core/AppHost.tsx` — стили вынесены в CSS (app-host-root, app-host-iframe, app-host-placeholder)

### 2.3 Рекомендации

1. **Вынести все inline styles в CSS-классы** в `front/index.css` (или отдельный CSS модуль).
2. **WindowChromeView** — сложный случай: `left`, `top`, `width`, `height` из `win.bounds` — runtime. По правилам:
   - `transform: translate3d(x, y, 0)` — px разрешён для drag
   - `width`/`height` в px — запрещены. Варианты: CSS custom properties `style={{ "--win-x": x, "--win-y": y }}` + классы, но скрипт считает это inline. Или: `transform` для позиции + `width`/`height` в rem (через calc от scale).
3. **DesktopView, TaskbarView, TaskbarItemView** — статичные стили, перенести в классы.
4. **App.tsx** — `main` с `width: 100vw`, `height: 100vh` → класс `.app-root`.

---

## 3. Frontend — CSS (index.css)

### 3.1 Текущее состояние

- `front/index.css` — в `.stylelintignore` (до FP7).
- `:root` содержит `px` в base-переменных: `28px`, `2px`, `32px`, `200px`, `150px`, `4px`, `8px`, `12px`.
- Stylelint rule `unit-disallowed-list: ["px", ...]` — не применяется к index.css.

### 3.2 Рекомендации

- Снять ignore с `front/index.css` в FP7 и заменить `px` на `rem` в base-переменных.
- Или: оставить временный ignore, но документировать в `REPO_HYGIENE_PLAN.md` milestone.

---

## 4. Pre-commit / Lint-staged

### 4.1 Проблема: только staged files

**Текущее поведение:** `check-inline-styles.cjs` получает только **staged** `.ts`/`.tsx` файлы. Если файл не в staged — он не проверяется.

**Следствие:** Можно закоммитить, не добавляя в индекс `DesktopView.tsx`, `WindowChromeView.tsx` и т.д. — violations остаются в репо.

### 4.2 Рекомендации

**Вариант A (рекомендуется):** Проверять весь front при любом коммите с `.ts`/`.tsx`:

1. Добавить в `package.json`: `"check:styles": "node scripts/check-inline-styles.cjs front e2e back"`
2. Доработать `check-inline-styles.cjs`: при аргументе-директории вызывать `findTsxFiles` по ней
3. В `.lintstagedrc.json` для `*.{ts,tsx}` первой командой вызывать `pnpm check:styles` (проверка всего front), затем eslint/prettier только по staged

**Вариант B:** Оставить staged-only, но добавить `check-inline-styles` в CI (см. ниже).

---

## 5. CI

### 5.1 Текущее состояние

`.github/workflows/ci.yml`:

- `lint`: `pnpm lint` (ESLint + stylelint)
- `format:check`: Prettier
- `test`: vitest
- `audit`: pnpm audit

**check-inline-styles в CI не вызывается.**

### 5.2 Рекомендации

1. Добавить в CI job `lint`:

   ```yaml
   - run: node scripts/check-inline-styles.cjs front/ e2e/ back/
   ```

   Для этого скрипт должен поддерживать директории (сканировать все `.ts`/`.tsx` внутри). Сейчас при `args.length > 0` он фильтрует только файлы. Нужно доработать: если аргумент — директория, `findTsxFiles` по ней.

2. Или добавить в `package.json`:

   ```json
   "check:styles": "node scripts/check-inline-styles.cjs front e2e back"
   ```

   И в CI: `pnpm check:styles` перед `pnpm lint`.

---

## 6. Back — Architecture (TWELVE_FACTOR, SECURITY)

### 6.1 Config через env

- `back/src/index.ts` — `PORT`, `HOST`, `FS_S3_ENDPOINT`, `FS_S3_ACCESS_KEY`, `FS_S3_SECRET_KEY`, `FS_S3_BUCKET`, `FS_S3_PUBLIC_URL`, `FS_SIGNED_URL_TTL_SEC` — всё из `process.env`. ✅

### 6.2 Secrets

- `.env`, `.env.*` в `.gitignore`. ✅
- `.dockerignore` исключает `.env`, `.env.*`. ✅
- `.env.example` — отсутствует. Рекомендация: добавить `.env.example` с placeholder-ключами для локальной разработки.

### 6.3 Слои (ARCHITECTURE)

- Routes → domain (fs.ts) — делегирование. ✅
- Нет бизнес-логики в handlers. ✅

---

## 7. Commit Format

- `commitlint` в `.husky/commit-msg` — Conventional Commits. ✅
- `docs/dev/COMMITS.md` — описание формата. ✅

---

## 8. Docs / Agents

- `AGENTS.md`, `.cursor/rules/agents.md`, `.codex/skills/README.md` — ссылки на GUARDRAILS, COMMITS, ARCHITECTURE, SECURITY, TWELVE_FACTOR. ✅
- `docs/dev/CODE_REVIEW.md` — checklist: lint, format:check, test. Не упоминает `check-inline-styles` — при staged-only это ок (pre-commit), но при добавлении в CI — обновить checklist.

---

## 9. Checklist для исправлений

### Критичные

- [ ] Вынести inline styles из `App.tsx`, `DesktopView.tsx`, `TaskbarItemView.tsx`, `TaskbarView.tsx`, `WindowChromeView.tsx` в CSS.
- [ ] Добавить `check-inline-styles` в CI (или `pnpm check:styles` в lint job).
- [ ] Проверить, что pre-commit проверяет весь front (или оставить staged + CI как safety net).

### Дополнительно

- [ ] Добавить `.env.example` с placeholder-переменными для back.
- [ ] Обновить `CODE_REVIEW.md` — добавить `pnpm check:styles` в checklist, если будет в CI.
- [ ] Запланировать FP7: снять `.stylelintignore` с `front/index.css`, миграция px → rem.

---

## 10. Ссылки

- [GUARDRAILS.md](GUARDRAILS.md)
- [STYLE_GUIDE.md](../style/STYLE_GUIDE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [COMMITS.md](COMMITS.md)
- [SECURITY.md](SECURITY.md)
- [TWELVE_FACTOR.md](TWELVE_FACTOR.md)
- [GUIDE_STYLE.md](../../GUIDE_STYLE.md) — inline-style policy
