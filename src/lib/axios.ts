import Axios from "axios";
import { getSession } from "next-auth/react"; // client side
import { authSession } from "~/lib/auth"; // wrapper for getServerSession
import { siteConfig } from "~/config/site";
import { publicEndpoints, protectedEndpoints } from "~/constants";
import { ApiError } from "~/utils/api-utils";


const API_CONFIG = {
  timeout: 30000, // Increased timeout
  retryAttempts: 3,
  retryDelay: 1000, // Base delay in ms
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Retry on these status codes
};

// Normalize base URL to ensure HTTPS for production and remove trailing slashes
const normalizeBaseUrl = (url: string): string => {
  if (!url) return url;
  
  const originalUrl = url;
  
  // Remove trailing slashes from baseURL (endpoint paths may have trailing slashes)
  url = url.trim().replace(/\/+$/, "");
  
  // For production Railway URLs, ALWAYS ensure HTTPS is used (HTTP->HTTPS redirect breaks CORS preflight)
  // Also handle any redirects that might downgrade HTTPS to HTTP
  if (url.includes("railway.app") || url.includes("vercel.app") || url.includes("herokuapp.com") || url.includes("netlify.app")) {
    // Force HTTPS for production platforms
    url = url.replace(/^http:\/\//i, "https://");
    
    // Log if we had to fix HTTP to HTTPS
    if (originalUrl.startsWith("http://") && url.startsWith("https://")) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[BaseURL Normalization] Fixed HTTP->HTTPS: ${originalUrl} -> ${url}`);
      }
    }
  }
  
  // Double-check: if it's still HTTP and looks like a production URL, force HTTPS
  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1") && !url.includes("backend:")) {
    url = url.replace(/^http:\/\//, "https://");
    if (process.env.NODE_ENV === "development") {
      console.warn(`[BaseURL Normalization] Force HTTPS for production URL: ${url}`);
    }
  }
  
  // CRITICAL: If we're in browser and page is HTTPS, ALWAYS use HTTPS for API calls
  // This prevents Mixed Content errors where HTTPS pages try to make HTTP requests
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
    url = url.replace(/^http:\/\//, "https://");
    console.warn(`[BaseURL Normalization] CRITICAL: Forced HTTPS for browser HTTPS page: ${url}`);
  }
  
  return url;
};

// Determine the correct API base URL
// CRITICAL: Server-side (Next.js SSR) and client-side need different URLs in Docker
// - Server-side: Must use Docker service name (backend:8002) 
// - Client-side: Must use localhost:8002 (accessible from browser)
const getApiBaseUrl = () => {
  let baseUrl: string;
  
  if (typeof window === "undefined") {
    // Server-side (Next.js SSR/API routes): MUST use Docker service name
    // NEXT_PUBLIC_BASE_API_URL is for client-side only - ignore it here
    baseUrl = process.env.BACKEND_URL || "http://backend:8002";
    
    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[getApiBaseUrl] Server-side base URL:", baseUrl, {
        hasBackendUrl: !!process.env.BACKEND_URL,
        backendUrl: process.env.BACKEND_URL,
        nextPublicBaseApiUrl: process.env.NEXT_PUBLIC_BASE_API_URL,
      });
    }
  } else {
    // Client-side (browser): Use NEXT_PUBLIC_BASE_API_URL or localhost
    baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || siteConfig.apiBaseUrl || "http://localhost:8002";

    // If the "API" URL is identical to the site origin, requests like GET /jobs/... hit Next.js (HTML)
    // instead of Caddy's /api → backend. Normalize to …/api for same-origin Docker/Caddy setups.
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
    let resolved = baseUrl.trim().replace(/\/+$/, "");
    if (appOrigin && resolved === appOrigin) {
      resolved = `${resolved}/api`;
      if (process.env.NODE_ENV === "development") {
        console.warn("[getApiBaseUrl] API base matched app URL; appended /api:", resolved);
      }
    }
    // Caddyfile uses handle_path /api/* → backend; …/backend is not proxied and yields Next.js 404 HTML.
    if (/\/backend$/i.test(resolved)) {
      resolved = resolved.replace(/\/backend$/i, "/api");
      if (process.env.NODE_ENV === "development") {
        console.warn("[getApiBaseUrl] Replaced /backend suffix with /api:", resolved);
      }
    }
    baseUrl = resolved;

    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[getApiBaseUrl] Client-side base URL:", baseUrl);
    }
  }
  
  // Normalize the URL (ensure HTTPS for production, remove trailing slashes)
  return normalizeBaseUrl(baseUrl);
};

// Create an Axios instance
const apiClient = Axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_CONFIG.timeout,
});

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let authRecoveryInProgress = false;

// Helper: get access token depending on environment
// CRITICAL: This function MUST reliably retrieve the access token from the NextAuth session
const getAccessToken = async (retryCount: number = 0): Promise<string | null> => {
  const maxRetries = 2;
  
  try {
    if (typeof window === "undefined") {
      // server-side
      const session = await authSession();
      return session?.tokens?.accessToken ?? null;
    } else {
      // client-side - Use getSession from next-auth/react (more reliable than fetch)
      try {
        // Force a fresh session fetch if retrying
        // Note: getSession doesn't accept options in newer versions of next-auth
        const session = await getSession();
        
        // Debug logging to help diagnose "Not Authenticated" errors
        if (process.env.NODE_ENV === "development") {
          console.log(`[getAccessToken] Session data (attempt ${retryCount + 1}):`, {
            hasSession: !!session,
            hasTokens: !!session?.tokens,
            tokensKeys: session?.tokens ? Object.keys(session.tokens) : [],
            accessTokenPresent: !!session?.tokens?.accessToken,
            accessTokenLength: session?.tokens?.accessToken?.length || 0,
            isAuthenticated: session?.isAuthenticated,
            userEmail: session?.user?.email,
            userRole: session?.user?.role,
            retryCount,
          });
          // Also log the actual session structure for debugging (sanitized - no full token)
          if (session?.tokens?.accessToken) {
            console.log("[getAccessToken] Token preview:", session.tokens.accessToken.substring(0, 20) + "...");
          }
        }
        
        const token = session?.tokens?.accessToken ?? null;
        const refreshToken = session?.tokens?.refreshToken ?? null;
        if (token) {
          inMemoryAccessToken = token;
        }
        if (refreshToken) {
          inMemoryRefreshToken = refreshToken;
        }
        
        if (!token) {
          console.error(`[getAccessToken] No access token found in session (attempt ${retryCount + 1})!`, {
            sessionKeys: session ? Object.keys(session) : [],
            tokens: session?.tokens,
            isAuthenticated: session?.isAuthenticated,
            user: session?.user,
            retryCount,
          });
          
          // Retry once more with forced refresh if we haven't already
          if (retryCount < maxRetries && session && session.user) {
            console.log(`[getAccessToken] Retrying with forced session refresh...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            return getAccessToken(retryCount + 1);
          }
        }
        return token;
      } catch (sessionError) {
        console.error(`[getAccessToken] Error getting session (attempt ${retryCount + 1}):`, sessionError);
        
        // Retry once if this is the first attempt
        if (retryCount < maxRetries) {
          console.log(`[getAccessToken] Retrying session retrieval...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          return getAccessToken(retryCount + 1);
        }
        
        // Fallback to fetch if getSession fails
        try {
          console.log("[getAccessToken] Falling back to fetch API");
      const res = await fetch("/api/auth/session");
          if (!res.ok) {
            console.warn("Fallback fetch failed:", res.status, res.statusText);
            return inMemoryAccessToken;
          }
      const session = await res.json();
          const fallbackToken = session?.tokens?.accessToken ?? null;
          const fallbackRefreshToken = session?.tokens?.refreshToken ?? null;
          if (fallbackToken) {
            inMemoryAccessToken = fallbackToken;
          }
          if (fallbackRefreshToken) {
            inMemoryRefreshToken = fallbackRefreshToken;
          }
          
          if (fallbackToken) {
            console.log("[getAccessToken] ✅ Token retrieved via fallback fetch");
          } else {
            console.error("[getAccessToken] ❌ Fallback fetch also returned no token");
          }
          
          return fallbackToken;
        } catch (fetchError) {
          console.error("[getAccessToken] Fallback fetch also failed:", fetchError);
          return inMemoryAccessToken;
        }
      }
    }
  } catch (error) {
    console.error(`[getAccessToken] Unexpected error (attempt ${retryCount + 1}):`, error);
    
    // Retry once if this is the first attempt
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return getAccessToken(retryCount + 1);
    }
    
    return inMemoryAccessToken;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;

  try {
    if (typeof window === "undefined") {
      const session = await authSession();
      const refreshToken = session?.tokens?.refreshToken ?? null;
      if (refreshToken) {
        inMemoryRefreshToken = refreshToken;
      }
      return refreshToken;
    }

    const session = await getSession();
    const refreshToken = session?.tokens?.refreshToken ?? null;
    if (refreshToken) {
      inMemoryRefreshToken = refreshToken;
    }
    return refreshToken;
  } catch (error) {
    console.error("[Token Refresh] Failed to read refresh token from session:", error);
    return inMemoryRefreshToken;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn("[Token Refresh] No refresh token available");
      return null;
    }

    const refreshEndpoints = ["/auth/refresh-token", "/auth/refresh_token"];
    for (const endpoint of refreshEndpoints) {
      try {
        const refreshResponse = await Axios.post(endpoint, null, {
          baseURL: getApiBaseUrl(),
          timeout: API_CONFIG.timeout,
          params: { refresh_token: refreshToken },
        });

        const responseData = refreshResponse?.data as
          | { access_token?: string; refresh_token?: string }
          | { data?: { access_token?: string; refresh_token?: string } };
        const newAccessToken = responseData?.access_token ?? responseData?.data?.access_token ?? null;
        const newRefreshToken = responseData?.refresh_token ?? responseData?.data?.refresh_token ?? null;

        if (newAccessToken) {
          inMemoryAccessToken = newAccessToken;
        }
        if (newRefreshToken) {
          inMemoryRefreshToken = newRefreshToken;
        }

        if (newAccessToken) {
          console.log("[Token Refresh] Access token refreshed successfully");
          return newAccessToken;
        }
      } catch (refreshError) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[Token Refresh] Failed endpoint ${endpoint}`, toLoggableError(refreshError));
        }
      }
    }

    console.error("[Token Refresh] All refresh endpoints failed");
    return null;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

