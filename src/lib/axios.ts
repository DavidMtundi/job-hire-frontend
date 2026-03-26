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
            return null;
          }
      const session = await res.json();
          const fallbackToken = session?.tokens?.accessToken ?? null;
          
          if (fallbackToken) {
            console.log("[getAccessToken] ✅ Token retrieved via fallback fetch");
          } else {
            console.error("[getAccessToken] ❌ Fallback fetch also returned no token");
          }
          
          return fallbackToken;
        } catch (fetchError) {
          console.error("[getAccessToken] Fallback fetch also failed:", fetchError);
          return null;
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
    
    return null;
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
    
    // Add breakpoint for AI job generation endpoint specifically
    if (config.url?.includes("/jobs/ai-generate")) {
      console.log("========================================");
      console.log("[Axios Interceptor] 🔵 REQUEST INTERCEPTOR: AI Job Generation");
      console.log("[Axios Interceptor] Request intercepted at:", new Date().toISOString());
      console.log("[Axios Interceptor] Request details:", {
        url: config.url,
        fullUrl: `${config.baseURL}${config.url}`,
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        data: config.data,
        existingHeaders: Object.keys(config.headers || {}),
        existingAuthHeader: !!config.headers?.Authorization,
        authHeaderValue: config.headers?.Authorization && typeof config.headers.Authorization === 'string' 
          ? config.headers.Authorization.substring(0, 50) + "..." 
          : "NONE",
      });
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
      
      if (config.url?.includes("/jobs/ai-generate")) {
        console.log("[Axios Interceptor] 🔑 Starting token retrieval for AI endpoint...");
      }
      
      // Call getAccessToken which has its own internal retry logic
      // This handles race conditions where session might not be ready immediately
      const tokenStartTime = Date.now();
      const token = await getAccessToken(0);
      const tokenRetrievalDuration = Date.now() - tokenStartTime;
      
      if (config.url?.includes("/jobs/ai-generate")) {
        console.log("[Axios Interceptor] 🔑 Token retrieval completed");
        console.log("[Axios Interceptor] Token retrieval duration:", tokenRetrievalDuration, "ms");
        console.log("[Axios Interceptor] Token retrieval result:", {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? token.substring(0, 30) + "..." : "NONE - TOKEN MISSING!",
          tokenStart: token ? token.substring(0, 10) : "N/A",
        });
        
        if (!token) {
          console.error("[Axios Interceptor] ❌ CRITICAL: NO TOKEN RETRIEVED!");
          console.error("[Axios Interceptor] This request will likely fail with 401 Unauthorized");
        } else {
          console.log("[Axios Interceptor] ✅ Token successfully retrieved");
        }
      }
      
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
        
        if (config.url?.includes("/jobs/ai-generate")) {
          console.log("[Axios Interceptor] ✅ TOKEN ATTACHED TO REQUEST");
          console.log("[Axios Interceptor] Authorization header details:", {
            headerExists: !!config.headers.Authorization,
            headerLength: config.headers.Authorization?.length || 0,
            headerPrefix: config.headers.Authorization && typeof config.headers.Authorization === 'string' 
              ? config.headers.Authorization.substring(0, 20) 
              : undefined,
            headerFull: config.headers.Authorization ? "Bearer [TOKEN]" : "MISSING",
            allHeaderKeys: Object.keys(config.headers || {}),
          });
          console.log("[Axios Interceptor] Request config final state:", {
            url: config.url,
            method: config.method,
            hasData: !!config.data,
            dataKeys: config.data ? Object.keys(config.data) : [],
          });
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
        
        if (config.url?.includes("/jobs/ai-generate")) {
          console.error("[Axios Interceptor] ❌ CRITICAL: NO TOKEN AVAILABLE for AI endpoint after all retries!");
          console.error("[Axios Interceptor] This will cause a 401 Unauthorized error. Check:");
          console.error("  1. Is user logged in?");
          console.error("  2. Is NextAuth session properly configured?");
          console.error("  3. Are tokens being stored in JWT callback?");
          console.error("  4. Is getSession() returning the session with tokens?");
          
          // Try to get session one more time to see what's happening
          if (typeof window !== "undefined") {
            try {
              // Use dynamic import for next-auth/react
              const nextAuthReact = await import("next-auth/react");
              const lastAttemptSession = await nextAuthReact.getSession();
              console.error("[Axios Interceptor] Last attempt session check:", {
                hasSession: !!lastAttemptSession,
                sessionKeys: lastAttemptSession ? Object.keys(lastAttemptSession) : [],
                hasTokens: !!lastAttemptSession?.tokens,
                tokensKeys: lastAttemptSession?.tokens ? Object.keys(lastAttemptSession.tokens) : [],
                accessTokenPresent: !!lastAttemptSession?.tokens?.accessToken,
                userEmail: lastAttemptSession?.user?.email,
                isAuthenticated: lastAttemptSession?.isAuthenticated,
              });
              
              // Try to trigger a session refresh if session exists but no tokens
              if (lastAttemptSession && !lastAttemptSession.tokens?.accessToken) {
                console.warn("[Axios Interceptor] Session exists but no tokens - attempting session refresh");
                await nextAuthReact.getSession();
              }
            } catch (e) {
              console.error("[Axios Interceptor] Failed to check session in error handler:", e);
            }
          }
        }
        
        // CRITICAL FIX: For critical authenticated endpoints, reject immediately to prevent 401 redirect
        // This gives us a chance to handle the error gracefully in the UI
        // Only do this for POST/PUT/DELETE requests to avoid blocking GET requests unnecessarily
        const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '');
        
        if (isModifyingRequest && config.url?.includes("/jobs/ai-generate")) {
          // Reject the promise immediately to prevent the request
          // This allows the UI error handler to show a message instead of redirecting
          const rejectionError = new Error("Authentication required: Please log in again");
          (rejectionError as any).isAuthError = true;
          (rejectionError as any).code = "AUTH_REQUIRED";
          return Promise.reject(rejectionError);
        }
        
        // For other requests, proceed and let backend handle 401
        // But log a clear warning
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
    
    // Final verification: For authenticated endpoints, ensure Authorization header exists
    if (!finalIsPublicEndpoint && config.url?.includes("/jobs/ai-generate")) {
      const hasAuthHeader = !!(config.headers.Authorization || config.headers.get?.('Authorization'));
      console.log("[Axios Interceptor] Final request config verification:", {
        url: config.url,
        method: config.method,
        hasAuthHeader,
        authHeaderExists: !!config.headers.Authorization,
        authHeaderMethod: typeof config.headers.get === 'function' ? config.headers.get('Authorization') : 'N/A',
        authHeaderPreview: config.headers.Authorization && typeof config.headers.Authorization === 'string' 
          ? config.headers.Authorization.substring(0, 30) + "..." 
          : "MISSING",
        allHeaders: Object.keys(config.headers),
        data: config.data,
      });
      
      if (!hasAuthHeader) {
        console.error("[Axios Interceptor] ⚠️ WARNING: Authorization header missing from final config!");
      }
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
    return {
      type: "error",
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }

  return {
    type: typeof error,
    value: error ?? null,
  };
};

// Response interceptor
apiClient.interceptors.response.use(
  (res) => {
    // Add breakpoint for AI job generation responses
    if (res.config.url?.includes("/jobs/ai-generate")) {
      console.log("========================================");
      console.log("[Axios Response Interceptor] ✅ RESPONSE SUCCESS: AI Job Generation");
      console.log("[Axios Response Interceptor] Response received at:", new Date().toISOString());
      console.log("[Axios Response Interceptor] Response details:", {
        url: res.config.url,
        fullUrl: `${res.config.baseURL || ''}${res.config.url}`,
        status: res.status,
        statusText: res.statusText,
        headers: Object.keys(res.headers || {}),
        contentType: res.headers['content-type'],
        dataType: typeof res.data,
        dataKeys: res.data ? Object.keys(res.data) : [],
        hasData: !!res.data,
        dataPreview: res.data ? JSON.stringify(res.data).substring(0, 300) + "..." : "NONE",
      });
      console.log("[Axios Response Interceptor] Full response data:", JSON.stringify(res.data, null, 2));
      console.log("========================================");
    }
    return res;
  },
  (error) => {
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

    const normalizeErrorMessage = (value: unknown): string | null => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
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
    const shouldLogError = status !== 404 && status !== 403;

    if (shouldLogError) {
      console.error("Axios Error:", {
        message,
        status: status ?? null,
        code,
        url: requestUrl,
        method: requestMethod,
        responseData: response?.data ?? null,
        detail: toLoggableError(error),
      });
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
