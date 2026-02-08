import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { PlatformProvider } from "../../contexts/PlatformContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { WindowRegistryProvider } from "../../os/wm/WindowRegistry";
import { ContextMenuProvider } from "../../os/ui/ContextMenu";
import { ShellRoot } from "../../os/ShellRoot";

// Types
type PlatformType = "desktop" | "mobile";

interface CommonRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  platform?: PlatformType;
}

/**
 * renderAppRoot: Renders ShellRoot (shell-only architecture, FP7 v2).
 * Use this when testing the full application.
 * 
 * Includes: Platform, Auth, WindowRegistry, ShellRoot.
 */
export function renderAppRoot(options: CommonRenderOptions = {}) {
  const { platform = "desktop", ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <WindowRegistryProvider>
            <ContextMenuProvider>
              {children}
            </ContextMenuProvider>
          </WindowRegistryProvider>
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(<ShellRoot />, { wrapper: Wrapper, ...renderOptions });
}

/**
 * renderShell: Renders components within the full OS environment.
 * Use this for integration tests involving windows, taskbar, desktop, or full page flows.
 * 
 * Includes: Platform, Auth, WindowRegistry, ContextMenuProvider.
 */
export function renderShell(ui: React.ReactElement, options: CommonRenderOptions = {}) {
  const { platform = "desktop", ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <WindowRegistryProvider>
            <ContextMenuProvider>
              {children}
            </ContextMenuProvider>
          </WindowRegistryProvider>
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * renderFeature: Renders components with minimal context.
 * Use this for unit tests of specific components (buttons, inputs) or features 
 * that don't depend on the Window Manager.
 * 
 * Includes: Platform, Auth.
 */
export function renderFeature(ui: React.ReactElement, options: CommonRenderOptions = {}) {
  const { platform = "desktop", ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from RTL
export * from "@testing-library/react";

/**
 * renderWithContextMenu: Renders components with ContextMenuProvider.
 * Use for tests that need context menu (Desktop, Explorer) to open.
 */
export function renderWithContextMenu(ui: React.ReactElement, options: CommonRenderOptions = {}) {
  const { platform = "desktop", ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <WindowRegistryProvider>
            <ContextMenuProvider>
              {children}
            </ContextMenuProvider>
          </WindowRegistryProvider>
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Deprecated: Alias 'render' to 'renderShell' for backward compatibility during migration
// TODO: Migrate all tests to use renderAppRoot, renderShell, or renderFeature explicitly
export { renderShell as render };
