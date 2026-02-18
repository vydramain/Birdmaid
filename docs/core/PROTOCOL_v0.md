# Shell ↔ App postMessage Protocol v0

**Purpose:** Canonical contract for Shell–App communication. Build-ready, testable.  
**Scope:** FP1 only. No S3/Explorer/viewers/FS.  
**ADR:** Shell ↔ App через postMessage (QNA_DECISIONS ADR#2).

---

## 1. Message Types

| Type | Direction | When |
|------|-----------|------|
| `APP_READY` | App → Shell | App iframe mounted, ready for handshake |
| `SHELL_CAPS` | Shell → App | Shell capabilities (scale, theme, windowId) |
| `WINDOW_TITLE` | App → Shell | App updates window title |
| `ERROR` | App → Shell | App reports error (optional, for logging) |
| `PING` | Shell → App | Shell probes liveness (optional) |
| `PONG` | App → Shell | App responds to PING (optional) |

---

## 2. Payload Schema (JSON)

All messages use `postMessage(data, targetOrigin)` where `data` is an object:

```ts
interface ShellMessage {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: number; // ms since epoch
}
```

### 2.1 APP_READY (App → Shell)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"APP_READY"` | yes | Literal |
| `payload` | object | no | Optional app metadata |
| `payload.appId` | string | no | App identifier (e.g. `fp1-testapp`) |
| `payload.version` | string | no | App version (optional) |
| `payload.windowId` | string | no | Echo of windowId from SHELL_CAPS (after first handshake); typically absent on first APP_READY. Useful for asserts/logs. Shell trusts `event.source`, not this field |
| `timestamp` | number | no | ms since epoch |

**Example (first handshake):**
```json
{
  "type": "APP_READY",
  "payload": { "appId": "fp1-testapp", "version": "0.1.0" },
  "timestamp": 1708200000000
}
```

**Example (with windowId echo, e.g. re-init):**
```json
{
  "type": "APP_READY",
  "payload": { "appId": "fp1-testapp", "windowId": "win-1" },
  "timestamp": 1708200000000
}
```

### 2.2 SHELL_CAPS (Shell → App)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"SHELL_CAPS"` | yes | Literal |
| `payload` | object | yes | |
| `payload.windowId` | string | yes | Unique window ID |
| `payload.scale` | number | yes | `--wm-scale` value (1.0, 1.25, 1.5, 2.0) |
| `payload.theme` | string | yes | Theme name (e.g. `DefaultMock`, `Win98Mock`) |
| `timestamp` | number | no | ms since epoch |

**Example:**
```json
{
  "type": "SHELL_CAPS",
  "payload": {
    "windowId": "win-1",
    "scale": 1.0,
    "theme": "DefaultMock"
  },
  "timestamp": 1708200000100
}
```

### 2.3 WINDOW_TITLE (App → Shell)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"WINDOW_TITLE"` | yes | Literal |
| `payload` | object | yes | |
| `payload.title` | string | yes | New window title |
| `payload.windowId` | string | no | Echo of windowId from SHELL_CAPS; useful for asserts/logs. Shell trusts `event.source`, not this field |
| `timestamp` | number | no | ms since epoch |

**Example:**
```json
{
  "type": "WINDOW_TITLE",
  "payload": { "title": "Test App", "windowId": "win-1" },
  "timestamp": 1708200000200
}
```

### 2.4 ERROR (App → Shell)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"ERROR"` | yes | Literal |
| `payload` | object | no | |
| `payload.code` | string | no | Error code |
| `payload.message` | string | no | Human-readable message |
| `timestamp` | number | no | ms since epoch |

**Example:**
```json
{
  "type": "ERROR",
  "payload": { "code": "APP_LOAD_FAILED", "message": "Failed to load" },
  "timestamp": 1708200000300
}
```

### 2.5 PING / PONG (Shell ↔ App)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"PING"` or `"PONG"` | yes | Literal |
| `payload` | object | no | Optional |
| `timestamp` | number | no | ms since epoch |

**Example PING:**
```json
{ "type": "PING", "timestamp": 1708200000400 }
```

**Example PONG:**
```json
{ "type": "PONG", "timestamp": 1708200000405 }
```

---

## 3. Origin Rules

**ADRs:** Sandbox iframe (QNA_DECISIONS ADR#7); postMessage only (ADR#2).

### 3.1 Validation

- Shell **must** validate `event.origin` for every message received from an iframe.
- Allowed origins: **configured list** (e.g. `http://shell.local:80`, `http://localhost:5173` for dev).
- If `event.origin` is not in the allow list → **message_rejected** (log, ignore, do not process).

### 3.2 Behavior on mismatch

- **Action:** Log event `message_rejected` with `{ origin, reason: "origin_not_allowed" }`.
- **Action:** Do not update state, do not call handlers.
- **Action:** Do not send response to the iframe.

### 3.3 targetOrigin rule

- Shell **must** send replies to iframe only via `event.source.postMessage(data, event.origin)`.
- Use `event.origin` as `targetOrigin` (after allowlist check).
- Never use `"*"` as targetOrigin when replying to App.

### 3.4 windowId routing (contentWindow mapping)

- Shell stores `windowId → contentWindow` (iframe's `contentWindow`) for each mounted window.
- Shell **accepts** messages only from known `event.source`: `event.source` must equal `contentWindow` for some `windowId`.
- If `event.source` is not in the mapping → **message_rejected** with `reason: "unknown_source"` (log, ignore).
- Prevents: "one window updates another's title", spoof, cross-window leakage.

### 3.5 Allow list

| Environment | Allowed origins |
|-------------|-----------------|
| Dev | `http://shell.local`, `http://shell.local:80`, `http://localhost:5173` |
| Prod | `https://shell.example.com` (TBD in FP2+) |

---

## 4. Handshake State Machine

```
init → waiting_ready → ready
         │                  │
         └─ timeout ────────┘
         (2000ms: "App not responding")
```

| State | Trigger | Action |
|-------|---------|--------|
| `init` | createWindow called | Mount iframe, set state = `waiting_ready`, start timer 2000ms |
| `waiting_ready` | `APP_READY` received | Stop timer, set state = `ready`, send `SHELL_CAPS` |
| `waiting_ready` | timeout 2000ms | Show placeholder "App not responding", log `handshake_timeout` |
| `ready` | `WINDOW_TITLE` | Update chrome + taskbar title |

**Timeout:** 2000ms (ADR#7 in QNA_DECISIONS).  
**Placeholder:** Text "App not responding" in window content area when timeout.

---

## 5. Message Examples (one per type)

| Type | Example |
|------|---------|
| APP_READY | `{"type":"APP_READY","payload":{"appId":"fp1-testapp"},"timestamp":1708200000000}` |
| SHELL_CAPS | `{"type":"SHELL_CAPS","payload":{"windowId":"win-1","scale":1.0,"theme":"DefaultMock"},"timestamp":1708200000100}` |
| WINDOW_TITLE | `{"type":"WINDOW_TITLE","payload":{"title":"Test App","windowId":"win-1"},"timestamp":1708200000200}` |
| ERROR | `{"type":"ERROR","payload":{"code":"APP_LOAD_FAILED","message":"Failed"},"timestamp":1708200000300}` |
| PING | `{"type":"PING","timestamp":1708200000400}` |
| PONG | `{"type":"PONG","timestamp":1708200000405}` |

---

## 6. Metrics Mapping

| Message type / event | Event logged | Metric |
|----------------------|--------------|--------|
| `APP_READY` received | `app_ready` | — |
| `SHELL_CAPS` sent | — | — |
| `WINDOW_TITLE` received | — | — |
| `ERROR` received | `app_error` | payload.code, payload.message |
| Origin mismatch | `message_rejected` | origin, reason: "origin_not_allowed" |
| Unknown source | `message_rejected` | reason: "unknown_source" |
| Handshake timeout | `handshake_timeout` | windowId |

**Reference:** FP1 Metrics section: `app_ready`, `handshake_timeout`, `message_rejected`.

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- QNA_DECISIONS: [docs/core/QNA_DECISIONS.md](./QNA_DECISIONS.md)
