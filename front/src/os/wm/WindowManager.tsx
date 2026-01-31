import { useEffect, useState } from "react";
import { useWindowRegistry } from "./WindowRegistry";
import { WindowFrame } from "./WindowFrame";
import { windowStore } from "./WindowStore";
import { appRegistry } from "../apps/AppRegistry";

export function WindowManager() {
  const { windows, closeWindow } = useWindowRegistry();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return windowStore.subscribeGlobalDrag(setIsDragging);
  }, []);

  return (
    <>
      {isDragging && (
        <div
          // inline-style: allowed (reason: drag/resize)
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "transparent",
            pointerEvents: "auto",
          }}
        />
      )}
      {windows.map((win) => {
        const app = appRegistry.get(win.appId);
        let ContentComponent = null;

        if (app) {
          ContentComponent = app.component;
        }

        const isGame = win.appId === "executor";
        const contentProps = { ...win.content, onClose: () => closeWindow(win.id) };

        return (
          <WindowFrame
            key={win.id}
            id={win.id}
            title={win.title}
            onClose={() => {
              if (win.appId === "landing") {
                localStorage.setItem("birdmaid_landing_seen", "true");
              }
              closeWindow(win.id);
            }}
          >
            <div
              className={
                isGame ? "win-content-wrapper win-content-wrapper-game" : "win-content-wrapper"
              }
            >
              {ContentComponent ? (
                <ContentComponent {...contentProps} />
              ) : (
                <div>Unknown App: {win.appId}</div>
              )}
            </div>
          </WindowFrame>
        );
      })}
    </>
  );
}
