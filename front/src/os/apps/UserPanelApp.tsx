import { useAuth, UserRole } from "../../contexts/AuthContext";

type UserPanelAppProps = {
  onClose?: () => void;
};

/**
 * UserPanelApp - Windows 95 styled user panel window.
 *
 * Displays:
 * - Username
 * - Role (Guest / Participant / Organizer)
 * - Logout button
 * - (for Organizer) Management functions link/button (stub)
 */
export function UserPanelApp({ onClose }: UserPanelAppProps) {
  const auth = useAuth();
  const user = auth.user;
  const role: UserRole = user?.role || (user?.isSuperAdmin ? "Organizer" : "Guest");

  const handleLogout = () => {
    auth.logout();
    if (onClose) onClose();
  };

  const handleManagement = () => {
    // Stub: Management functions (not implemented yet)
    alert("Management functions (stub) - coming soon");
  };

  return (
    <div data-testid="user-panel-window" className="user-panel-container">
      {/* User Info Section */}
      <div className="user-panel-info">
        <div className="user-panel-title">User Information</div>
        {user ? (
          <>
            <div className="user-panel-field">
              <strong>Username:</strong> {user.login}
            </div>
            <div className="user-panel-field">
              <strong>Role:</strong> {role}
            </div>
            {user.email && (
              <div className="user-panel-field">
                <strong>Email:</strong> {user.email}
              </div>
            )}
          </>
        ) : (
          <div className="user-panel-disabled">Not logged in</div>
        )}
      </div>

      {/* Actions Section */}
      <div className="user-panel-actions">
        {/* Management Functions (Organizer only) */}
        {role === "Organizer" && (
          <button
            type="button"
            onClick={handleManagement}
            className="win-btn-default user-panel-button"
          >
            Management Functions (stub)
          </button>
        )}

        {/* Logout Button */}
        <button
          data-testid="user-logout"
          type="button"
          onClick={handleLogout}
          className="win-btn-default user-panel-button"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
