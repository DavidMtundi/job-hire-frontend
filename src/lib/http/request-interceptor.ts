import Axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { authRecovery } from "~/lib/http/auth-recovery";
import { classifyRequestEndpoint, isAuthEndpointUrl } from "~/lib/http/endpoint-classification";
import { normalizeBaseUrl } from "~/lib/http/base-url";
import { toLoggableError } from "~/lib/http/error-logging";
import { getAccessToken } from "~/lib/http/tokens";

export function attachRequestInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (config.baseURL) {
        const originalBaseURL = config.baseURL;
        config.baseURL = normalizeBaseUrl(config.baseURL);
        if (typeof window !== "undefined" && window.location.protocol === "https:") {
          if (config.baseURL.startsWith("http://")) {
            config.baseURL = config.baseURL.replace(/^http:\/\//, "https://");
            console.warn(
              `[Axios Interceptor] CRITICAL: Fixed HTTP->HTTPS to prevent Mixed Content error: ${originalBaseURL} -> ${config.baseURL}`
            );
          }
        }
        if (process.env.NODE_ENV === "development" && originalBaseURL !== config.baseURL) {
          console.log(`[Axios Interceptor] BaseURL normalized: ${originalBaseURL} -> ${config.baseURL}`);
        }
      }

      if (config.url) {
        config.url = config.url.replace(/^\/+/, "/");
        if (config.url === "//" || config.url === "///") {
          config.url = "/";
        }
      }

      if (process.env.NODE_ENV === "development" && config.baseURL && config.url) {
        const fullUrl = `${config.baseURL}${config.url}`;
        if (fullUrl.includes("railway") || fullUrl.includes("production")) {
          console.log(`[Axios Interceptor] Full URL: ${fullUrl} (method: ${config.method?.toUpperCase()})`);
        }
      }

      if (!config.headers) {
        config.headers = {} as InternalAxiosRequestConfig["headers"];
      }

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        if (process.env.NODE_ENV === "development") {
          console.log("[Axios Interceptor] Detected FormData upload - removed Content-Type header to allow browser to set it with boundary");
          console.log("[Axios Interceptor] FormData details:", {
            url: config.url,
            method: config.method?.toUpperCase(),
          });
        }
      }

      const { isPublicEndpoint, isAuthEndpoint, finalIsPublic } = classifyRequestEndpoint(config.url, config.method);

      if (!finalIsPublic) {
        if (config.url?.includes("/auth/register") || config.url?.includes("/auth/login")) {
          console.warn(`[API Request] ⚠️ WARNING: ${config.url} is NOT recognized as public endpoint!`);
          console.warn(`[API Request] This will cause token retrieval which may timeout.`);
          console.warn(`[API Request] Endpoint classification:`, {
            url: config.url,
            isPublic: isPublicEndpoint,
            isAuthEndpoint,
          });
        }

        const token = await getAccessToken(0);

        if (token) {
          if (typeof config.headers.set === "function") {
            config.headers.set("Authorization", `Bearer ${token}`);
          }
          config.headers.Authorization = `Bearer ${token}`;
          if (!config.headers.Authorization) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
          if (process.env.NODE_ENV === "development") {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - ✅ Token attached`);
          }
        } else {
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
          if (typeof window !== "undefined" && !authRecovery.inProgress) {
            authRecovery.inProgress = true;
            try {
              const nextAuth = await import("next-auth/react");
              await nextAuth.signOut({ callbackUrl: "/login", redirect: true });
            } catch (signOutError) {
              console.error("[Auth Recovery] Failed to sign out after missing token:", toLoggableError(signOutError));
            } finally {
              setTimeout(() => {
                authRecovery.inProgress = false;
              }, 1000);
            }
          }
          const authError = new Error("Authentication required: Please log in again");
          (authError as Error & { isAuthError?: boolean; code?: string }).isAuthError = true;
          (authError as Error & { isAuthError?: boolean; code?: string }).code = "AUTH_REQUIRED";
          return Promise.reject(authError);
        }
      } else {
        if (isAuthEndpoint || config.url?.includes("/auth/register") || config.url?.includes("/auth/login")) {
          console.log(`[API Request] ✅ ${config.method?.toUpperCase()} ${config.url} - Public/Auth endpoint (no token required)`);
          console.log(`[API Request] Request will proceed without authentication token`);
        } else if (process.env.NODE_ENV === "development") {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Public endpoint (no token required)`);
        }
      }

      const url = config.url ?? "";
      if (isAuthEndpointUrl(url) && config.headers?.Authorization) {
        console.warn(`[API Request] ⚠️ WARNING: Auth endpoint ${url} has Authorization header - removing it`);
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
}
