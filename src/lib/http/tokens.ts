import Axios from "axios";
import { getSession } from "next-auth/react";
import { authSession } from "~/lib/auth";
import { API_CONFIG } from "~/lib/http/api-config";
import { getApiBaseUrl } from "~/lib/http/base-url";
import { toLoggableError } from "~/lib/http/error-logging";

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export async function getAccessToken(retryCount = 0): Promise<string | null> {
  const maxRetries = 2;

  try {
    if (typeof window === "undefined") {
      const session = await authSession();
      return session?.tokens?.accessToken ?? null;
    }

    try {
      const session = await getSession();

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
        if (session?.tokens?.accessToken) {
          console.log("[getAccessToken] Token preview:", session.tokens.accessToken.substring(0, 20) + "...");
        }
      }

      const token = session?.tokens?.accessToken ?? null;
      const refreshToken = session?.tokens?.refreshToken ?? null;
      if (token) inMemoryAccessToken = token;
      if (refreshToken) inMemoryRefreshToken = refreshToken;

      if (!token) {
        console.error(`[getAccessToken] No access token found in session (attempt ${retryCount + 1})!`, {
          sessionKeys: session ? Object.keys(session) : [],
          tokens: session?.tokens,
          isAuthenticated: session?.isAuthenticated,
          user: session?.user,
          retryCount,
        });
        if (retryCount < maxRetries && session && session.user) {
          console.log(`[getAccessToken] Retrying with forced session refresh...`);
          await new Promise((resolve) => setTimeout(resolve, 100));
          return getAccessToken(retryCount + 1);
        }
      }
      return token;
    } catch (sessionError) {
      console.error(`[getAccessToken] Error getting session (attempt ${retryCount + 1}):`, sessionError);
      if (retryCount < maxRetries) {
        console.log(`[getAccessToken] Retrying session retrieval...`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return getAccessToken(retryCount + 1);
      }
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
        if (fallbackToken) inMemoryAccessToken = fallbackToken;
        if (fallbackRefreshToken) inMemoryRefreshToken = fallbackRefreshToken;
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
  } catch (error) {
    console.error(`[getAccessToken] Unexpected error (attempt ${retryCount + 1}):`, error);
    if (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getAccessToken(retryCount + 1);
    }
    return inMemoryAccessToken;
  }
}

async function getRefreshToken(): Promise<string | null> {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;

  try {
    if (typeof window === "undefined") {
      const session = await authSession();
      const refreshToken = session?.tokens?.refreshToken ?? null;
      if (refreshToken) inMemoryRefreshToken = refreshToken;
      return refreshToken;
    }

    const session = await getSession();
    const refreshToken = session?.tokens?.refreshToken ?? null;
    if (refreshToken) inMemoryRefreshToken = refreshToken;
    return refreshToken;
  } catch (error) {
    console.error("[Token Refresh] Failed to read refresh token from session:", error);
    return inMemoryRefreshToken;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
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

        const raw = refreshResponse?.data as unknown;
        const responseData =
          raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
        const nested =
          responseData.data && typeof responseData.data === "object"
            ? (responseData.data as Record<string, unknown>)
            : {};
        const newAccessToken =
          (typeof responseData.access_token === "string" ? responseData.access_token : null) ??
          (typeof nested.access_token === "string" ? nested.access_token : null);
        const newRefreshToken =
          (typeof responseData.refresh_token === "string" ? responseData.refresh_token : null) ??
          (typeof nested.refresh_token === "string" ? nested.refresh_token : null);

        if (newAccessToken) inMemoryAccessToken = newAccessToken;
        if (newRefreshToken) inMemoryRefreshToken = newRefreshToken;

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
}
