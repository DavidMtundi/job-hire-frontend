import Axios from "axios";
import { getSession } from "next-auth/react"; // client side
import { authSession } from "~/lib/auth"; // wrapper for getServerSession
import { siteConfig } from "~/config/site";
import { publicEndpoints } from "~/constants";
import { ApiError } from "~/utils/api-utils";

const API_CONFIG = {
  timeout: 30000, // Increased timeout
  retryAttempts: 3,
  retryDelay: 1000, // Base delay in ms
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Retry on these status codes
};

// Determine the correct API base URL
// Priority order:
// 1. NEXT_PUBLIC_BASE_API_URL (set via environment variable - works for both client and server)
// 2. BACKEND_URL (server-side fallback for Docker)
// 3. siteConfig.apiBaseUrl (client-side fallback)
// 4. Default to localhost for local development
const getApiBaseUrl = () => {
  // First check if NEXT_PUBLIC_BASE_API_URL is set (works for both client and server)
  if (process.env.NEXT_PUBLIC_BASE_API_URL) {
    return process.env.NEXT_PUBLIC_BASE_API_URL;
  }
  
  if (typeof window === "undefined") {
    // Server-side: use BACKEND_URL (Docker service name) or fallback
    return process.env.BACKEND_URL || siteConfig.apiBaseUrl || "http://backend:8002";
  }
  
  // Client-side: use configured URL from site config
  return siteConfig.apiBaseUrl || "http://localhost:8002";
};

// Create an Axios instance
const apiClient = Axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_CONFIG.timeout,
});

// Helper: get access token depending on environment
const getAccessToken = async () => {
  try {
    if (typeof window === "undefined") {
      // server-side
      const session = await authSession();
      return session?.tokens?.accessToken;
    } else {
      // client-side
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      const session = await res.json();
      return session?.tokens?.accessToken ?? null;
      // const session = await getSession();
      // return session?.tokens?.accessToken;
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    if (
      config.url &&
      !publicEndpoints.some((endpoint) => config.url?.includes(endpoint))
    ) {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
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
    if (status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
      return Promise.reject(new ApiError("Unauthorized", 401));
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