// Request interceptor - ALWAYS attaches token for authenticated endpoints
// CRITICAL: This interceptor MUST ensure tokens are attached for all authenticated requests
apiClient.interceptors.request.use(
  async (config) => {
    // Normalize baseURL and URL to prevent redirect issues:
    // 1. Ensure HTTPS for production URLs (prevents HTTP->HTTPS redirects that break CORS)
    // 2. Remove trailing slashes from baseURL (but keep trailing slashes in endpoint paths if needed)
    // 3. Ensure no double slashes between baseURL and path
    if (config.baseURL) {
      const originalBaseURL = config.baseURL;
      // Normalize baseURL: ensure HTTPS for production and remove trailing slash
      config.baseURL = normalizeBaseUrl(config.baseURL);
      
      // CRITICAL FIX: If we're in browser (HTTPS page) and baseURL is still HTTP, force HTTPS
      // This prevents Mixed Content errors where HTTPS pages try to make HTTP requests
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        if (config.baseURL.startsWith("http://")) {
          config.baseURL = config.baseURL.replace(/^http:\/\//, "https://");
          console.warn(`[Axios Interceptor] CRITICAL: Fixed HTTP->HTTPS to prevent Mixed Content error: ${originalBaseURL} -> ${config.baseURL}`);
        }
      }
      
      // Log if we changed the baseURL (in development)
      if (process.env.NODE_ENV === "development" && originalBaseURL !== config.baseURL) {
        console.log(`[Axios Interceptor] BaseURL normalized: ${originalBaseURL} -> ${config.baseURL}`);
      }
    }
    
    if (config.url) {
      // Remove leading slashes (keep single leading slash)
      config.url = config.url.replace(/^\/+/, "/");
      // Don't remove trailing slashes - FastAPI endpoints may require them
      // The backend endpoint is /jobs/ (with trailing slash), so keep it
      // Only normalize if it's explicitly a root path
      if (config.url === "//" || config.url === "///") {
        config.url = "/";
      }
    }
    
    // Construct and log the full URL for debugging (in development)
    if (process.env.NODE_ENV === "development" && config.baseURL && config.url) {
      const fullUrl = `${config.baseURL}${config.url}`;
      if (fullUrl.includes("railway") || fullUrl.includes("production")) {
        console.log(`[Axios Interceptor] Full URL: ${fullUrl} (method: ${config.method?.toUpperCase()})`);
      }
    }
    
    // Ensure headers object exists first
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // CRITICAL: Do NOT set Content-Type for FormData - let the browser/Axios handle it
    // FormData requires the browser to set Content-Type with boundary parameter
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let FormData set it correctly with boundary
      delete config.headers['Content-Type'];
      if (process.env.NODE_ENV === "development") {
        console.log("[Axios Interceptor] Detected FormData upload - removed Content-Type header to allow browser to set it with boundary");
        console.log("[Axios Interceptor] FormData details:", {
          url: config.url,
          method: config.method?.toUpperCase(),
        });
      }
    }
    
    // Helper function to check if URL matches endpoint pattern
    const urlMatchesEndpoint = (url: string, endpoint: string): boolean => {
      if (!url || !endpoint) return false;
      const urlWithoutQuery = url.split("?")[0].trim();
      const endpointTrimmed = endpoint.trim();
      
      // Normalize both URLs (remove trailing slashes for comparison, but preserve for exact match)
      const urlNormalized = urlWithoutQuery.replace(/\/$/, '');
      const endpointNormalized = endpointTrimmed.replace(/\/$/, '');
      
      // Exact match (with or without trailing slash)
      if (urlNormalized === endpointNormalized) return true;
      
      // Check if URL starts with endpoint (for endpoints that have sub-paths)
      if (endpointTrimmed.endsWith("/")) {
        return urlWithoutQuery.startsWith(endpointTrimmed);
      }
      
      // For non-trailing-slash endpoints, check exact match or followed by / or ?
      return urlNormalized === endpointNormalized || 
             urlWithoutQuery.startsWith(endpointTrimmed + "/") || 
             urlWithoutQuery.startsWith(endpointTrimmed + "?");
    };
    
    // Check if this is a protected endpoint first (should never be public)
    // Protected endpoints require authentication even if they might match a public prefix
    const isProtectedEndpoint = config.url && (
      // Check explicit protected endpoints
      protectedEndpoints.some((endpoint) => {
        if (endpoint === "/jobs/") {
          // POST to /jobs/ requires auth - check method and exact path match
          return config.method?.toUpperCase() === "POST" && 
                 (config.url === "/jobs" || config.url === "/jobs/");
        }
        // For other protected endpoints, use exact or prefix matching
        return urlMatchesEndpoint(config.url || '', endpoint);
      })
    );
    
    // Check if this is a public endpoint (no auth required)
    // IMPORTANT: Check public endpoints FIRST before checking protected endpoints
    // This ensures /auth/login and /auth/register are always recognized as public
    const isPublicEndpoint = config.url && (
      // Check explicit public endpoints first
      publicEndpoints.some((endpoint) => {
        // /categories is public only for reads; mutations must stay authenticated.
        if (endpoint === "/categories") {
          const method = config.method?.toUpperCase() || "GET";
          if (method !== "GET") return false;
        }
        const matches = urlMatchesEndpoint(config.url || "", endpoint);
        if (matches && process.env.NODE_ENV === "development") {
          console.log(`[API Request] ✅ Matched public endpoint: ${config.url} matches ${endpoint}`);
        }
        return matches;
      }) ||
      // GET requests to /jobs/{job_id} are public (no auth required in backend)
      // But exclude protected paths like /jobs/ai-generate
      (config.method?.toUpperCase() === "GET" && 
       /^\/jobs\/[^/]+$/.test(config.url.split("?")[0]) && 
       !config.url.includes("/jobs/ai-generate"))
    ) && !isProtectedEndpoint; // But exclude protected endpoints even if they match a public pattern
    
    // CRITICAL: Double-check auth endpoints are always treated as public
    // This is a safety net in case the matching logic above fails
    if (config.url && (config.url.includes("/auth/login") || config.url.includes("/auth/register"))) {
      if (!isPublicEndpoint && process.env.NODE_ENV === "development") {
        console.warn(`[API Request] ⚠️ Auth endpoint ${config.url} not recognized as public - forcing it to be public`);
      }
    }
    
    // Debug logging for endpoint classification
    if (process.env.NODE_ENV === "development" && config.url) {
      console.log(`[API Request] Endpoint classification for ${config.method?.toUpperCase()} ${config.url}:`, {
        isProtected: isProtectedEndpoint,
        isPublic: isPublicEndpoint,
        matchedPublicEndpoints: publicEndpoints.filter(e => urlMatchesEndpoint(config.url || "", e)),
        matchedProtectedEndpoints: protectedEndpoints.filter(e => urlMatchesEndpoint(config.url || "", e)),
      });
    }
    
    // CRITICAL FIX: Explicitly check for auth endpoints to prevent token retrieval
    // This ensures login/register always work even if matching logic fails
    const isAuthEndpoint = config.url && (
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register") ||
      config.url.includes("/auth/refresh_token") ||
      config.url.includes("/auth/refresh-token") ||
      config.url.includes("/users/login") ||
      config.url.includes("/users/register")
    );
    
    // FORCE auth endpoints to be treated as public (safety net)
    const finalIsPublicEndpoint = isPublicEndpoint || isAuthEndpoint;
    
    // For non-public endpoints, ALWAYS try to attach token with retry logic
    // IMPORTANT: Public endpoints should NEVER try to get a token to avoid timeouts
    if (!finalIsPublicEndpoint) {
      // Special logging for auth endpoints to debug timeout issues
      if (config.url?.includes("/auth/register") || config.url?.includes("/auth/login")) {
        console.warn(`[API Request] ⚠️ WARNING: ${config.url} is NOT recognized as public endpoint!`);
        console.warn(`[API Request] This will cause token retrieval which may timeout.`);
        console.warn(`[API Request] Endpoint classification:`, {
          url: config.url,
          isProtected: isProtectedEndpoint,
          isPublic: isPublicEndpoint,
          isAuthEndpoint: isAuthEndpoint,
          publicEndpoints: publicEndpoints.filter(e => config.url?.includes(e.split('/').pop() || '')),
        });
      }
      
      // Call getAccessToken which has its own internal retry logic
      // This handles race conditions where session might not be ready immediately
      const token = await getAccessToken(0);
      
      if (token) {
        // CRITICAL: Ensure Authorization header is ALWAYS set with Bearer token
        // Use multiple methods to ensure header is set (Axios version compatibility)
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        config.headers.Authorization = `Bearer ${token}`;
        
        // Ensure it's not undefined
        if (!config.headers.Authorization) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (process.env.NODE_ENV === "development") {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - ✅ Token attached`);
        }
        
      } else {
        // CRITICAL: For authenticated endpoints, we MUST have a token
        // If no token after retries (handled internally by getAccessToken), this is a critical error
        const errorMsg = `❌ CRITICAL: No token available for authenticated endpoint: ${config.url}`;
        console.error(`[API Request] ${config.method?.toUpperCase()} ${config.url} - ${errorMsg}`);
        
        if (process.env.NODE_ENV === "development") {
          console.error("[API Request] Token retrieval failed - this request WILL return 401:", {
            url: config.url,
            method: config.method,
            isPublic: isPublicEndpoint,
            timestamp: new Date().toISOString(),
          });
        }
        
        // Prevent repeated unauthorized calls when the session is invalid.
        // Trigger a single redirect to login and reject this request early.
        if (typeof window !== "undefined" && !authRecoveryInProgress) {
          authRecoveryInProgress = true;
          try {
            const nextAuth = await import("next-auth/react");
            await nextAuth.signOut({ callbackUrl: "/login", redirect: true });
          } catch (signOutError) {
            console.error("[Auth Recovery] Failed to sign out after missing token:", toLoggableError(signOutError));
          } finally {
            setTimeout(() => {
              authRecoveryInProgress = false;
            }, 1000);
          }
        }

        const authError = new Error("Authentication required: Please log in again");
        (authError as any).isAuthError = true;
        (authError as any).code = "AUTH_REQUIRED";
        return Promise.reject(authError);
        
      }
    } else {
      // Public endpoint or auth endpoint - no token needed, but log for debugging
      if (isAuthEndpoint || config.url?.includes("/auth/register") || config.url?.includes("/auth/login")) {
        console.log(`[API Request] ✅ ${config.method?.toUpperCase()} ${config.url} - Public/Auth endpoint (no token required)`);
        console.log(`[API Request] Request will proceed without authentication token`);
      } else if (process.env.NODE_ENV === "development") {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Public endpoint (no token required)`);
      }
    }
    
    // Final safety check: if this is an auth endpoint, ensure no token was accidentally attached
    if (isAuthEndpoint && config.headers?.Authorization) {
      console.warn(`[API Request] ⚠️ WARNING: Auth endpoint ${config.url} has Authorization header - removing it`);
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    const isAxiosError = Axios.isAxiosError(error);
    const axiosError = isAxiosError ? error : null;
    console.error("[API Request] Request interceptor error:", {
      message: axiosError?.message ?? (error instanceof Error ? error.message : "Unknown request interceptor error"),
      code: axiosError?.code ?? null,
      status: axiosError?.response?.status ?? null,
      url: axiosError?.config?.url ?? null,
      method: axiosError?.config?.method ?? null,
      responseData: axiosError?.response?.data ?? null,
    });
    return Promise.reject(error);
  }
);

