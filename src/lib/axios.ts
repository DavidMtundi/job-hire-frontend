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
  
  return url;
};

// Determine the correct API base URL
// Priority order:
// 1. NEXT_PUBLIC_BASE_API_URL (set via environment variable - works for both client and server)
// 2. BACKEND_URL (server-side fallback for Docker)
// 3. siteConfig.apiBaseUrl (client-side fallback)
// 4. Default to localhost for local development
const getApiBaseUrl = () => {
  let baseUrl: string;
  
  // First check if NEXT_PUBLIC_BASE_API_URL is set (works for both client and server)
  if (process.env.NEXT_PUBLIC_BASE_API_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  } else if (typeof window === "undefined") {
    // Server-side: use BACKEND_URL (Docker service name) or fallback
    baseUrl = process.env.BACKEND_URL || siteConfig.apiBaseUrl || "http://backend:8002";
  } else {
    // Client-side: use configured URL from site config
    baseUrl = siteConfig.apiBaseUrl || "http://localhost:8002";
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
  debugger; // BREAKPOINT 31: Token retrieval function entry
  const maxRetries = 2;
  
  try {
    if (typeof window === "undefined") {
      debugger; // BREAKPOINT 32: Server-side token retrieval
      // server-side
      const session = await authSession();
      return session?.tokens?.accessToken ?? null;
    } else {
      debugger; // BREAKPOINT 33: Client-side token retrieval
      // client-side - Use getSession from next-auth/react (more reliable than fetch)
      try {
        // Force a fresh session fetch if retrying
        // Note: getSession doesn't accept options in newer versions of next-auth
        const session = await getSession();
        
        debugger; // BREAKPOINT 34: Session retrieved, inspect session object
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
        
        debugger; // BREAKPOINT 35: Token extracted from session
        if (!token) {
          debugger; // BREAKPOINT 36: No token found - investigate why
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
      debugger; // BREAKPOINT 22: Axios request interceptor for AI endpoint
    }
    
    // Helper function to check if URL matches endpoint pattern
    const urlMatchesEndpoint = (url: string, endpoint: string): boolean => {
      const urlWithoutQuery = url.split("?")[0];
      // Exact match
      if (urlWithoutQuery === endpoint) return true;
      // Check if URL starts with endpoint (for endpoints that have sub-paths)
      if (endpoint.endsWith("/")) {
        return urlWithoutQuery.startsWith(endpoint);
      }
      // For non-trailing-slash endpoints, check exact match or followed by / or ?
      return urlWithoutQuery === endpoint || 
             urlWithoutQuery.startsWith(endpoint + "/") || 
             urlWithoutQuery.startsWith(endpoint + "?");
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
    const isPublicEndpoint = !isProtectedEndpoint && config.url && (
      // Check explicit public endpoints
      publicEndpoints.some((endpoint) => urlMatchesEndpoint(config.url || "", endpoint)) ||
      // GET requests to /jobs/{job_id} are public (no auth required in backend)
      // But exclude protected paths like /jobs/ai-generate
      (config.method?.toUpperCase() === "GET" && 
       /^\/jobs\/[^/]+$/.test(config.url.split("?")[0]) && 
       !config.url.includes("/jobs/ai-generate"))
    );
    
    // For non-public endpoints, ALWAYS try to attach token with retry logic
    if (!isPublicEndpoint) {
      if (config.url?.includes("/jobs/ai-generate")) {
        console.log("[Axios Interceptor] 🔑 Starting token retrieval for AI endpoint...");
        debugger; // BREAKPOINT 23: Before token retrieval for AI endpoint
      }
      
      // Call getAccessToken which has its own internal retry logic
      // This handles race conditions where session might not be ready immediately
      const tokenStartTime = Date.now();
      const token = await getAccessToken(0);
      const tokenRetrievalDuration = Date.now() - tokenStartTime;
      
      if (config.url?.includes("/jobs/ai-generate")) {
        debugger; // BREAKPOINT 24: After token retrieval for AI endpoint
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
          debugger; // BREAKPOINT 25: Token attached successfully
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
          debugger; // BREAKPOINT 26: No token available for AI endpoint - CRITICAL
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
      // Public endpoint - no token needed, but log for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Public endpoint (no token required)`);
      }
    }
    
    // Final verification: For authenticated endpoints, ensure Authorization header exists
    if (!isPublicEndpoint && config.url?.includes("/jobs/ai-generate")) {
      debugger; // BREAKPOINT 27: Request config finalized, ready to send
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
    if (error?.config?.url?.includes("/jobs/ai-generate")) {
      debugger; // BREAKPOINT 28: Request interceptor error
    }
    console.error("[API Request] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

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
      debugger; // BREAKPOINT 29: Successful response from AI endpoint
      console.log("[Axios Response Interceptor] Full response data:", JSON.stringify(res.data, null, 2));
      console.log("========================================");
    }
    return res;
  },
  (error) => {
    // Add breakpoint for AI job generation errors
    if (error?.config?.url?.includes("/jobs/ai-generate")) {
      debugger; // BREAKPOINT 30: Error response from AI endpoint
      console.error("[Axios Response] ❌ AI job generation error:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        config: error?.config,
      });
    }
    // First, log the raw error structure for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Raw Axios Error Object:", {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        hasResponse: !!error?.response,
        hasRequest: !!error?.request,
        hasConfig: !!error?.config,
        errorString: String(error),
      });
    }

    // Handle network errors (no response) vs HTTP errors (with response)
    const isNetworkError = !error?.response;
    const response = error?.response || {};
    const { data, status } = response;
    
    // Determine error message based on error type
    let message = "Something went wrong";
    if (isNetworkError) {
      if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
        message = "Request timeout - please try again";
      } else if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
        message = "Network error - please check your connection";
      } else {
        message = error?.message || "Network request failed";
      }
    } else {
      message = data?.message || data?.detail || error?.message || "Something went wrong";
    }
    
    const code = data?.status_code || status || (error?.code ? String(error.code) : (isNetworkError ? "NETWORK_ERROR" : 500));

    // Don't log 404 errors - they're often handled gracefully by queries
    // (e.g., checking if a resource exists)
    // Don't log 403 errors - they're permission errors that should be handled by UI
    const shouldLogError = status !== 404 && status !== 403;

    if (shouldLogError && error) {
      // Log detailed error for debugging
      // Build error info object with only defined values
      const errorInfo: Record<string, any> = {};
      
      // Always include message if it's meaningful
      if (message && message !== "Something went wrong") {
        errorInfo.message = message;
      }
      
      // Include error type for network errors
      if (isNetworkError) {
        errorInfo.type = "Network Error";
        if (error?.code) errorInfo.code = error.code;
      } else {
      if (status) errorInfo.status = status;
      if (response?.statusText) errorInfo.statusText = response.statusText;
      if (data && Object.keys(data).length > 0) errorInfo.data = data;
      }
      
      // Include request details if available
      if (error?.config?.url) errorInfo.url = error.config.url;
      if (error?.config?.method) errorInfo.method = error.config.method;
      if (error?.config?.baseURL) errorInfo.baseURL = error.config.baseURL;
      
      // Include additional error details
      if (error?.message && error.message !== message) errorInfo.errorMessage = error.message;
      if (error?.code && !isNetworkError) errorInfo.code = error.code;
      
      // Only include stack trace in development
      if (process.env.NODE_ENV === "development" && error?.stack) {
        errorInfo.stack = error.stack;
      }

      // Always capture response and request details first
      const detailedError: Record<string, any> = {};
      
      // Add basic error info (always add message and status if available)
      if (message) detailedError.message = message;
      if (code) detailedError.code = code;
      if (status) detailedError.status = status;
      if (isNetworkError) detailedError.type = "Network Error";
      
      // Add all errorInfo properties
      Object.assign(detailedError, errorInfo);
      
      // Add response details (check if response exists, not just if it has data)
      if (error?.response || response) {
        const resp = error?.response || response;
        detailedError.response = {
          status: resp?.status || status || null,
          statusText: resp?.statusText || null,
          data: resp?.data || data || null,
          headers: resp?.headers ? (typeof resp.headers === 'object' ? Object.keys(resp.headers) : resp.headers) : [],
        };
      }
      
      // Add request details if available
      if (error?.config) {
        detailedError.request = {
          url: error.config.url || null,
          method: error.config.method || null,
          baseURL: error.config.baseURL || null,
          params: error.config.params || null,
          data: error.config.data || null,
        };
      }
      
      // Add error instance details (always try to capture)
      detailedError.errorInstance = {
        type: typeof error,
        constructor: error?.constructor?.name || null,
        isError: error instanceof Error,
        name: error instanceof Error ? error.name : (error?.name || null),
        message: error instanceof Error ? error.message : (error?.message || null),
        stack: (process.env.NODE_ENV === "development" && error instanceof Error) ? error.stack : undefined,
      };
      
      // Add network error details
      if (isNetworkError) {
        detailedError.networkError = {
          code: error?.code || null,
          message: error?.message || null,
        };
      }
      
      // Add raw error properties (always try)
      if (error) {
        try {
          if (typeof error === 'object') {
            const errorKeys = Object.keys(error);
            detailedError.rawErrorKeys = errorKeys;
            // Try to get some common properties safely
            if ('code' in error) detailedError.rawCode = (error as any).code;
            if ('message' in error) detailedError.rawMessage = (error as any).message;
            if ('response' in error) detailedError.hasResponseProperty = true;
            if ('request' in error) detailedError.hasRequestProperty = true;
            if ('config' in error) detailedError.hasConfigProperty = true;
          }
          detailedError.rawErrorString = String(error);
        } catch (e) {
          detailedError.rawErrorParseError = String(e);
        }
      }
      
      // Always log - we should have at least message or code by now
      console.error("Axios Error:", detailedError);
      
      // Also log fallback if detailedError is still empty (shouldn't happen)
      if (Object.keys(detailedError).length === 0) {
        // If error object is completely empty/malformed, log what we can
        const fallbackInfo: Record<string, any> = {
          errorType: typeof error,
          errorString: String(error),
          hasResponse: !!error?.response,
          hasRequest: !!error?.request,
          errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        };
        
        if (error && typeof error === 'object') {
          try {
            // Try to stringify the error to see its structure
            if (error instanceof Error) {
              fallbackInfo.errorName = error.name;
              fallbackInfo.errorMessage = error.message;
            }
            // Capture response if available
            if (error.response) {
              fallbackInfo.responseStatus = error.response.status;
              fallbackInfo.responseData = error.response.data;
            }
            // Capture request if available
            if (error.config) {
              fallbackInfo.requestUrl = error.config.url;
              fallbackInfo.requestMethod = error.config.method;
            }
          } catch (e) {
            fallbackInfo.stringifyError = "Could not stringify error";
          }
        }
        
        // Always log fallback info if we have any details
        if (Object.keys(fallbackInfo).length > 4 || 
          (fallbackInfo.errorString && fallbackInfo.errorString !== "[object Object]")) {
          console.error("Axios Error (malformed):", fallbackInfo);
        } else {
          // Last resort: log the raw error
          console.error("Axios Error (raw):", error);
        }
      }
    }

    // Handle 401 Unauthorized - redirect to login
    // CRITICAL: Only redirect for actual 401 errors, not for requests we prevented
    if (status === 401 && typeof window !== "undefined") {
      // Don't redirect if already on login page to avoid redirect loop
      const currentPath = window.location.pathname;
      
      // Check if this was a request we prevented (shouldn't happen, but safety check)
      const wasPrevented = error?.isAuthError === true || error?.code === "AUTH_REQUIRED";
      
      if (wasPrevented) {
        // This shouldn't reach here, but if it does, don't redirect
        console.warn("[401 Handler] Request was prevented but still reached error handler");
        return Promise.reject(new ApiError(message || "Authentication required", 401));
      }
      
      if (!currentPath.includes("/login")) {
        // Log detailed information before redirecting (in development)
        if (process.env.NODE_ENV === "development") {
          console.error("[401 Redirect] Unauthorized request - redirecting to login", {
            url: error?.config?.url,
            method: error?.config?.method,
            currentPath,
            hasAuthHeader: !!error?.config?.headers?.Authorization,
            authHeaderPreview: error?.config?.headers?.Authorization && typeof error.config.headers.Authorization === 'string'
              ? error.config.headers.Authorization.substring(0, 30) + "..."
              : "N/A",
            authHeaderFull: error?.config?.headers?.Authorization ? "Present" : "MISSING",
            responseMessage: message,
            responseData: data,
            statusCode: status,
          });
        }
        
        // For AI job generation endpoint, add more context
        if (error?.config?.url?.includes("/jobs/ai-generate")) {
          debugger; // BREAKPOINT 30: 401 error for AI endpoint - redirecting
          console.error("[401 Redirect] AI Job Generation failed with 401:", {
            requestUrl: error?.config?.url,
            requestMethod: error?.config?.method,
            requestHeaders: error?.config?.headers ? Object.keys(error?.config?.headers) : [],
            authHeaderPresent: !!error?.config?.headers?.Authorization,
            authHeaderValue: error?.config?.headers?.Authorization || "MISSING",
            responseStatus: status,
            responseMessage: message,
            responseData: data,
          });
        }
        
        // Log ALL 401 redirects with full context
        console.error("========================================");
        console.error("[401 Redirect] 🔒 UNAUTHORIZED - Redirecting to login");
        console.error("[401 Redirect] Failed request details:", {
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          fullUrl: `${error?.config?.baseURL || ''}${error?.config?.url}`,
          hasAuthHeader: !!error?.config?.headers?.Authorization,
          authHeaderPreview: error?.config?.headers?.Authorization && typeof error.config.headers.Authorization === 'string'
            ? error.config.headers.Authorization.substring(0, 50)
            : "MISSING",
          requestData: error?.config?.data,
          currentPath: window.location.pathname,
          responseStatus: status,
          responseMessage: message,
          responseData: data,
          timestamp: new Date().toISOString(),
        });
        console.error("[401 Redirect] This redirect is happening because of the above failed request");
        console.error("========================================");
        
        // Small delay to allow error toast to show before redirect
        setTimeout(() => {
          console.error("[401 Redirect] Executing redirect to /login now...");
          window.location.href = "/login";
        }, 100);
      }
      return Promise.reject(new ApiError(message || "Unauthorized - please login again", 401));
    }

    // Handle 403 Forbidden - permission denied
    if (status === 403) {
      return Promise.reject(new ApiError(message || "You do not have permission to perform this action", 403));
    }

    // Handle 404 Not Found - return a proper error
    if (status === 404) {
      return Promise.reject(new ApiError(message || "Resource not found", 404));
    }

    // For all other errors, reject with ApiError
    return Promise.reject(new ApiError(message, Number(code) || 500));
  }
);

export default apiClient;
