import { useWindowRegistry } from "../wm/WindowRegistry";

type LoginWindowProps = {
  onClose?: () => void;
};

/**
 * LoginWindow - Win95 dialog "Welcome to Windows"
 * 
 * Contains:
 * - Title: "Welcome to Windows"
 * - Message: "Please log in to continue"
 * - Button: "Telegram..." (opens IE window with Telegram login page)
 * - Button: "Cancel" (closes window)
 */
export function LoginWindow({ onClose }: LoginWindowProps) {
  const { openWindow } = useWindowRegistry();

  const handleTelegram = () => {
    // Build Telegram OAuth URL
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID || "YOUR_BOT_ID";
    const origin = window.location.origin;
    const telegramUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&request_access=write`;
    
    // Open IE window with Telegram login page
    openWindow("internetexplorer", {
      content: {
        src: telegramUrl,
      },
    });
    
    if (onClose) {
      onClose();
    }
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
        <div className="login-window-buttons">
          <button
            data-testid="login-window-telegram-button"
            type="button"
            onClick={handleTelegram}
            className="win-btn-default"
          >
            Telegram...
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
