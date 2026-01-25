import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { setupFetchMock, fetchMock } from "./utils/mock-fetch";
import { mockApi } from "./mocks/mockApi";

// Re-export fetchMock and mockApi for tests that import from here
export { fetchMock, mockApi };

// --- Debug: Verify setup is loaded ---
console.log("[TEST SETUP] loaded");

// --- Mock window.location to prevent apiClient from detecting localhost ---
// This must happen BEFORE any imports that use apiClient
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    hostname: 'test.example.com',
    href: 'http://test.example.com/',
    protocol: 'http:',
    port: '',
  },
  writable: true,
});

// Mock import.meta.env.VITE_API_BASE_URL to prevent localhost detection
// Note: This is a workaround - vitest doesn't easily mock import.meta.env
// But we'll block fetch anyway, so this is just defensive

// --- Network Isolation ---
setupFetchMock();

// --- Browser Environment Mocks ---

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id) as unknown as number;

// Cleanup
afterEach(() => {
  vi.clearAllMocks();
  // Add safety check - mockApi might not be initialized in some edge cases
  if (mockApi && typeof mockApi.reset === 'function') {
    mockApi.reset(); // This also calls fetchMock.reset()
  } else {
    // Fallback: reset fetchMock directly
    fetchMock.reset();
  }
  localStorage.clear();
  sessionStorage.clear();
});
