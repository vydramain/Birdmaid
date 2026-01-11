// Auto-detect API URL based on current host
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // For development (localhost), use port 3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // For production domains, use api subdomain
  // e.g., birdmaid.su -> https://api.birdmaid.su
  if (hostname.includes('.')) {
    // Extract base domain (e.g., "birdmaid.su" from "birdmaid.su" or "www.birdmaid.su")
    const parts = hostname.split('.');
    const baseDomain = parts.length >= 2 
      ? parts.slice(-2).join('.') // Take last two parts (e.g., "birdmaid.su")
      : hostname;
    return `${protocol}//api.${baseDomain}`;
  }
  
  // For IP access (development/testing), use same IP with port 3000
  return `http://${hostname}:3000`;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = {
  async request(path: string, options?: RequestInit): Promise<Response> {
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

