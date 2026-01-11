import { useState, useRef, useEffect, ReactNode, CSSProperties } from "react";

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

  // Calculate modal dimensions based on type
  const modalStyles: CSSProperties = {
    minWidth: isAuthenticationModal ? "280px" : isTeamModal ? "250px" : isGameModal ? "600px" : "400px",
    maxWidth: isGameModal ? "90vw" : isAuthenticationModal ? "320px" : isTeamModal ? "350px" : "90vw",
    maxHeight: isCompactModal ? "auto" : isGameModal ? "90vh" : "90vh",
    width: isGameModal ? "90vw" : "auto",
    height: isCompactModal ? "auto" : undefined,
  };

  // Calculate content styles
  const contentStyles: CSSProperties = {
    padding: isGameModal ? "0" : isCompactModal ? "8px" : "12px",
    overflow: isGameModal ? "hidden" : "auto",
    flex: "none",
    display: "flex",
    flexDirection: "column",
    minHeight: isGameModal ? undefined : "120px",
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="win-window-base win95-modal"
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          ...modalStyles,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="win-titlebar"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="title">
            <span>◆</span>
            <span>{title}</span>
          </div>
          <div className="win-window-controls">
            <button className="win-btn" type="button" onClick={onClose}>
              ×
            </button>
          </div>
        </header>
        <div className="content" style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
}

