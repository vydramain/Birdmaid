import { appRegistry } from "./AppRegistry";
import { AppHost } from "./AppHost";
import { ExplorerWindow } from "../../components/ExplorerWindow";
import { HelpWindow } from "../../components/HelpWindow";
import { LandingWindow } from "../../components/LandingWindow";

// Helper to wrap legacy components
const wrap = (Component: React.ComponentType<any>) => (props: any) => <Component {...props} />;

export function initApps() {
  // Explorer
  appRegistry.register({
    id: "explorer",
    name: "Explorer",
    icon: "📁",
    component: wrap(ExplorerWindow),
    defaultWidth: 600,
    defaultHeight: 400,
    singleton: false,
  });

  // Help
  appRegistry.register({
    id: "help",
    name: "HELP.TXT",
    icon: "❓",
    component: wrap(HelpWindow),
    defaultWidth: 500,
    defaultHeight: 600,
    singleton: true,
  });

  // Landing
  appRegistry.register({
    id: "landing",
    name: "Welcome",
    icon: "👋",
    component: (props: any) => (
      <LandingWindow 
        onClose={() => {
          localStorage.setItem("birdmaid_landing_seen", "true");
          // Logic to close window passed via props?
          // We might need to handle this inside LandingWindow or pass close handler
        }} 
      />
    ),
    defaultWidth: 500,
    defaultHeight: 400,
    singleton: true,
  });

  // Executor (Game Runner)
  appRegistry.register({
    id: "executor",
    name: "Game",
    icon: "🎮",
    component: (props: any) => {
      // Expect props.buildUrl
      return (
        <AppHost 
          src={props.buildUrl || "about:blank"} 
          title={props.title} 
        />
      );
    },
    defaultWidth: 800,
    defaultHeight: 600,
    singleton: false,
  });
}

// Auto-init
initApps();
