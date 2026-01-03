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
// Server-side (in Docker): use Docker service name
// Client-side (browser): use localhost
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    // Server-side: use Docker service name
    return process.env.BACKEND_URL || "http://backend:8002";
  }
  // Client-side: use configured URL (localhost:8002)
  return siteConfig.apiBaseUrl;
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

      // Only log if we have meaningful error information
      // Check that we have at least one meaningful field (not just empty object)
      const hasMeaningfulInfo = Object.keys(errorInfo).length > 0 && 
        (errorInfo.message || errorInfo.status || errorInfo.type || errorInfo.url);
      
      if (hasMeaningfulInfo) {
        console.error("Axios Error:", errorInfo);
      } else {
        // If error object is completely empty/malformed, log what we can
        const fallbackInfo: Record<string, any> = {
          errorType: typeof error,
          errorString: String(error),
          hasResponse: !!error?.response,
          hasRequest: !!error?.request,
        };
        
        if (error && typeof error === 'object') {
          try {
            fallbackInfo.errorKeys = Object.keys(error);
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
