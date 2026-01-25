# FP7 Security Audit & Action Plan

## Security Notes

### 1. Debug Interface Exposure (`window.sys`)
**Severity:** HIGH
**Status:** ❌ Exposed in Production
**Observation:**
`front/src/os/wm/WindowRegistry.tsx` and `front/src/os/SysBridge.tsx` expose `window.sys` (including full VFS write access) unconditionally.
**Risk:** Malicious scripts or users could overwrite system files (e.g., `explorer.url`) or inject content into the VFS, effectively defacing the desktop or breaking the OS for the session.

### 2. Iframe Sandbox Policy
**Severity:** MEDIUM
**Status:** ⚠️ Permissive Default
**Observation:**
`AppHost` defaults to `allow-scripts allow-forms allow-same-origin allow-popups`.
**Risk:** `allow-popups` is enabled for all apps by default. While `allow-popups-to-escape-sandbox` is correctly omitted, widespread popup permission might be abused by 3rd party content if we ever host non-game apps.
**Recommendation:** Remove `allow-popups` from the default. Pass it explicitly only for the `Executor` (Game) app.

### 3. PostMessage Communication
**Severity:** LOW (Currently) -> HIGH (Future)
**Status:** ❓ Missing Implementation
**Observation:**
No `addEventListener('message')` handlers found in the codebase.
**Risk:** If games attempt to communicate with the Shell (e.g., "Game Over", "Save Score"), the Shell will ignore them. If added later without validation, it opens XSS risks.
**Requirement:** Any future implementation MUST validate `event.origin` and use a strict schema (e.g., Zod).

## Action List & Tests

### Fixes

1.  **Guard `window.sys`:**
    Modify `front/src/os/wm/WindowRegistry.tsx` and `SysBridge.tsx`:
    ```typescript
    useEffect(() => {
      if (import.meta.env.DEV) { // Vite specific check
        window.sys = { ... };
      }
    }, ...);
    ```

2.  **Harden AppHost Sandbox:**
    Change default sandbox in `front/src/os/apps/AppHost.tsx`:
    ```typescript
    // Removed allow-popups from default
    const sandboxAttr = sandbox || "allow-scripts allow-forms allow-same-origin";
    ```
    Update `Executor` (Game) usage to include `allow-popups`.

### New Security Tests

1.  **Prod Exposure Test (`front/__tests__/security/prod.exposure.test.ts`):**
    ```typescript
    it("does not expose window.sys in production", () => {
      vi.stubGlobal('import.meta', { env: { DEV: false } });
      render(<App />);
      expect(window.sys).toBeUndefined();
    });
    ```

2.  **Sandbox Attribute Test (`front/__tests__/security/sandbox.policy.test.tsx`):**
    ```typescript
    it("applies strict sandbox by default", () => {
      render(<AppHost src="..." />);
      const iframe = screen.getByRole('presentation'); // or title
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
      expect(iframe).not.toHaveAttribute('sandbox', expect.stringContaining('allow-popups'));
    });
    ```

3.  **VFS Write Protection (Guest):**
    *   Already planned in `vfs.core.test.ts`. Ensure it checks that `vfs.write` throws for non-system paths if we implement permissions later.
