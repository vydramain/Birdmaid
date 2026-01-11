// Auto-detect API URL based on current host
const getApiBaseUrl = (): string => {
  // Priority 1: Use explicit environment variable (set during build)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('[API Client] Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // "https:" or "http:"
  const port = window.location.port;
  
  console.log('[API Client] Detecting API URL from location:', { hostname, protocol, port });
  
  // For development (localhost), use port 3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('[API Client] Using localhost fallback');
    return 'http://localhost:3000';
  }
  
  // For production domains (contains dot), always use api subdomain
  // e.g., birdmaid.su -> https://api.birdmaid.su
  // e.g., www.birdmaid.su -> https://api.birdmaid.su
  if (hostname.includes('.')) {
    // Extract base domain (e.g., "birdmaid.su" from "birdmaid.su" or "www.birdmaid.su")
    const parts = hostname.split('.');
    const baseDomain = parts.length >= 2 
      ? parts.slice(-2).join('.') // Take last two parts (e.g., "birdmaid.su")
      : hostname;
    const apiUrl = `${protocol}//api.${baseDomain}`;
    console.log('[API Client] Using production domain fallback:', apiUrl);
    return apiUrl;
  }
  
  // For IP access (development/testing), use same IP with port 3000
  console.log('[API Client] Using IP fallback');
  return `http://${hostname}:3000`;
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (always, to help diagnose production issues)
console.log('[API Client] Initialized with API base URL:', API_BASE_URL);
console.log('[API Client] VITE_API_BASE_URL env:', import.meta.env.VITE_API_BASE_URL || '(not set)');
console.log('[API Client] Current location:', window.location.href);

export const apiClient = {
  async request(path: string, options?: RequestInit): Promise<Response> {
    const fullUrl = `${API_BASE_URL}${path}`;
    console.log('[API Client] Making request to:', fullUrl);
    const token = localStorage.getItem("birdmaid_token");
    const headers: HeadersInit = {
      ...options?.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options?.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include', // Include credentials for CORS
    });

    if (response.status === 401) {
      localStorage.removeItem("birdmaid_token");
      window.location.href = "/";
    }

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return response;
  },

  async json<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await this.request(path, options);
    return response.json();
  },
};

