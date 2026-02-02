import { vi } from "vitest";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type MockHandler = (url: string, options?: RequestInit) => Promise<Response>;
type MockEntry = {
  method: Method;
  urlPattern: RegExp | string;
  handler: MockHandler;
};

const mockRegistry: MockEntry[] = [];

export const fetchMock = {
  register: (method: Method, urlPattern: RegExp | string, handler: MockHandler) => {
    mockRegistry.push({ method, urlPattern, handler });
  },
  reset: () => {
    mockRegistry.length = 0;
  },
  // Helper for simple JSON responses
  json: (data: unknown, status = 200) => {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }));
  }
};

/**
 * Extract path and query from full URL
 * Handles both full URLs (http://localhost:3000/games) and paths (/games)
 */
function extractPathAndQuery(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If URL parsing fails, assume it's already a path
    // Remove protocol/host if present (defensive)
    const match = url.match(/^https?:\/\/[^/]+(\/.*)$/);
    return match ? match[1] : url;
  }
}

const mockFetchImpl = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = input.toString();
  const method = (init?.method || "GET").toUpperCase() as Method;
  const pathWithQuery = extractPathAndQuery(url);

  // 1. Registry Lookup FIRST - if we have a mock, use it
  // Match regex patterns against path+query, string patterns against both URL and path
  // Check from the END so the last registered mock wins (allows test mocks to override setupDefaults)
  for (let i = mockRegistry.length - 1; i >= 0; i--) {
    const entry = mockRegistry[i];
    if (entry.method !== method) continue;
    
    let isMatch = false;
    if (entry.urlPattern instanceof RegExp) {
      // Regex patterns are designed to match paths (e.g., ^/games), so test against path+query
      isMatch = entry.urlPattern.test(pathWithQuery);
    } else {
      // String pattern: check if path starts with or contains the pattern
      // For exact matches, check if path starts with pattern
      // For partial matches, check if path includes pattern
      isMatch = pathWithQuery.startsWith(entry.urlPattern) || pathWithQuery.includes(entry.urlPattern);
    }

    if (isMatch) {
      return entry.handler(url, init);
    }
  }

  // 2. Localhost Guard - BLOCK ALL localhost requests that aren't mocked
  if (url.includes("localhost:3000") || url.includes("127.0.0.1:3000") || url.includes("127.0.0.1")) {
    const error = new Error(`[Network Isolation] Real network request forbidden in tests: ${method} ${url}. Path: ${pathWithQuery}`);
    console.error("[TEST SETUP] Blocked network request:", error.message);
    throw error;
  }

  // 3. Unhandled Request
  const error = new Error(`[Network Isolation] Unhandled request: ${method} ${url}. Use fetchMock.register() in your test.`);
  console.error("[TEST SETUP] Unhandled request:", error.message);
  throw error;
};

export function setupFetchMock() {
  // Mock fetch on all possible global objects
  const mockedFetch = vi.fn(mockFetchImpl);
  
  // Apply to all possible fetch locations
  global.fetch = mockedFetch;
  globalThis.fetch = mockedFetch;
  if (typeof window !== 'undefined') {
    window.fetch = mockedFetch;
  }
  
  console.log("[TEST SETUP] fetch mock installed on global, globalThis, window");
}
