import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import { PlatformProvider } from "./contexts/PlatformContext";
import { WindowRegistryProvider } from "./os/wm/WindowRegistry";
import { ShellRoot } from "./os/ShellRoot";
import "./retro.css";
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlatformProvider>
      <AuthProvider>
        <WindowRegistryProvider>
          <ShellRoot />
        </WindowRegistryProvider>
      </AuthProvider>
    </PlatformProvider>
  </React.StrictMode>
);
