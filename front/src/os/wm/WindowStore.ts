type WindowGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WindowState = WindowGeometry & {
  isDragging: boolean;
  isResizing: boolean;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
};

type Listener = (state: WindowState) => void;
type GeometryListener = (geometry: WindowGeometry) => void;

type ViewportSize = {
  width: number;
  height: number;
};

class WindowStore {
  private states = new Map<string, WindowState>();
  private listeners = new Map<string, Set<Listener>>();
  private geometryListeners = new Map<string, Set<GeometryListener>>();
  private globalDragListeners = new Set<(isDragging: boolean) => void>();

  // Drag state
  private activeDragId: string | null = null;
  private dragOffset = { x: 0, y: 0 };
  private pendingGeometry: WindowGeometry | null = null;
  private rafId: number | null = null;

  // Taskbar height (stub for now, will be configurable later)
  private taskbarHeight = 40; // Taskbar stub height

  // Default state
  private defaultState: WindowState = {
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    isDragging: false,
    isResizing: false,
    zIndex: 1,
    minimized: false,
    maximized: false,
  };

  register(id: string, initialState?: Partial<WindowState>) {
    if (!this.states.has(id)) {
      this.states.set(id, { ...this.defaultState, ...initialState });
    }
  }

  unregister(id: string) {
    this.states.delete(id);
    this.listeners.delete(id);
    this.geometryListeners.delete(id);
  }

  get(id: string): WindowState {
    return this.states.get(id) || this.defaultState;
  }

  update(id: string, partial: Partial<WindowState>) {
    const current = this.states.get(id);
    if (!current) return;

    let next = { ...current, ...partial };
    
    // Enforce viewport boundary if geometry is being updated
    if (partial.x !== undefined || partial.y !== undefined || partial.width !== undefined || partial.height !== undefined) {
      const enforcedGeometry = this.enforceViewportBoundary({
        x: next.x,
        y: next.y,
        width: next.width,
        height: next.height,
      });
      next = { ...next, ...enforcedGeometry };
    }
    
    this.states.set(id, next);
    this.notify(id, next);
  }

  subscribe(id: string, listener: Listener): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(listener);

    // Call immediately with current state
    listener(this.get(id));

    return () => {
      const set = this.listeners.get(id);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(id);
        }
      }
    };
  }

  subscribeGeometry(id: string, listener: GeometryListener): () => void {
    if (!this.geometryListeners.has(id)) {
      this.geometryListeners.set(id, new Set());
    }
    this.geometryListeners.get(id)!.add(listener);

    return () => {
      const set = this.geometryListeners.get(id);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.geometryListeners.delete(id);
        }
      }
    };
  }

  subscribeGlobalDrag(listener: (isDragging: boolean) => void): () => void {
    this.globalDragListeners.add(listener);
    return () => {
      this.globalDragListeners.delete(listener);
    };
  }

  private notifyGlobalDrag(isDragging: boolean) {
    this.globalDragListeners.forEach((l) => l(isDragging));
  }

  private notify(id: string, state: WindowState) {
    const set = this.listeners.get(id);
    if (set) {
      set.forEach((l) => l(state));
    }
  }

  // --- Viewport Boundary Enforcement ---

  /**
   * Enforces viewport boundary constraints on window geometry.
   * Windows cannot be dragged or resized outside the viewport.
   * 
   * @param geometry - Window geometry to enforce
   * @returns Enforced geometry that stays within viewport bounds
   */
  private enforceViewportBoundary(geometry: WindowGeometry): WindowGeometry {
    const viewport: ViewportSize = {
      width: window.innerWidth,
      height: window.innerHeight - this.taskbarHeight,
    };

    // Ensure window width doesn't exceed viewport
    const clampedWidth = Math.min(geometry.width, viewport.width);
    
    // Ensure window height doesn't exceed viewport (minimum: header visible)
    const minHeight = 50; // Minimum height to keep header visible
    const clampedHeight = Math.min(geometry.height, viewport.height, Math.max(geometry.height, minHeight));

    // Clamp x coordinate: 0 <= x <= viewportWidth - windowWidth
    const maxX = Math.max(0, viewport.width - clampedWidth);
    const clampedX = Math.max(0, Math.min(geometry.x, maxX));

    // Clamp y coordinate: 0 <= y <= viewportHeight - windowHeight
    const maxY = Math.max(0, viewport.height - clampedHeight);
    const clampedY = Math.max(0, Math.min(geometry.y, maxY));

    return {
      x: clampedX,
      y: clampedY,
      width: clampedWidth,
      height: clampedHeight,
    };
  }

  // --- Drag & Drop Logic (rAF Driven) ---

  startDrag(id: string, clientX: number, clientY: number) {
    const state = this.get(id);
    this.activeDragId = id;
    this.dragOffset = { x: clientX - state.x, y: clientY - state.y };
    
    // Mark as dragging (triggers React re-render to show overlays etc)
    this.update(id, { isDragging: true });
    this.notifyGlobalDrag(true);
    
    this.startLoop();
  }

  updateDrag(clientX: number, clientY: number) {
    if (!this.activeDragId) return;

    const current = this.get(this.activeDragId);
    
    const rawGeometry = {
      x: clientX - this.dragOffset.x,
      y: clientY - this.dragOffset.y,
      width: current.width,
      height: current.height,
    };

    // Enforce viewport boundary during drag
    this.pendingGeometry = this.enforceViewportBoundary(rawGeometry);
  }

  endDrag() {
    if (this.activeDragId && this.pendingGeometry) {
      // Enforce viewport boundary one final time before committing
      const enforcedGeometry = this.enforceViewportBoundary(this.pendingGeometry);
      
      // Commit final state (triggers React re-render)
      this.update(this.activeDragId, {
        ...enforcedGeometry,
        isDragging: false,
      });
    } else if (this.activeDragId) {
      this.update(this.activeDragId, { isDragging: false });
    }

    this.activeDragId = null;
    this.pendingGeometry = null;
    this.notifyGlobalDrag(false);
    this.stopLoop();
  }

  private startLoop() {
    if (this.rafId) return;

    const loop = () => {
      if (this.activeDragId && this.pendingGeometry) {
        // Notify geometry listeners only (Direct DOM update)
        const listeners = this.geometryListeners.get(this.activeDragId);
        if (listeners) {
          listeners.forEach((l) => l(this.pendingGeometry!));
        }
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const windowStore = new WindowStore();
