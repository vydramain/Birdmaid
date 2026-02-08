import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import { PlatformProvider } from "./contexts/PlatformContext";
import { WindowRegistryProvider } from "./os/wm/WindowRegistry";
import { ContextMenuProvider } from "./os/ui/ContextMenu";
import { ShellRoot } from "./os/ShellRoot";
import "./retro.css";
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlatformProvider>
      <AuthProvider>
        <WindowRegistryProvider>
          <ContextMenuProvider>
            <ShellRoot />
          </ContextMenuProvider>
        </WindowRegistryProvider>
      </AuthProvider>
    </PlatformProvider>
  </React.StrictMode>
);
