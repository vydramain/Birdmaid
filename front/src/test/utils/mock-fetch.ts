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

const mockFetchImpl = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = input.toString();
  const method = (init?.method || "GET").toUpperCase() as Method;

  // 1. Localhost Guard - BLOCK ALL localhost requests
  if (url.includes("localhost:3000") || url.includes("127.0.0.1:3000") || url.includes("127.0.0.1")) {
    const error = new Error(`[Network Isolation] Real network request forbidden in tests: ${method} ${url}`);
    console.error("[TEST SETUP] Blocked network request:", error.message);
    throw error;
  }

  // 2. Registry Lookup
  for (const entry of mockRegistry) {
    if (entry.method !== method) continue;
    
    const isMatch = entry.urlPattern instanceof RegExp 
      ? entry.urlPattern.test(url)
      : url.includes(entry.urlPattern);

    if (isMatch) {
      return entry.handler(url, init);
    }
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
