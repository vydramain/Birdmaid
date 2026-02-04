import { useState, useRef, useEffect, ReactNode, CSSProperties } from "react";
import { CaptionButtons } from "../../ui/primitives";

type Win95ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  open: boolean;
};

export function Win95Modal({ title, children, onClose, open }: Win95ModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine modal type for styling
  const isGameModal = title === "Game";
  const isAuthenticationModal = title === "Authentication";
  const isTeamModal = title.startsWith("Team:");
  const isHelpModal = title.startsWith("Help");
  const isErrorModal = title === "Error";
  const isCompactModal = isAuthenticationModal || isTeamModal || isHelpModal || isErrorModal;

  const modalStyles: CSSProperties = {
    minWidth: isAuthenticationModal ? "17.5rem" : isTeamModal ? "15.625rem" : isGameModal ? "37.5rem" : "25rem",
    maxWidth: isGameModal ? "90vw" : isAuthenticationModal ? "20rem" : isTeamModal ? "21.875rem" : "90vw",
    maxHeight: isCompactModal ? "auto" : "90vh",
    width: isGameModal ? "90vw" : "auto",
    height: isCompactModal ? "auto" : undefined,
  };

  const contentStyles: CSSProperties = {
    padding: isGameModal ? "0" : isCompactModal ? "0.5rem" : "0.75rem",
    overflow: isGameModal ? "hidden" : "auto",
    flex: "none",
    display: "flex",
    flexDirection: "column",
    minHeight: isGameModal ? undefined : "7.5rem",
  };

  useEffect(() => {
    if (open && modalRef.current) {
      // Center modal on open
      const rect = modalRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2,
      });
    }
  }, [open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".win-titlebar")) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!open) return null;

  return (
    <div
      className="win95-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="win-window-base win95-modal"
        style={
          // inline-style: allowed (reason: drag/resize; why: modal position from mouse drag; revisit: FP7)
          {
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${position.x}px, ${position.y}px)`,
            ...modalStyles,
          }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="win-titlebar"
          onMouseDown={handleMouseDown}
          style={
            // inline-style: allowed (reason: drag/resize; why: cursor during modal drag; revisit: FP7)
            { cursor: isDragging ? "grabbing" : "grab" }
          }
        >
          <div className="title">
            <span>◆</span>
            <span>{title}</span>
          </div>
          <CaptionButtons onClose={onClose} />
        </header>
        <div className="content" style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
}