const toLoggableError = (error: unknown) => {
  if (Axios.isAxiosError(error)) {
    return {
      type: "axios",
      message: error.message ?? "Axios request failed",
      code: error.code ?? null,
      status: error.response?.status ?? null,
      statusText: error.response?.statusText ?? null,
      url: error.config?.url ?? null,
      method: error.config?.method ?? null,
      responseData: error.response?.data ?? null,
      axios: typeof error.toJSON === "function" ? error.toJSON() : null,
    };
  }

  if (error instanceof Error) {
    const ownProps = Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (error as unknown as Record<string, unknown>)[key];
      return acc;
    }, {});

    return {
      type: "error",
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      ownProps,
    };
  }

  if (error && typeof error === "object") {
    const objectValue = error as Record<string, unknown>;
    return {
      type: "object",
      keys: Object.keys(objectValue),
      value: objectValue,
    };
  }

  return {
    type: typeof error,
    value: error ?? null,
  };
};

const hasUsefulErrorFields = (payload: Record<string, unknown>): boolean => {
  return Object.values(payload).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number" || typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
    return false;
  });
};

const safeSerializeForLog = (value: unknown): string => {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_key, currentValue) => {
        if (currentValue instanceof Error) {
          return {
            name: currentValue.name,
            message: currentValue.message,
            stack: process.env.NODE_ENV === "development" ? currentValue.stack : undefined,
            ...Object.getOwnPropertyNames(currentValue).reduce<Record<string, unknown>>((acc, prop) => {
              acc[prop] = (currentValue as unknown as Record<string, unknown>)[prop];
              return acc;
            }, {}),
          };
        }

        if (currentValue && typeof currentValue === "object") {
          if (seen.has(currentValue as object)) {
            return "[Circular]";
          }
          seen.add(currentValue as object);
        }

        return currentValue;
      },
      2
    );
  } catch (serializeError) {
    return `{"serializeError":"${serializeError instanceof Error ? serializeError.message : "unknown"}"}`;
  }
};

