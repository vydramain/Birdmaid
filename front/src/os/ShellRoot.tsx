import { usePlatform } from "../contexts/PlatformContext";
import { DesktopPage } from "../pages/DesktopPage";

export function ShellRoot() {
  const { isMobile } = usePlatform();

  if (isMobile) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'white', background: '#000', height: '100vh' }}>
        <h1>Mobile View</h1>
        <p>Coming Soon (FP8)</p>
        <button onClick={() => {
          localStorage.setItem("birdmaid_platform", "desktop");
          window.location.reload();
        }}>
          Switch to Desktop
        </button>
      </div>
    );
  }

  return <DesktopPage />;
}
