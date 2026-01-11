/**
 * Centralized API Helpers
 * 
 * This module provides helpers to ensure all API requests automatically include
 * authentication tokens when a user is logged in.
 * 
 * IMPORTANT: Always use these helpers instead of direct fetch() or axios calls.
 */

import { getSession } from "next-auth/react";
import { authSession } from "~/lib/auth";
import apiClient from "~/lib/axios";

/**
 * Client-side: Get the current session token
 * Use this when you need to make a direct fetch() call and need the token
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    // Server-side: Use authSession
    const session = await authSession();
    return session?.tokens?.accessToken ?? null;
  } else {
    // Client-side: Use getSession
    try {
      const session = await getSession();
      return session?.tokens?.accessToken ?? null;
    } catch (error) {
      console.error("[getAuthToken] Error getting session:", error);
      return null;
    }
  }
};

/**
 * Client-side: Create authenticated fetch headers
 * Use this when you MUST use fetch() instead of apiClient
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Client-side: Authenticated fetch wrapper
 * Use this INSTEAD of direct fetch() calls to ensure tokens are attached
 * 
 * @example
 * const response = await authenticatedFetch("/api/some-endpoint", {
 *   method: "POST",
 *   body: JSON.stringify(data),
 * });
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
};

/**
 * Server-side: Get authenticated headers for Next.js API routes
 * Use this in Next.js API route handlers that proxy to the backend
 */
export const getServerAuthHeaders = async (): Promise<Record<string, string>> => {
  if (typeof window !== "undefined") {
    throw new Error("getServerAuthHeaders can only be used server-side");
  }
  
  const session = await authSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }
  
  return headers;
};

/**
 * Server-side: Authenticated fetch for Next.js API routes
 * Use this in Next.js API route handlers that proxy to the backend
 * 
 * @example (in Next.js API route)
 * const response = await serverAuthenticatedFetch(`${backendUrl}/endpoint`, {
 *   method: "POST",
 *   body: JSON.stringify(data),
 * });
 */
export const serverAuthenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  if (typeof window !== "undefined") {
    throw new Error("serverAuthenticatedFetch can only be used server-side");
  }
  
  const headers = await getServerAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
};

/**
 * RECOMMENDED: Use apiClient for all backend API calls
 * 
 * The apiClient (from ~/lib/axios) automatically:
 * - Attaches authentication tokens
 * - Handles errors consistently
 * - Redirects on 401
 * - Works on both client and server
 * 
 * @example
 * import apiClient from "~/lib/axios";
 * 
 * // GET request
 * const response = await apiClient.get("/endpoint");
 * 
 * // POST request
 * const response = await apiClient.post("/endpoint", data);
 * 
 * // PUT request
 * const response = await apiClient.put("/endpoint", data);
 * 
 * // DELETE request
 * const response = await apiClient.delete("/endpoint");
 */
