import { useAuth } from "../../contexts/AuthContext";

type LogoutConfirmationDialogProps = {
  onClose?: () => void;
};

/**
 * LogoutConfirmationDialog - Win95 dialog for logout confirmation
 * 
 * Contains:
 * - Message: "Are you sure you want to log out?"
 * - Button: "Yes" (logs out)
 * - Button: "No" (closes dialog)
 */
export function LogoutConfirmationDialog({ onClose }: LogoutConfirmationDialogProps) {
  const auth = useAuth();

  const handleYes = () => {
    auth.logout();
    if (onClose) {
      onClose();
    }
  };

  const handleNo = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div data-testid="logout-confirmation-dialog" className="logout-dialog-container">
      <div className="logout-dialog-content">
        <div className="logout-dialog-message">
          Are you sure you want to log out?
        </div>
        <div className="logout-dialog-buttons">
          <button
            data-testid="logout-dialog-yes"
            type="button"
            onClick={handleYes}
            className="win-btn-default"
          >
            Yes
          </button>
          <button
            data-testid="logout-dialog-no"
            type="button"
            onClick={handleNo}
            className="win-btn"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
