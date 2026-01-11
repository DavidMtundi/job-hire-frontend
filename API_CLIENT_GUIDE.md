# API Client Usage Guide

## Overview

All API requests in this application automatically include authentication tokens when a user is logged in. This is handled through a centralized API client system.

## ✅ **RECOMMENDED: Use `apiClient` for all backend API calls**

The `apiClient` from `~/lib/axios` automatically:
- ✅ Attaches authentication tokens to all requests
- ✅ Handles errors consistently  
- ✅ Redirects on 401 Unauthorized
- ✅ Works on both client and server
- ✅ Provides detailed error logging in development

### Example Usage

```typescript
import apiClient from "~/lib/axios";

// GET request
const response = await apiClient.get("/endpoint");
const data = response.data;

// POST request
const response = await apiClient.post("/endpoint", { key: "value" });
const data = response.data;

// PUT request
const response = await apiClient.put("/endpoint", { key: "value" });
const data = response.data;

// DELETE request
const response = await apiClient.delete("/endpoint");
const data = response.data;
```

## Alternative Helpers (when you MUST use fetch)

### Client-Side: `authenticatedFetch`

If you absolutely need to use `fetch()` instead of `apiClient`, use the `authenticatedFetch` helper to ensure tokens are attached:

```typescript
import { authenticatedFetch } from "~/lib/api-helpers";

const response = await authenticatedFetch("/api/some-endpoint", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### Server-Side: `serverAuthenticatedFetch`

For Next.js API routes that proxy to the backend:

```typescript
import { serverAuthenticatedFetch } from "~/lib/api-helpers";

// In a Next.js API route handler
export async function POST(request: NextRequest) {
  const session = await authSession();
  if (!session?.tokens?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendUrl = `${backendBaseUrl}/endpoint`;
  const response = await serverAuthenticatedFetch(backendUrl, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  // ... handle response
}
```

## Public Endpoints

Some endpoints don't require authentication. These are defined in `~/constants/index.ts`:

```typescript
export const publicEndpoints = [
  "/users/login",
  "/users/register",
  "/jobs/get-jobs", // Public jobs endpoint
  // ... etc
];
```

The `apiClient` automatically skips token attachment for public endpoints.

## Token Retrieval

The system automatically retrieves tokens from:
- **Client-side**: NextAuth session via `getSession()`
- **Server-side**: NextAuth session via `authSession()`

## Important Notes

⚠️ **DO NOT** use direct `fetch()` calls without the helpers unless:
- Making requests to NextAuth endpoints (`/api/auth/*`)
- Making requests to public endpoints that explicitly don't need auth

⚠️ **DO NOT** manually construct `Authorization` headers - let the centralized system handle it.

## Debugging

In development mode, the `apiClient` logs:
- ✅ When tokens are attached: `[API Request] POST /endpoint - ✅ Token attached`
- ⚠️ When tokens are missing: `[API Request] POST /endpoint - ⚠️ No token available!`
- 📝 Public endpoints: `[API Request] GET /jobs/get-jobs - Public endpoint (no token required)`

Check browser console or server logs for these messages to verify token attachment.
