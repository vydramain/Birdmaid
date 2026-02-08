/**
 * Win95 Context Menu
 *
 * Reusable Windows 95/98-style context menu with overlay.
 * Positions near mouse (clientX/clientY) with flip/clamp via --cm-x/--cm-y.
 *
 * @see docs/style/EXPLORER_UI_CONTRACT.md#context-menu
 * @see docs/dev/GUARDRAILS.md#context-menu-positioning-exception
 */

import React, { useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getBoundsRect } from "./context-menu-utils";

export type ContextMenuPlacement = "bottom-left" | "bottom-right" | "top-left" | "top-right";

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  onSelect?: () => void;
  separator?: boolean;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

/**
 * Compute context menu position: start at (clientX, clientY), flip if overflow, clamp to bounds.
 * Uses GUARDRAILS exception: only --cm-x/--cm-y set via setProperty.
 */
export function computeContextMenuPosition(
  clientX: number,
  clientY: number,
  menuWidth: number,
  menuHeight: number,
  containerRect?: DOMRect
): ContextMenuPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bounds = containerRect ?? new DOMRect(0, 0, vw, vh);

  const overflowRight = clientX + menuWidth > bounds.right;
  const overflowBottom = clientY + menuHeight > bounds.bottom;
  const overflowLeft = clientX - menuWidth < bounds.left;
  const overflowTop = clientY - menuHeight < bounds.top;

  let x = clientX;
  let y = clientY;

  if (overflowRight && !overflowLeft) {
    x = clientX - menuWidth;
  } else if (overflowLeft && !overflowRight) {
    x = bounds.left;
  } else if (overflowRight) {
    x = bounds.right - menuWidth;
  }

  if (overflowBottom && !overflowTop) {
    y = clientY - menuHeight;
  } else if (overflowTop && !overflowBottom) {
    y = bounds.top;
  } else if (overflowBottom) {
    y = bounds.bottom - menuHeight;
  }

  x = Math.max(bounds.left, Math.min(x, bounds.right - menuWidth));
  y = Math.max(bounds.top, Math.min(y, bounds.bottom - menuHeight));

  return { x, y };
}

/** @deprecated Use clientX/clientY + computeContextMenuPosition instead */
export function computePlacementFromAnchor(anchorEl: HTMLElement): ContextMenuPlacement {
  const rect = anchorEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const inRightHalf = rect.left + rect.width / 2 > vw / 2;
  const inBottomHalf = rect.top + rect.height / 2 > vh / 2;

  if (inBottomHalf && inRightHalf) return "top-left";
  if (inBottomHalf && !inRightHalf) return "top-right";
  if (!inBottomHalf && inRightHalf) return "bottom-left";
  return "bottom-right";
}

export type ContextMenuContextLike =
  | { owner: "desktop"; kind: "background"; targetPath: string }
  | { owner: "desktop"; kind: "item"; targetPath: string; itemPath: string }
  | { owner: "explorer"; kind: "grid-background"; targetPath: string }
  | { owner: "explorer"; kind: "grid-item"; targetPath: string; itemPath: string };

export interface ContextMenuProps {
  open: boolean;
  clientX: number;
  clientY: number;
  containerRect?: DOMRect | null;
  onClose: () => void;
  items: ContextMenuItem[];
  context?: ContextMenuContextLike | null;
}

export function ContextMenu({
  open,
  clientX,
  clientY,
  containerRect = null,
  onClose,
  items,
  context = null,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !menuRef.current || !wrapperRef.current) return;
    const menuRect = menuRef.current.getBoundingClientRect();
    const bounds = containerRect ?? getBoundsRect();
    const { x, y } = computeContextMenuPosition(
      clientX,
      clientY,
      menuRect.width,
      menuRect.height,
      bounds
    );
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const xRem = x / rootFontSize;
    const yRem = y / rootFontSize;
    // inline-style: allowed (reason: layout-calc; why: context-menu positioning via CSS vars (rem); revisit: FP7)
    wrapperRef.current.style.setProperty("--cm-x", `${xRem}rem`);
    wrapperRef.current.style.setProperty("--cm-y", `${yRem}rem`);
  }, [open, clientX, clientY, containerRect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    },
    [open, onClose]
  );

  const handleDocumentMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      const wrapper = wrapperRef.current;
      if (wrapper && !wrapper.contains(target)) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleDocumentMouseDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleDocumentMouseDown, true);
    };
  }, [open, handleKeyDown, handleDocumentMouseDown]);

  if (!open) return null;

  const menuContent = (
    <div className="win95-context-overlay" data-testid="context-menu-overlay">
      <div
        ref={wrapperRef}
        className="win95-context-menu-wrapper"
        role="menu"
        aria-hidden={!open}
        data-testid="context-menu"
        data-owner={context && (context.owner === "explorer" || context.owner === "desktop") ? context.owner : undefined}
        data-target-path={context && (context.owner === "explorer" || context.owner === "desktop") ? context.targetPath : undefined}
        data-item-path={context && (context.owner === "explorer" || context.owner === "desktop") && (context.kind === "grid-item" || context.kind === "item") ? context.itemPath : undefined}
      >
        <ul
          ref={menuRef}
          className="win95-context-menu"
          role="menu"
        >
          {items.map((item) => {
            if (item.separator) {
              return (
                <li
                  key={item.id}
                  className="win95-context-menu-separator"
                  role="separator"
                  data-testid={`context-item-${item.id}`}
                />
              );
            }
            const isDisabled = item.disabled;
            return (
              <li
                key={item.id}
                className={`win95-context-menu-item ${isDisabled ? "is-disabled" : ""}`}
                role="menuitem"
                data-testid={`context-item-${item.id}`}
                aria-disabled={isDisabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDisabled && item.onSelect) {
                    item.onSelect();
                    onClose();
                  }
                }}
              >
                {item.icon && (
                  <span className="win95-context-menu-item-icon" aria-hidden>
                    {item.icon}
                  </span>
                )}
                <span className="win95-context-menu-item-label">{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}
