import { useState } from "react";
import { useWindowRegistry } from "../wm/WindowRegistry";
import { useAuth } from "../../contexts/AuthContext";

type LoginWindowProps = {
  onClose?: () => void;
};

const isDevAuthEnabled = () =>
  import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.VITE_DEV_AUTH === "1";

/**
 * LoginWindow - Win95 dialog "Welcome to Windows"
 *
 * Contains:
 * - Title: "Welcome to Windows"
 * - Message: "Please log in to continue"
 * - Button: "Telegram..." (opens IE window with Telegram login page, or devAuth when VITE_DEV_AUTH=true)
 * - Button: "Cancel" (closes window)
 */
export function LoginWindow({ onClose }: LoginWindowProps) {
  const { openWindow } = useWindowRegistry();
  const { devAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTelegram = async () => {
    if (isDevAuthEnabled()) {
      setError(null);
      setLoading(true);
      try {
        await devAuth(undefined, "Organizer");
        onClose?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Dev auth failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Build Telegram OAuth URL
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID || "YOUR_BOT_ID";
    const origin = window.location.origin;
    const telegramUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&request_access=write`;

    openWindow("internetexplorer", {
      content: { src: telegramUrl },
    });
    onClose?.();
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div data-testid="login-window" className="login-window-container">
      <div className="login-window-content">
        <div data-testid="login-window-title" className="login-window-title">
          Welcome to Windows
        </div>
        <div className="login-window-message">
          Please log in to continue
        </div>
        {error && (
          <div data-testid="login-window-error" className="login-window-error">
            {error}
          </div>
        )}
        <div className="login-window-buttons">
          <button
            data-testid="login-window-telegram-button"
            type="button"
            onClick={handleTelegram}
            className="win-btn win-btn-default"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Telegram..."}
          </button>
          <button
            data-testid="login-window-cancel-button"
            type="button"
            onClick={handleCancel}
            className="win-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
