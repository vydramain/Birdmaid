/**
 * MobileShell - Windows Mobile 6.0 styled mobile application (stub).
 *
 * Future implementation:
 * - WM6 styled UI
 * - Screen-based "applications"
 * - Content opening in WM6-style apps
 */
export function MobileShell() {
  return (
    <div className="mobile-shell">
      <h1>Mobile View</h1>
      <p>Coming Soon (FP8)</p>
      <button
        onClick={() => {
          localStorage.setItem("birdmaid_platform", "desktop");
          window.location.reload();
        }}
      >
        Switch to Desktop
      </button>
    </div>
  );
}
