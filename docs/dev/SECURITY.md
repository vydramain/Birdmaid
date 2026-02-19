# Security Guidelines

**Purpose:** Краткие практики по [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices).

---

## Secrets

- Секреты (ключи S3, токены) — **не в коде**
- `.env` в `.gitignore`
- Конфиг через переменные окружения (см. [TWELVE_FACTOR.md](TWELVE_FACTOR.md))

---

## Dependencies

- `pnpm audit` — в CI (job `audit`)
- Обновлять уязвимые зависимости
- Pin версии в lockfile (`pnpm install --frozen-lockfile` в CI)

---

## Back (Gateway)

- Валидация входящих данных
- CORS — настроен в Fastify
- Не отдавать stack traces клиенту в prod

---

## Ссылки

- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)
- [nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) (раздел Security)
