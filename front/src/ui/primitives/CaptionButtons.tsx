/**
 * CaptionButtons Primitive
 * 
 * Window control buttons (minimize, maximize, close).
 * Uses only SCSS classes, no inline styles.
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ButtonHTMLAttributes } from "react";

type CaptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  type: "minimize" | "maximize" | "close";
  "data-testid"?: string;
};

export function CaptionButton({ 
  type, 
  className = "", 
  "data-testid": testId,
  ...props 
}: CaptionButtonProps) {
  const label = type === "minimize" ? "−" : type === "maximize" ? "□" : "×";
  
  return (
    <button 
      className={`win-caption-button win-caption-button-${type} ${className}`}
      aria-label={`${type} window`}
      data-testid={testId}
      {...props}
    >
      {label}
    </button>
  );
}

type CaptionButtonsProps = {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  "data-testid"?: string;
};

export function CaptionButtons({ 
  onMinimize, 
  onMaximize, 
  onClose,
  "data-testid": testId,
}: CaptionButtonsProps) {
  return (
    <div className="win-window-controls" data-testid={testId}>
      {onMinimize && (
        <CaptionButton 
          type="minimize" 
          onClick={onMinimize}
          data-testid={testId ? `${testId}-minimize` : undefined}
        />
      )}
      {onMaximize && (
        <CaptionButton 
          type="maximize" 
          onClick={onMaximize}
          data-testid={testId ? `${testId}-maximize` : undefined}
        />
      )}
      {onClose && (
        <CaptionButton 
          type="close" 
          onClick={onClose}
          data-testid={testId ? `${testId}-close` : undefined}
        />
      )}
    </div>
  );
}
