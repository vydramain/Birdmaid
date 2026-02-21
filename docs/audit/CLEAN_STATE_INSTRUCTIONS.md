# Clean-state enforcement — инструкция

**Mode:** FP=REPO_CLEAN_STATE mode=audit  
**Rule:** PASS only if `git status --porcelain` empty.

---

## 1. Текущее состояние (почему дерево грязное)

### Modified tracked files (13)

| Path | Изменения |
|------|-----------|
| docs/audit/FP1_AUDIT_REPORT.md | Форматирование + обновление Gate Summary |
| docs/audit/FP2_AUDIT_REPORT.md | Форматирование + обновление Gate Summary |
| docs/audit/FP3_AUDIT_REPORT.md | Форматирование + обновление Gate Summary |
| docs/dev/GUARDRAILS.md | Gate Semantics, test-api-fp.sh (M0) |
| docs/fps/FP1.md | Gate Commands (M0) |
| docs/fps/FP2.md | Gate Commands (M0) |
| docs/fps/FP3.md | Gate Commands (M0) |
| docs/fps/RELEASE_GATE_TEMPLATE.md | Таблица команд, exit codes (M0) |
| docs/tests/FP3_TESTS.md | Форматирование |
| infra/README.md | Canonical commands (M0) |
| infra/gate.sh | test-api-fp для FP2/FP3 (M0) |
| infra/test-e2e.sh | Playwright image (M0) |
| package.json | Trailing newline (Prettier) |

### Untracked files (2)

| Path | Описание |
|------|----------|
| infra/test-api-fp.sh | Новый скрипт scoped API (M0) |
| docs/audit/CLEAN_STATE_INSTRUCTIONS.md | Эта инструкция (артефакт аудита) |

### Уже в .gitignore (не в status)

| Path | Статус |
|------|--------|
| playwright-report/ | Игнорируется; runtime-репорт Playwright |

---

## 2. Таблица: path → action → rationale

| Path | Action | Rationale |
|------|--------|------------|
| docs/audit/FP1_AUDIT_REPORT.md | **add** | Доки аудита; обновления Gate Summary |
| docs/audit/FP2_AUDIT_REPORT.md | **add** | Доки аудита; обновления Gate Summary |
| docs/audit/FP3_AUDIT_REPORT.md | **add** | Доки аудита; обновления Gate Summary |
| docs/dev/GUARDRAILS.md | **add** | Код/доки M0 (Gate Semantics) |
| docs/fps/FP1.md | **add** | Код/доки M0 (Gate Commands) |
| docs/fps/FP2.md | **add** | Код/доки M0 (Gate Commands) |
| docs/fps/FP3.md | **add** | Код/доки M0 (Gate Commands) |
| docs/fps/RELEASE_GATE_TEMPLATE.md | **add** | Код/доки M0 |
| docs/tests/FP3_TESTS.md | **add** | Доки; форматирование |
| infra/README.md | **add** | Код/доки M0 |
| infra/gate.sh | **add** | Код M0 |
| infra/test-e2e.sh | **add** | Код M0 |
| infra/test-api-fp.sh | **add** | Код M0 (новый скрипт) |
| docs/audit/CLEAN_STATE_INSTRUCTIONS.md | **add** | Артефакт аудита (опционально) |
| package.json | **add** | Prettier: trailing newline |

**Нет:** restore, ignore, clean — всё перечисленное относится к продукту/докам.

---

## 3. Команды (copy-paste)

### Вариант A: Довести до clean-state через add + commit

```bash
# 1. Добавить все изменённые и новый файл
git add \
  docs/audit/CLEAN_STATE_INSTRUCTIONS.md \
  docs/audit/FP1_AUDIT_REPORT.md \
  docs/audit/FP2_AUDIT_REPORT.md \
  docs/audit/FP3_AUDIT_REPORT.md \
  docs/dev/GUARDRAILS.md \
  docs/fps/FP1.md \
  docs/fps/FP2.md \
  docs/fps/FP3.md \
  docs/fps/RELEASE_GATE_TEMPLATE.md \
  docs/tests/FP3_TESTS.md \
  infra/README.md \
  infra/gate.sh \
  infra/test-e2e.sh \
  infra/test-api-fp.sh \
  package.json

# 2. Проверить
git status --porcelain

# 3. Закоммитить (когда готов)
git commit -m "chore(gate): canonical gate commands, scoped API, clean-state docs"
```

После коммита: `git status --porcelain` → пусто.

---

### Вариант B: Откатить всё (потерять изменения)

```bash
# Откатить все modified
git restore \
  docs/audit/FP1_AUDIT_REPORT.md \
  docs/audit/FP2_AUDIT_REPORT.md \
  docs/audit/FP3_AUDIT_REPORT.md \
  docs/dev/GUARDRAILS.md \
  docs/fps/FP1.md \
  docs/fps/FP2.md \
  docs/fps/FP3.md \
  docs/fps/RELEASE_GATE_TEMPLATE.md \
  docs/tests/FP3_TESTS.md \
  infra/README.md \
  infra/gate.sh \
  infra/test-e2e.sh \
  package.json

# Удалить untracked (infra/test-api-fp.sh — продукт, не мусор; обычно НЕ удалять)
# Если всё же считать мусором:
# rm infra/test-api-fp.sh

# Проверить
git status --porcelain
```

**Внимание:** Вариант B отменяет работу M0. Использовать только если нужно вернуться к состоянию до M0.

---

## 4. .gitignore

Обновление не требуется. `playwright-report/` уже в .gitignore.

---

## 5. Проверка

```bash
git status --porcelain
# Ожидание: пустой вывод
```
