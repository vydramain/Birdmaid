/**
 * Visual test entry - renders Explorer baseline for Playwright screenshots.
 * Minimal bootstrap: no auth, no landing, just Explorer in a viewport.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { PlatformProvider } from "./contexts/PlatformContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WindowRegistryProvider } from "./os/wm/WindowRegistry";
import { ExplorerWindow } from "./components/ExplorerWindow";
import "./retro.css";
import "./styles/index.scss";
import "./styles/style-guide.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlatformProvider initialPlatform="desktop">
      <AuthProvider>
        <WindowRegistryProvider>
          <div
            className="style-guide-explorer-viewport"
            data-section="explorer-baseline"
          >
            <ExplorerWindow />
          </div>
        </WindowRegistryProvider>
      </AuthProvider>
    </PlatformProvider>
  </React.StrictMode>
);
