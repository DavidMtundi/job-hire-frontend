/**
 * Avoid dumping HTML error pages (e.g. Next.js 404) into the UI when the API
 * base URL is misconfigured and axios receives text/html.
 */
export function safeErrorMessage(error: unknown, context?: string): string {
  const prefix = context ? `${context}: ` : "";
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Request failed";

  const t = raw.trim();
  if (t.length > 120 && (/<!doctype\s+html/i.test(t) || (t.includes("_next/static/") && t.includes("<html")))) {
    return (
      prefix +
      "The app is calling the wrong URL (got an HTML page instead of JSON). Set NEXT_PUBLIC_BASE_API_URL to your public API URL including /api (e.g. https://jobs.ru.ac.ke/api) and rebuild the frontend."
    );
  }

  if (t.length > 600) {
    return prefix + t.slice(0, 280).trim() + "…";
  }

  return prefix + t;
}
