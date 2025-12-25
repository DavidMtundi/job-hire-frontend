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
    // Handle different error structures
    const response = error?.response || {};
    const { data, status } = response;
    const message = data?.message || data?.detail || error?.message || "Something went wrong";
    const code = data?.status_code || status || (error?.code ? String(error.code) : 500);

    // Don't log 404 errors - they're often handled gracefully by queries
    // (e.g., checking if a resource exists)
    const shouldLogError = status !== 404;

    if (shouldLogError) {
      // Log detailed error for debugging
      // Build error info object with only defined values
      const errorInfo: Record<string, any> = {};
      
      if (message) errorInfo.message = message;
      if (status) errorInfo.status = status;
      if (response?.statusText) errorInfo.statusText = response.statusText;
      if (data) errorInfo.data = data;
      if (error?.config?.url) errorInfo.url = error.config.url;
      if (error?.config?.method) errorInfo.method = error.config.method;
      if (error?.config?.baseURL) errorInfo.baseURL = error.config.baseURL;
      if (error?.message && error.message !== message) errorInfo.errorMessage = error.message;
      if (error?.code) errorInfo.code = error.code;
      if (error?.stack) errorInfo.stack = error.stack;

      // Only log if we have meaningful error information
      if (Object.keys(errorInfo).length > 0) {
        console.error("Axios Error:", errorInfo);
      } else {
        // If error object is completely empty/malformed, log what we can
        console.error("Axios Error (malformed):", {
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : [],
          errorString: String(error),
          errorValue: error,
        });
      }
    }

    // Handle 401 Unauthorized - redirect to login
    if (status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
      return Promise.reject(new ApiError("Unauthorized", 401));
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
