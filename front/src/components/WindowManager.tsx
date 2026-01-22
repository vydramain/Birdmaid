import { useWindow } from "../contexts/WindowContext";
import { Window } from "./Window";
import { ExplorerWindow } from "./ExplorerWindow";
import { HelpWindow } from "./HelpWindow";
import { LandingWindow } from "./LandingWindow";
import { GameWindow } from "./GameWindow";

export function WindowManager() {
  const { windows } = useWindow();

  return (
    <>
      {windows.map((window) => {
        switch (window.type) {
          case "explorer":
            return (
              <Window key={window.id} window={window} title="Explorer">
                <ExplorerWindow />
              </Window>
            );
          case "help":
            return (
              <Window key={window.id} window={window} title="HELP.TXT">
                <HelpWindow />
              </Window>
            );
          case "landing":
            return (
              <Window 
                key={window.id} 
                window={window} 
                title="Welcome"
                onClose={() => {
                  localStorage.setItem("birdmaid_landing_seen", "true");
                }}
              >
                <LandingWindow />
              </Window>
            );
          case "game":
            return (
              <Window key={window.id} window={window} title={window.content?.title || "Game"}>
                <GameWindow buildUrl={window.content?.buildUrl} />
              </Window>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
