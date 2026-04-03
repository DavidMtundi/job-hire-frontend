import { protectedEndpoints, publicEndpoints } from "~/constants";

export function urlMatchesEndpoint(url: string, endpoint: string): boolean {
  if (!url || !endpoint) return false;
  const urlWithoutQuery = url.split("?")[0].trim();
  const endpointTrimmed = endpoint.trim();
  const urlNormalized = urlWithoutQuery.replace(/\/$/, "");
  const endpointNormalized = endpointTrimmed.replace(/\/$/, "");
  if (urlNormalized === endpointNormalized) return true;
  if (endpointTrimmed.endsWith("/")) {
    return urlWithoutQuery.startsWith(endpointTrimmed);
  }
  return (
    urlNormalized === endpointNormalized ||
    urlWithoutQuery.startsWith(endpointTrimmed + "/") ||
    urlWithoutQuery.startsWith(endpointTrimmed + "?")
  );
}

export function isAuthEndpointUrl(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh_token") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/users/login") ||
    url.includes("/users/register")
  );
}

export function classifyRequestEndpoint(
  url: string | undefined,
  method: string | undefined
): {
  isProtectedEndpoint: boolean;
  isPublicEndpoint: boolean;
  isAuthEndpoint: boolean;
  finalIsPublic: boolean;
} {
  const m = (method?.toUpperCase() || "GET") as string;
  const isProtectedEndpoint = Boolean(
    url &&
      protectedEndpoints.some((endpoint) => {
        if (endpoint === "/jobs/") {
          return m === "POST" && (url === "/jobs" || url === "/jobs/");
        }
        return urlMatchesEndpoint(url, endpoint);
      })
  );

  const isPublicEndpoint = Boolean(
    url &&
      (publicEndpoints.some((endpoint) => {
        if (endpoint === "/categories") {
          if (m !== "GET") return false;
        }
        const matches = urlMatchesEndpoint(url, endpoint);
        if (matches && process.env.NODE_ENV === "development") {
          console.log(`[API Request] ✅ Matched public endpoint: ${url} matches ${endpoint}`);
        }
        return matches;
      }) ||
        (m === "GET" && /^\/jobs\/[^/]+$/.test(url.split("?")[0]) && !url.includes("/jobs/ai-generate"))) &&
      !isProtectedEndpoint
  );

  const isAuthEndpoint = Boolean(url && isAuthEndpointUrl(url));
  const finalIsPublic = isPublicEndpoint || isAuthEndpoint;

  if (url && (url.includes("/auth/login") || url.includes("/auth/register"))) {
    if (!isPublicEndpoint && process.env.NODE_ENV === "development") {
      console.warn(`[API Request] ⚠️ Auth endpoint ${url} not recognized as public - forcing it to be public`);
    }
  }

  if (process.env.NODE_ENV === "development" && url) {
    console.log(`[API Request] Endpoint classification for ${m} ${url}:`, {
      isProtected: isProtectedEndpoint,
      isPublic: isPublicEndpoint,
      matchedPublicEndpoints: publicEndpoints.filter((e) => urlMatchesEndpoint(url, e)),
      matchedProtectedEndpoints: protectedEndpoints.filter((e) => urlMatchesEndpoint(url, e)),
    });
  }

  return { isProtectedEndpoint, isPublicEndpoint, isAuthEndpoint, finalIsPublic };
}
