import { useAuth } from "../../contexts/AuthContext";
import { useWindowRegistry } from "../wm/WindowRegistry";

type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * StartMenu - Windows 95 styled start menu shell.
 *
 * Win95-authentic empty shell with:
 * - Left vertical "Windows 95" brand strip
 * - Single menu item: "Log In..." (guest) or "Log Out..." (authed)
 */
export function StartMenu({ isOpen, onClose }: StartMenuProps) {
  const auth = useAuth();
  const { openWindow } = useWindowRegistry();

  const isLoggedIn = auth.user !== null && auth.state === "authed";

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
      <div className="start-menu-backdrop" onClick={onClose} />
      <div data-testid="start-menu" className="start-menu">
        <div data-testid="start-menu-brand" className="start-menu-brand">
          Omsky Gamedev
        </div>
        <div className="start-menu-content">
          <div className="start-menu-spacer" />
          <div className="start-menu-separator" />
          {isLoggedIn ? (
            <button
              data-testid="start-menu-item"
              type="button"
              className="start-menu-item start-menu-item-primary"
              onClick={handleLogout}
            >
              Log Out...
            </button>
          ) : (
            <button
              data-testid="start-menu-item"
              type="button"
              className="start-menu-item start-menu-item-primary"
              onClick={handleLogin}
            >
              Log In...
            </button>
          )}
        </div>
      </div>
    </>
  );
}
