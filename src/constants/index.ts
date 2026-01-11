export const publicEndpoints = [
  "/users/login",
  "/users/login/social",
  "/users/register",
  "/users/reset/generate",
  "/users/refresh_token",
  "/users/direct-login/verify",
  "/users/reset-password/verify",
  "/jobs/get-jobs", // Public jobs listing endpoint
  "/jobs/search", // Public job search endpoint
  "/jobs/status/", // Public job status endpoint
  // Note: /jobs/{job_id} GET is public, but we handle it via method-based logic in interceptor
];

// Protected endpoints that should never be public (even if they match a public prefix)
export const protectedEndpoints = [
  "/jobs/ai-generate", // Requires authentication
  "/jobs/", // POST to create job requires authentication
];
