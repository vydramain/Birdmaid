/**
 * FP7 Window Viewport Boundary Test
 * 
 * Validates that windows cannot be dragged or resized outside the viewport.
 * This is a mandatory contract requirement.
 */

import { mockApi, fetchMock } from "@/test/mocks/mockApi";
import { windowStore } from "@/os/wm/WindowStore";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Window Viewport Boundary", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset and setup mockApi
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    
    // Mock API endpoints
    if (mockApi && typeof mockApi.get === 'function') {
      mockApi.get('/jam/current', () => fetchMock.json(null));
    }
    
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  it("should prevent window from being dragged outside viewport (right edge)", () => {
    const windowId = "test-window-1";
    
    // Register window in store
    windowStore.register(windowId, {
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });

    // Try to drag window beyond right edge
    windowStore.startDrag(windowId, 100, 100);
    // Simulate drag to position that would put window outside viewport
    windowStore.updateDrag(3000, 100); // x=3000 would put window outside (1920px viewport)
    windowStore.endDrag();

    // Get final position
    const finalState = windowStore.get(windowId);
    
    // Window should be clamped to viewport boundary
    // x + width should not exceed viewport width (1920) - taskbar height (40) = 1880
    const maxX = 1920 - finalState.width;
    expect(finalState.x).toBeLessThanOrEqual(maxX);
    expect(finalState.x).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    windowStore.unregister(windowId);
  });

  it("should prevent window from being dragged outside viewport (bottom edge)", () => {
    const windowId = "test-window-2";
    
    // Register window in store
    windowStore.register(windowId, {
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });

    // Try to drag window beyond bottom edge
    windowStore.startDrag(windowId, 100, 100);
    // Simulate drag to position that would put window outside viewport
    windowStore.updateDrag(100, 3000); // y=3000 would put window outside (1080px viewport - 40px taskbar = 1040px)
    windowStore.endDrag();

    // Get final position
    const finalState = windowStore.get(windowId);
    
    // Window should be clamped to viewport boundary
    // y + height should not exceed viewport height (1080) - taskbar height (40) = 1040
    const maxY = 1080 - 40 - finalState.height;
    expect(finalState.y).toBeLessThanOrEqual(maxY);
    expect(finalState.y).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    windowStore.unregister(windowId);
  });

  it("should prevent window from being dragged outside viewport (left edge)", () => {
    const windowId = "test-window-3";
    
    // Register window in store
    windowStore.register(windowId, {
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });

    // Try to drag window beyond left edge
    windowStore.startDrag(windowId, 100, 100);
    // Simulate drag to negative position
    windowStore.updateDrag(-100, 100); // x=-100 would put window outside
    windowStore.endDrag();

    // Get final position
    const finalState = windowStore.get(windowId);
    
    // Window should be clamped to viewport boundary
    expect(finalState.x).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    windowStore.unregister(windowId);
  });

  it("should prevent window from being dragged outside viewport (top edge)", () => {
    const windowId = "test-window-4";
    
    // Register window in store
    windowStore.register(windowId, {
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });

    // Try to drag window beyond top edge
    windowStore.startDrag(windowId, 100, 100);
    // Simulate drag to negative position
    windowStore.updateDrag(100, -100); // y=-100 would put window outside
    windowStore.endDrag();

    // Get final position
    const finalState = windowStore.get(windowId);
    
    // Window should be clamped to viewport boundary
    expect(finalState.y).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    windowStore.unregister(windowId);
  });

  it("should enforce viewport boundary on window update", () => {
    const windowId = "test-window-5";
    
    // Register window in store
    windowStore.register(windowId, {
      x: 100,
      y: 100,
      width: 600,
      height: 400,
    });

    // Try to update window position to outside viewport
    windowStore.update(windowId, {
      x: 3000, // Outside viewport
      y: 100,
    });

    // Get final position
    const finalState = windowStore.get(windowId);
    
    // Window should be clamped to viewport boundary
    const maxX = 1920 - finalState.width;
    expect(finalState.x).toBeLessThanOrEqual(maxX);
    expect(finalState.x).toBeGreaterThanOrEqual(0);
    
    // Cleanup
    windowStore.unregister(windowId);
  });
});
