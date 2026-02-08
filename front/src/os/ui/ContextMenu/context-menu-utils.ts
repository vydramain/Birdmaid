/**
 * Context menu utilities for positioning and bounds.
 * @see docs/fps/WORKITEM_CONTEXT_MENU.md
 */

export function getBoundsRect(): DOMRect {
  const el = document.querySelector('[data-testid="desktop-root"]');
  return el ? el.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
