export const API_CONFIG = {
  timeout: 30_000,
  retryAttempts: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;
