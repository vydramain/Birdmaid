import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { MobileApp } from "./MobileApp";
import "@/retro.css";
import "@/styles/index.scss";

/**
 * Mobile App Entry Point
 *
 * Separate mobile application with WM6 styling.
 * Uses same API/auth/vfs as desktop.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlatformProvider initialPlatform="mobile">
      <AuthProvider>
        <MobileApp />
      </AuthProvider>
    </PlatformProvider>
  </React.StrictMode>
);
