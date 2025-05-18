import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Get saved token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Save token to localStorage
export function saveAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Remove token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Helper function for making API requests
export async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    };
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `${response.status}: ${response.statusText}`);
  }

  return response;
}