// Response interceptor
apiClient.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error) => {
    const isAxiosError = Axios.isAxiosError(error);
    const axiosError = isAxiosError ? error : null;
    const response = axiosError?.response;
    const data = response?.data as Record<string, unknown> | undefined;
    const status = response?.status;
    const requestUrl = axiosError?.config?.url ?? null;
    const requestMethod = axiosError?.config?.method ?? null;

    if (requestUrl?.includes("/jobs/ai-generate")) {
      console.error("[Axios Response] ❌ AI job generation error:", {
        message: axiosError?.message ?? (error instanceof Error ? error.message : "Unknown error"),
        status: status ?? null,
        statusText: response?.statusText ?? null,
        code: axiosError?.code ?? null,
        url: requestUrl,
        method: requestMethod,
        data: response?.data ?? null,
      });
    }

    /** HTML error pages (e.g. Next.js 404) must not become user-visible error text. */
    const isProbablyHtmlResponseBody = (s: string): boolean => {
      const t = s.trim();
      if (t.length < 80) return false;
      const head = t.slice(0, 240).toLowerCase();
      if (head.startsWith("<!doctype html") || head.startsWith("<html")) return true;
      if (t.includes("_next/static/") && (t.includes("<script") || t.includes("<head"))) return true;
      return false;
    };

    const normalizeErrorMessage = (value: unknown): string | null => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        if (isProbablyHtmlResponseBody(trimmed)) return null;
        return trimmed;
      }
      if (Array.isArray(value)) {
        const parts = value
          .map((item) => normalizeErrorMessage(item))
          .filter((item): item is string => Boolean(item));
        return parts.length > 0 ? parts.join("; ") : null;
      }
      if (value && typeof value === "object") {
        const candidate = value as Record<string, unknown>;
        if (typeof candidate.msg === "string" && candidate.msg.trim() !== "") {
          return candidate.msg.trim();
        }
        if (typeof candidate.message === "string" && candidate.message.trim() !== "") {
          return candidate.message.trim();
        }
        if (typeof candidate.detail === "string" && candidate.detail.trim() !== "") {
          return candidate.detail.trim();
        }
      }
      return null;
    };

    const isNetworkError = isAxiosError ? !response : false;
    const isLoginEndpoint = requestUrl?.includes("/auth/login");
    const isRefreshEndpoint =
      requestUrl?.includes("/auth/refresh-token") || requestUrl?.includes("/auth/refresh_token");
    const originalRequest = axiosError?.config as (typeof axiosError.config & { _retry?: boolean }) | undefined;

    if (
      isAxiosError &&
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginEndpoint &&
      !isRefreshEndpoint
    ) {
      originalRequest._retry = true;
      const refreshedAccessToken = await refreshAccessToken();

      if (refreshedAccessToken) {
        if (!originalRequest.headers) {
          originalRequest.headers = {} as any;
        }
        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        return apiClient.request(originalRequest);
      }

      // If refresh failed, the session is no longer valid.
      // Trigger a single recovery redirect to login instead of infinite failing retries.
      if (typeof window !== "undefined" && !authRecoveryInProgress) {
        authRecoveryInProgress = true;
        try {
          const nextAuth = await import("next-auth/react");
          await nextAuth.signOut({ callbackUrl: "/login", redirect: true });
        } catch (signOutError) {
          console.error("[Auth Recovery] Failed to sign out after 401:", toLoggableError(signOutError));
        } finally {
          setTimeout(() => {
            authRecoveryInProgress = false;
          }, 1000);
        }
      }
    }
    const serverMessage =
      normalizeErrorMessage(data?.message) ||
      normalizeErrorMessage(data?.detail) ||
      normalizeErrorMessage(data);

    // Determine error message based on error type
    let message = "Something went wrong";
    if (isNetworkError && isAxiosError && axiosError) {
      if (axiosError.code === "ECONNABORTED" || axiosError.message?.includes("timeout")) {
        message = "Request timeout - please try again";
      } else if (axiosError.code === "ERR_NETWORK" || axiosError.message?.includes("Network Error")) {
        message = "Network error - please check your connection";
      } else {
        message = axiosError.message || "Network request failed";
      }
    } else if (!isAxiosError) {
      message = error instanceof Error ? error.message : "Request failed";
    } else if (axiosError) {
      message =
        serverMessage ||
        normalizeErrorMessage(axiosError.message) ||
        (status === 401
          ? (isLoginEndpoint ? "Invalid email or password" : "Unauthorized - please login again")
          : "Something went wrong");
      
      // If message is still generic "Error", try to get more details
      if (message === "Error" || !normalizeErrorMessage(message)) {
        if (status === 401) {
          message = isLoginEndpoint ? "Invalid email or password" : "Unauthorized - please login again";
        } else if (status === 403) {
          message = "You do not have permission to perform this action";
        } else if (status === 404) {
          message = "Resource not found";
        } else if (typeof status === "number" && status >= 500) {
          message = "Server error - please try again later";
        } else {
          message = "Request failed - please try again";
        }
      }
    } else {
      message = error instanceof Error ? error.message : "Request failed";
    }
    
    const rawStatusCode = typeof data?.status_code === "number" ? data.status_code : undefined;
    const code: string | number = rawStatusCode ?? status ?? axiosError?.code ?? (isNetworkError ? "NETWORK_ERROR" : 500);
    const statusCode = rawStatusCode ?? status ?? 500;

    // Don't log 404 errors - they're often handled gracefully by queries
    // (e.g., checking if a resource exists)
    // Don't log 403 errors - they're permission errors that should be handled by UI
    const shouldLogError = status !== 404 && status !== 403 && status !== 401;

    if (shouldLogError) {
      const detail = toLoggableError(error);
      const logPayload: Record<string, unknown> = {
        message,
        status: status ?? null,
        code,
        url: requestUrl,
        method: requestMethod,
        responseData: response?.data ?? null,
        detail,
      };

      const payload = hasUsefulErrorFields(logPayload)
        ? logPayload
        : {
            message: message || "Unknown request error",
            status: status ?? null,
            code: code ?? "UNKNOWN_ERROR",
            rawErrorType: typeof error,
            detail,
          };

      console.error(`Axios Error: ${safeSerializeForLog(payload)}`);
    }

    const apiErrorMetadata = {
      status: status ?? null,
      code,
      responseData: response?.data ?? null,
      url: requestUrl,
      method: requestMethod,
    };

    if (!isAxiosError) {
      return Promise.reject(new ApiError(message, 500, apiErrorMetadata));
    }

    if (status === 401) {
      const errorMsg =
        isLoginEndpoint && !serverMessage
          ? "Invalid email or password"
          : (message || "Unauthorized - please login again");
      return Promise.reject(new ApiError(errorMsg, 401, apiErrorMetadata));
    }

    if (status === 403) {
      return Promise.reject(new ApiError(message || "You do not have permission to perform this action", 403, apiErrorMetadata));
    }

    if (status === 404) {
      return Promise.reject(new ApiError(message || "Resource not found", 404, apiErrorMetadata));
    }

    return Promise.reject(new ApiError(message, statusCode, apiErrorMetadata));
  }
);

export default apiClient;
