import Axios, { type AxiosInstance } from "axios";
import { authRecovery } from "~/lib/http/auth-recovery";
import { hasUsefulErrorFields, safeSerializeForLog, toLoggableError } from "~/lib/http/error-logging";
import { refreshAccessToken } from "~/lib/http/tokens";
import { ApiError } from "~/utils/api-utils";

function isProbablyHtmlResponseBody(s: string): boolean {
  const t = s.trim();
  if (t.length < 80) return false;
  const head = t.slice(0, 240).toLowerCase();
  if (head.startsWith("<!doctype html") || head.startsWith("<html")) return true;
  if (t.includes("_next/static/") && (t.includes("<script") || t.includes("<head"))) return true;
  return false;
}

function normalizeErrorMessage(value: unknown): string | null {
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
}

export function attachResponseInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.response.use(
    (res) => res,
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

      const isNetworkError = isAxiosError ? !response : false;
      const isLoginEndpoint = requestUrl?.includes("/auth/login");
      const isRefreshEndpoint =
        requestUrl?.includes("/auth/refresh-token") || requestUrl?.includes("/auth/refresh_token");
      const originalRequestConfig = axiosError?.config;
      const originalRequest = originalRequestConfig as
        | (typeof originalRequestConfig & { _retry?: boolean })
        | undefined;

      if (
        isAxiosError &&
        axiosError &&
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
            originalRequest.headers = {} as NonNullable<typeof originalRequest.headers>;
          }
          originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
          return apiClient.request(originalRequest);
        }

        if (typeof window !== "undefined" && !authRecovery.inProgress) {
          authRecovery.inProgress = true;
          try {
            const nextAuth = await import("next-auth/react");
            await nextAuth.signOut({ callbackUrl: "/login", redirect: true });
          } catch (signOutError) {
            console.error("[Auth Recovery] Failed to sign out after 401:", toLoggableError(signOutError));
          } finally {
            setTimeout(() => {
              authRecovery.inProgress = false;
            }, 1000);
          }
        }
      }

      const serverMessage =
        normalizeErrorMessage(data?.message) ||
        normalizeErrorMessage(data?.detail) ||
        normalizeErrorMessage(data);

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
      const code: string | number =
        rawStatusCode ?? status ?? axiosError?.code ?? (isNetworkError ? "NETWORK_ERROR" : 500);
      const statusCode = rawStatusCode ?? status ?? 500;

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
        return Promise.reject(
          new ApiError(message || "You do not have permission to perform this action", 403, apiErrorMetadata)
        );
      }

      if (status === 404) {
        return Promise.reject(new ApiError(message || "Resource not found", 404, apiErrorMetadata));
      }

      return Promise.reject(new ApiError(message, statusCode, apiErrorMetadata));
    }
  );
}
