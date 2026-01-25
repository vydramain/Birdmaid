import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlatformProvider } from "../../contexts/PlatformContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { WindowRegistryProvider } from "../../os/wm/WindowRegistry";
import { WindowPositionProvider } from "../../contexts/WindowPositionContext";
import App from "../../App.tsx";

// Types
type PlatformType = "desktop" | "mobile";

interface CommonRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
  platform?: PlatformType;
}

/**
 * renderAppRoot: Renders App component with Router.
 * Use this when testing App.tsx which contains <Routes> and expects Router above.
 * 
 * Includes: Platform, Auth, WindowRegistry, WindowPosition, Router, App.
 */
export function renderAppRoot(options: CommonRenderOptions = {}) {
  const { route, initialEntries, platform = "desktop", ...renderOptions } = options;
  const entries = route ? [route] : (initialEntries || ["/"]);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <WindowRegistryProvider>
            <WindowPositionProvider>
              <MemoryRouter initialEntries={entries}>
                {children}
              </MemoryRouter>
            </WindowPositionProvider>
          </WindowRegistryProvider>
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(<App />, { wrapper: Wrapper, ...renderOptions });
}

/**
 * renderShell: Renders components within the full OS environment.
 * Use this for integration tests involving windows, taskbar, desktop, or full page flows.
 * 
 * Includes: Platform, Auth, WindowRegistry, WindowPosition, Router.
 * 
 * NOTE: Do NOT use this with <App /> - use renderAppRoot() instead.
 */
export function renderShell(ui: React.ReactElement, options: CommonRenderOptions = {}) {
  const { route, initialEntries, platform = "desktop", ...renderOptions } = options;
  const entries = route ? [route] : (initialEntries || ["/"]);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <WindowRegistryProvider>
            <WindowPositionProvider>
              <MemoryRouter initialEntries={entries}>
                {children}
              </MemoryRouter>
            </WindowPositionProvider>
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
 * Includes: Platform, Auth, Router.
 */
export function renderFeature(ui: React.ReactElement, options: CommonRenderOptions = {}) {
  const { route, initialEntries, platform = "desktop", ...renderOptions } = options;
  const entries = route ? [route] : (initialEntries || ["/"]);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PlatformProvider initialPlatform={platform}>
        <AuthProvider>
          <MemoryRouter initialEntries={entries}>
            {children}
          </MemoryRouter>
        </AuthProvider>
      </PlatformProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from RTL
export * from "@testing-library/react";

// Deprecated: Alias 'render' to 'renderShell' for backward compatibility during migration
// TODO: Migrate all tests to use renderAppRoot, renderShell, or renderFeature explicitly
export { renderShell as render };
