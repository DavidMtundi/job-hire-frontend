export const publicEndpoints = [
  // Auth endpoints (backend uses /auth prefix)
  "/auth/register",
  "/auth/login",
  "/auth/login/social",
  "/auth/refresh_token",
  "/auth/send-verification-email",
  "/auth/verify-email",
  "/auth/reset/generate",
  "/auth/reset-password/verify",
  "/auth/direct-login/verify",
  // Legacy user endpoints (for backward compatibility)
  "/users/login",
  "/users/login/social",
  "/users/register",
  "/users/reset/generate",
  "/users/refresh_token",
  "/users/direct-login/verify",
  "/users/reset-password/verify",
  // Public job endpoints
  "/jobs/get-jobs", // Public jobs listing endpoint
  "/jobs/search", // Public job search endpoint
  "/jobs/status/", // Public job status endpoint
  // Note: /jobs/{job_id} GET is public, but we handle it via method-based logic in interceptor
  // Public category endpoints (GET is public, POST/PUT/DELETE require auth)
  "/categories", // GET /categories is public (no auth required)
];

// Protected endpoints that should never be public (even if they match a public prefix)
export const protectedEndpoints = [
  "/jobs/ai-generate", // Requires authentication
  "/jobs/", // POST to create job requires authentication
];
