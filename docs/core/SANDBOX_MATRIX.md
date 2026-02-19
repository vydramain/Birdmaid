# Sandbox Matrix — iframe sandbox attributes by app type

**Purpose:** Canonical mapping of app types to sandbox attributes. Build-ready, testable.  
**Scope:** FP1 baseline; FP5 extension point (no implementation in FP1).  
**ADR:** Sandbox FP1 minimal: allow-scripts only (QNA_DECISIONS ADR#7).

---

## 1. FP1 Baseline

| appType       | sandbox         | allow list | prohibited                                                                 |
| ------------- | --------------- | ---------- | -------------------------------------------------------------------------- |
| `fp1-testapp` | `allow-scripts` | —          | `allow-same-origin`, `allow-popups`, `allow-top-navigation`, `allow-forms` |

**Explicitly NOT used in FP1:**

- `allow-same-origin` — would allow iframe to access parent; not needed for postMessage
- `allow-popups` — no popups in FP1
- `allow-top-navigation` — app must not navigate top window
- `allow-forms` — no form submission to top

---

## 2. Sandbox Attributes Table

| Attribute              | FP1 fp1-testapp | Description                                             |
| ---------------------- | --------------- | ------------------------------------------------------- |
| _(none)_               | —               | Default: no scripts, no forms, no popups, no navigation |
| `allow-scripts`        | ✓               | JavaScript allowed in iframe                            |
| `allow-same-origin`    | ✗               | Would allow same-origin access; breaks isolation        |
| `allow-popups`         | ✗               | No popups                                               |
| `allow-top-navigation` | ✗               | No top-level navigation                                 |
| `allow-forms`          | ✗               | No form submission                                      |
| `allow-modals`         | ✗               | No alert/confirm/prompt (optional, not in FP1)          |

**FP1 iframe element:**

```html
<iframe sandbox="allow-scripts" src="..." title="..."></iframe>
```

---

## 3. FP5 Extension (design note only)

**Where and how the matrix expands in FP5:**

- New app types (e.g. `explorer`, `viewer-image`) may require additional attributes.
- Example: `allow-same-origin` might be needed for certain viewers (e.g. canvas/WebGL from same origin).
- Extension mechanism: add rows to this matrix; AppHost reads `appType` and applies corresponding `sandbox` string.
- **No implementation in FP1** — only document the extension point here.

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- QNA_DECISIONS: [docs/core/QNA_DECISIONS.md](./QNA_DECISIONS.md)
