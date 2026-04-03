import { siteConfig } from "~/config/site";

export function normalizeBaseUrl(url: string): string {
  if (!url) return url;

  const originalUrl = url;
  url = url.trim().replace(/\/+$/, "");

  if (url.includes("railway.app") || url.includes("vercel.app") || url.includes("herokuapp.com") || url.includes("netlify.app")) {
    url = url.replace(/^http:\/\//i, "https://");
    if (originalUrl.startsWith("http://") && url.startsWith("https://") && process.env.NODE_ENV === "development") {
      console.warn(`[BaseURL Normalization] Fixed HTTP->HTTPS: ${originalUrl} -> ${url}`);
    }
  }

  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1") && !url.includes("backend:")) {
    url = url.replace(/^http:\/\//, "https://");
    if (process.env.NODE_ENV === "development") {
      console.warn(`[BaseURL Normalization] Force HTTPS for production URL: ${url}`);
    }
  }

  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
    url = url.replace(/^http:\/\//, "https://");
    console.warn(`[BaseURL Normalization] CRITICAL: Forced HTTPS for browser HTTPS page: ${url}`);
  }

  return url;
}

export function getApiBaseUrl(): string {
  let baseUrl: string;

  if (typeof window === "undefined") {
    baseUrl = process.env.BACKEND_URL || "http://backend:8002";
    if (process.env.NODE_ENV === "development") {
      console.log("[getApiBaseUrl] Server-side base URL:", baseUrl, {
        hasBackendUrl: !!process.env.BACKEND_URL,
        backendUrl: process.env.BACKEND_URL,
        nextPublicBaseApiUrl: process.env.NEXT_PUBLIC_BASE_API_URL,
      });
    }
  } else {
    baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || siteConfig.apiBaseUrl || "http://localhost:8002";
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
    let resolved = baseUrl.trim().replace(/\/+$/, "");
    if (appOrigin && resolved === appOrigin) {
      resolved = `${resolved}/api`;
      if (process.env.NODE_ENV === "development") {
        console.warn("[getApiBaseUrl] API base matched app URL; appended /api:", resolved);
      }
    }
    if (/\/backend$/i.test(resolved)) {
      resolved = resolved.replace(/\/backend$/i, "/api");
      if (process.env.NODE_ENV === "development") {
        console.warn("[getApiBaseUrl] Replaced /backend suffix with /api:", resolved);
      }
    }
    baseUrl = resolved;
    if (process.env.NODE_ENV === "development") {
      console.log("[getApiBaseUrl] Client-side base URL:", baseUrl);
    }
  }

  return normalizeBaseUrl(baseUrl);
}
