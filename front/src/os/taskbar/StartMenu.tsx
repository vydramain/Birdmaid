import { useAuth } from "../../contexts/AuthContext";
import { useWindowRegistry } from "../wm/WindowRegistry";

type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * StartMenu - Windows 95 styled start menu.
 * 
 * Contains:
 * - Log In... (enabled if guest, disabled if authed)
 * - Log Out... (enabled if authed, disabled if guest)
 */
export function StartMenu({ isOpen, onClose }: StartMenuProps) {
  const auth = useAuth();
  const { openWindow } = useWindowRegistry();

  const isLoggedIn = auth.user !== null && auth.state === 'authed';

  const handleLogin = () => {
    if (!isLoggedIn) {
      openWindow("login-window");
      onClose();
    }
  };

  const handleLogout = () => {
    if (isLoggedIn) {
      openWindow("logout-confirmation");
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop to close menu on click outside */}
      <div
        className="start-menu-backdrop"
        onClick={onClose}
        // inline-style: allowed (reason: layout-calc, fullscreen backdrop)
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
      />
      {/* Menu */}
      <div
        data-testid="start-menu"
        className="start-menu"
        // inline-style: allowed (reason: layout-calc, positioned menu)
        style={{
          position: "fixed",
          bottom: "40px", // Above taskbar
          left: "4px",
          zIndex: 9999,
          minWidth: "150px",
        }}
      >
        <button
          data-testid="start-menu-item-login"
          type="button"
          onClick={handleLogin}
          disabled={isLoggedIn}
          className="start-menu-item"
        >
          Log In...
        </button>
        <button
          data-testid="start-menu-item-logout"
          type="button"
          onClick={handleLogout}
          disabled={!isLoggedIn}
          className="start-menu-item"
        >
          Log Out...
        </button>
      </div>
    </>
  );
}
