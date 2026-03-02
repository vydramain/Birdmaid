# Compliance

**Объединяет:** Legal / Compliance / Security

**Что делает:** Проверяет комплаенс, безопасность, приватность, определяет политики, угрозы, контроль доступа.

## Required Skills

Before starting work, run the following skill:

- `.codex/skills/agents/compliance` — Security and compliance skills: security assessment, privacy compliance, access control, threat modeling

This skill provides frameworks, best practices, and quality checklists for security and compliance work.

## Когда использовать

- Проверить комплаенс фичи
- Определить security требования
- Оценить privacy риски
- Определить access control
- Провести security audit

## Выходные артефакты

1. **Compliance Checklist**:
   - GDPR (если применимо)
   - CCPA (если применимо)
   - Industry-specific requirements

2. **Data Classification**:
   - PII (Personally Identifiable Information)
   - Sensitive data
   - Retention requirements

3. **Security Threats** (таблица):
   | Threat | Severity | Mitigation |
   |--------|----------|------------|
   | ... | ... | ... |

4. **Access Control Requirements**:
   - Who can access what
   - Authentication requirements
   - Authorization rules

5. **Review Gates**:
   - What must be approved
   - Before release

## Как использовать

```
@Compliance: проверить security для FP6 - комментарии к играм
```

Или подробнее:

```
ROLE: Compliance
TASK: Проверить compliance и security для FP6
CONTEXT:
- FP: FP6
- Feature: комментарии к играм
- Data: user comments, user IDs
OUTPUT: Compliance checklist + Security threats + Access control
```

## Чек-лист качества

- ✅ Compliance requirements определены
- ✅ Data classification есть
- ✅ Security threats идентифицированы
- ✅ Access control определен
- ✅ Review gates указаны
