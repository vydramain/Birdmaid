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

    const next = { ...current, ...partial };
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
    
    this.pendingGeometry = {
      x: clientX - this.dragOffset.x,
      y: clientY - this.dragOffset.y,
      width: current.width,
      height: current.height,
    };
  }

  endDrag() {
    if (this.activeDragId && this.pendingGeometry) {
      // Commit final state (triggers React re-render)
      this.update(this.activeDragId, {
        ...this.pendingGeometry,
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
