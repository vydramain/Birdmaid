/**
 * MkdirDialog — Win95 dialog for Create folder.
 * @see docs/fps/FP7.md — Create folder, D-CM1, AC-CM16/17
 * @see docs/style/DESIGN_SYSTEM_98.css.md
 */

import React, { useState, useEffect, useRef } from "react";
import { Win95MessageBox } from "./Win95MessageBox";

const FORBIDDEN_CHARS = /[\\./:*?"<>|]/;
const INVALID_NAME_MSG = "Invalid folder name.";
const EXISTS_MSG = "A file with that name already exists.";
const PERMISSION_MSG = "You do not have permission to create folders here.";

function validateFolderName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Please enter a name.";
  if (FORBIDDEN_CHARS.test(trimmed)) return "A file name cannot contain any of the following characters: \\ / : * ? \" < > |";
  if (trimmed.includes("..")) return INVALID_NAME_MSG;
  return null;
}

export type MkdirDialogProps = {
  open: boolean;
  targetPath: string;
  onConfirm: (fullPath: string) => Promise<void>;
  onCancel: () => void;
};

export function MkdirDialog({ open, targetPath, onConfirm, onCancel }: MkdirDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validationError = validateFolderName(name);
  const canSubmit = !loading && !validationError && name.trim().length > 0;

  useEffect(() => {
    if (open) {
      setName("");
      setErrorMessage(null);
      setMessageBoxOpen(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const trimmed = name.trim();
    const fullPath = targetPath === "/" ? `/${trimmed}` : `${targetPath}/${trimmed}`;

    setLoading(true);
    setErrorMessage(null);
    try {
      await onConfirm(fullPath);
      onCancel();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("file with that name")) {
        setErrorMessage(EXISTS_MSG);
      } else if (msg.includes("Permission") || msg.includes("403") || msg.includes("Forbidden")) {
        setErrorMessage(PERMISSION_MSG);
      } else {
        setErrorMessage(msg || INVALID_NAME_MSG);
      }
      setMessageBoxOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  if (!open) return null;

  const isTargetValid = targetPath && targetPath !== "/" && /^\/Disk [ABC](?:\/|$)/.test(targetPath);

  return (
    <>
      <div
        className="win95-modal-overlay"
        data-testid="mkdir-dialog-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          className="win-window-base win95-modal mkdir-dialog"
          onClick={(e) => e.stopPropagation()}
          data-testid="mkdir-dialog"
        >
          <header className="win-titlebar">
            <div className="title">
              <span>◆</span>
              <span>Create folder</span>
            </div>
            <button
              type="button"
              className="win-caption-button win-caption-button-close"
              aria-label="Close"
              onClick={onCancel}
            />
          </header>
          <div className="content">
            {!isTargetValid ? (
              <p className="win95-message-box-text">Select a folder first.</p>
            ) : (
              <>
                <label htmlFor="mkdir-input" className="mkdir-dialog-label">
                  Folder name:
                </label>
                <input
                  ref={inputRef}
                  id="mkdir-input"
                  type="text"
                  className="win-input win95-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="New Folder"
                  disabled={loading}
                  aria-label="Folder name"
                  data-testid="mkdir-input"
                />
                {validationError && (
                  <p className="mkdir-dialog-validation">{validationError}</p>
                )}
              </>
            )}
            <div className="mkdir-dialog-actions">
              <button
                type="button"
                className="win-btn win-btn-default"
                onClick={handleSubmit}
                disabled={!canSubmit || !isTargetValid}
                data-testid="mkdir-ok"
              >
                {loading ? "..." : "OK"}
              </button>
              <button
                type="button"
                className="win-btn win-btn-default"
                onClick={onCancel}
                disabled={loading}
                data-testid="mkdir-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <Win95MessageBox
        open={messageBoxOpen}
        message={errorMessage || INVALID_NAME_MSG}
        title="Error"
        onClose={() => setMessageBoxOpen(false)}
      />
    </>
  );
}
