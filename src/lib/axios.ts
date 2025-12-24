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
    const { data, status } = error.response || {};
    const message = data?.message || error.message || "Something went wrong";
    const code = data?.status_code || status || (error.code ? String(error.code) : 500);

    // Log detailed error for debugging
    console.error("Axios Error:", {
      message: error.message,
      status: status,
      data: data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });

    if (status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
      return;
    }
    return Promise.reject(new ApiError(message, code));
    // return Promise.reject(error);
  }
);

export default apiClient;
