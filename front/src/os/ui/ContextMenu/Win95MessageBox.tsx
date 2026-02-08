/**
 * Win95 MessageBox — modal for error/info messages.
 * @see docs/fps/FP7.md — AC-CM7, AC-CM8, D-CM4
 */

import React, { useEffect, useCallback } from "react";

export type Win95MessageBoxProps = {
  open: boolean;
  message: string;
  title?: string;
  onClose: () => void;
};

export function Win95MessageBox({ open, message, title = "Error", onClose }: Win95MessageBoxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="win95-modal-overlay"
      data-testid="win95-message-box-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="win-window-base win95-modal win95-message-box"
        onClick={(e) => e.stopPropagation()}
        data-testid="win95-message-box"
      >
        <header className="win-titlebar">
          <div className="title">
            <span>◆</span>
            <span>{title}</span>
          </div>
          <button
            type="button"
            className="win-caption-button win-caption-button-close"
            aria-label="Close"
            onClick={onClose}
          />
        </header>
        <div className="content">
          <p className="win95-message-box-text">{message}</p>
          <div className="win95-message-box-actions">
            <button
              type="button"
              className="win-btn win-btn-default"
              onClick={onClose}
              data-testid="message-box-ok"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
