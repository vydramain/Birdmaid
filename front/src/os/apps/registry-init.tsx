import { appRegistry } from "./AppRegistry";
import { AppHost } from "./AppHost";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { Notepad } from "./Notepad";
import { InternetExplorer } from "./InternetExplorer";
import { UserPanelApp } from "./UserPanelApp";
import { StyleGuideApp } from "./StyleGuideApp";
import { LoginWindow } from "./LoginWindow";
import { LogoutConfirmationDialog } from "./LogoutConfirmationDialog";
import { ExplorerWindow } from "../../components/ExplorerWindow";
import { HelpWindow } from "../../components/HelpWindow";
import { LandingWindow } from "../../components/LandingWindow";
import { resolveIconForApp } from "../../ui/icons";

// Helper to wrap legacy components
const wrap = (Component: React.ComponentType<any>) => (props: any) => <Component {...props} />;

export function initApps() {
  // Explorer
  appRegistry.register({
    id: "explorer",
    name: "Explorer",
    icon: resolveIconForApp("explorer"),
    component: wrap(ExplorerWindow),
    defaultWidth: 600,
    defaultHeight: 400,
    singleton: false,
  });

  // ImageViewer
  appRegistry.register({
    id: "imageviewer",
    name: "Image Viewer",
    icon: resolveIconForApp("imageviewer"),
    component: (props: any) => <ImageViewer content={props.content} />,
    defaultWidth: 600,
    defaultHeight: 500,
    singleton: false,
  });

  // VideoViewer
  appRegistry.register({
    id: "videoviewer",
    name: "Video Viewer",
    icon: resolveIconForApp("videoviewer"),
    component: (props: any) => <VideoViewer content={props.content} />,
    defaultWidth: 800,
    defaultHeight: 600,
    singleton: false,
  });

  // Notepad
  appRegistry.register({
    id: "notepad",
    name: "Notepad",
    icon: resolveIconForApp("notepad"),
    component: (props: any) => <Notepad content={props.content} />,
    defaultWidth: 500,
    defaultHeight: 600,
    singleton: false,
  });

  // Internet Explorer
  appRegistry.register({
    id: "internetexplorer",
    name: "Internet Explorer",
    icon: resolveIconForApp("internetexplorer"),
    component: (props: any) => <InternetExplorer content={props.content} />,
    defaultWidth: 800,
    defaultHeight: 600,
    singleton: false,
  });

  // Executor (Game Runner / Webapp Host)
  appRegistry.register({
    id: "executor",
    name: "Application",
    icon: resolveIconForApp("executor"),
    component: (props: any) => {
      // Expect props.src or props.buildUrl
      return (
        <AppHost 
          src={props.src || props.buildUrl || "about:blank"} 
          title={props.title} 
        />
      );
    },
    defaultWidth: 800,
    defaultHeight: 600,
    singleton: false,
  });

  // Help (legacy)
  appRegistry.register({
    id: "help",
    name: "HELP.TXT",
    icon: resolveIconForApp("help"),
    component: wrap(HelpWindow),
    defaultWidth: 500,
    defaultHeight: 600,
    singleton: true,
  });

  // Landing (legacy)
  appRegistry.register({
    id: "landing",
    name: "Welcome",
    icon: resolveIconForApp("landing"),
    component: (props: any) => (
      <LandingWindow 
        onClose={() => {
          localStorage.setItem("birdmaid_landing_seen", "true");
        }} 
      />
    ),
    defaultWidth: 500,
    defaultHeight: 400,
    singleton: true,
  });

  // User Panel (system app)
  appRegistry.register({
    id: "userpanel",
    name: "User Panel",
    icon: resolveIconForApp("userpanel"),
    component: (props: any) => <UserPanelApp onClose={props.onClose} />,
    defaultWidth: 300,
    defaultHeight: 250,
    singleton: true,
  });

  // Style Guide (design reference)
  appRegistry.register({
    id: "styleguide",
    name: "Style Guide",
    icon: resolveIconForApp("styleguide"),
    component: (props: any) => <StyleGuideApp />,
    defaultWidth: 800,
    defaultHeight: 900,
    singleton: false,
  });

  // Login Window (system app)
  appRegistry.register({
    id: "login-window",
    name: "Welcome to Windows",
    icon: resolveIconForApp("login"),
    component: (props: any) => <LoginWindow onClose={props.onClose} />,
    defaultWidth: 400,
    defaultHeight: 200,
    singleton: true,
  });

  // Logout Confirmation Dialog (system app)
  appRegistry.register({
    id: "logout-confirmation",
    name: "Log Out",
    icon: resolveIconForApp("logout"),
    component: (props: any) => <LogoutConfirmationDialog onClose={props.onClose} />,
    defaultWidth: 300,
    defaultHeight: 150,
    singleton: true,
  });

  // Register content type mappings
  appRegistry.registerContentType('image', 'imageviewer');
  appRegistry.registerContentType('video', 'videoviewer');
  appRegistry.registerContentType('txt', 'notepad');
  appRegistry.registerContentType('html', 'internetexplorer');
  appRegistry.registerContentType('webapp', 'executor');

  // Register file extension mappings
  // Images
  appRegistry.registerExtension('.png', 'imageviewer');
  appRegistry.registerExtension('.jpg', 'imageviewer');
  appRegistry.registerExtension('.jpeg', 'imageviewer');
  appRegistry.registerExtension('.gif', 'imageviewer');
  appRegistry.registerExtension('.webp', 'imageviewer');

  // Videos
  appRegistry.registerExtension('.mp4', 'videoviewer');
  appRegistry.registerExtension('.webm', 'videoviewer');
  appRegistry.registerExtension('.ogg', 'videoviewer');

  // Text files
  appRegistry.registerExtension('.txt', 'notepad');
  appRegistry.registerExtension('.md', 'notepad');

  // HTML files
  appRegistry.registerExtension('.html', 'internetexplorer');
  appRegistry.registerExtension('.htm', 'internetexplorer');

  // Webapp files
  appRegistry.registerExtension('.app', 'executor');
}

// Auto-init
initApps();
