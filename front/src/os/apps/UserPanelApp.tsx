import { useAuth, UserRole } from "../../contexts/AuthContext";
import { buttons, colors, spacing, typography } from "../../ui/win95/tokens";

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
  const role: UserRole = user?.role || (user?.isSuperAdmin ? 'Organizer' : 'Guest');

  const handleLogout = () => {
    auth.logout();
    if (onClose) onClose();
  };

  const handleManagement = () => {
    // Stub: Management functions (not implemented yet)
    alert("Management functions (stub) - coming soon");
  };

  return (
    <div
      data-testid="user-panel-window"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
        padding: spacing.md,
        minHeight: "200px",
      }}
    >
      {/* User Info Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.sm,
          padding: spacing.md,
          ...{
            borderTop: `1px solid ${colors.grayDark}`,
            borderLeft: `1px solid ${colors.grayDark}`,
            borderRight: `1px solid ${colors.white}`,
            borderBottom: `1px solid ${colors.white}`,
            boxShadow: `inset 1px 1px 0 ${colors.black}`,
          },
          backgroundColor: colors.white,
        }}
      >
        <div style={{ fontSize: typography.fontSize.normal, fontWeight: typography.fontWeight.bold }}>
          User Information
        </div>
        {user ? (
          <>
            <div style={{ fontSize: typography.fontSize.normal }}>
              <strong>Username:</strong> {user.login}
            </div>
            <div style={{ fontSize: typography.fontSize.normal }}>
              <strong>Role:</strong> {role}
            </div>
            {user.email && (
              <div style={{ fontSize: typography.fontSize.normal }}>
                <strong>Email:</strong> {user.email}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: typography.fontSize.normal, color: colors.textDisabled }}>
            Not logged in
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.sm,
        }}
      >
        {/* Management Functions (Organizer only) */}
        {role === 'Organizer' && (
          <button
            type="button"
            onClick={handleManagement}
            style={{
              ...buttons.default,
              alignSelf: "flex-start",
            }}
          >
            Management Functions (stub)
          </button>
        )}

        {/* Logout Button */}
        <button
          data-testid="user-logout"
          type="button"
          onClick={handleLogout}
          style={{
            ...buttons.default,
            alignSelf: "flex-start",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
