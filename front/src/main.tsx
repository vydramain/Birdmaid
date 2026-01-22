import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WindowPositionProvider } from "./contexts/WindowPositionContext";
import { WindowProvider } from "./contexts/WindowContext";
import App from "./App";
import "./retro.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WindowPositionProvider>
          <WindowProvider>
            <App />
          </WindowProvider>
        </WindowPositionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
