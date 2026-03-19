import { handlers } from "~/lib/auth";

// NextAuth must run with access to cookies per request (CSRF validation relies on it).
// `output: 'export'` still requires `generateStaticParams()`, but forcing static rendering
// can break the login flow (MissingCSRF).
export const dynamic = "force-dynamic";
// When using `output: 'export'`, Next still validates `generateStaticParams()`,
// but we should not pre-generate every possible NextAuth endpoint.
// We want unspecified variants (providers/csrf/session/error/callback/*) to be
// handled at request time so CSRF cookies/tokens work correctly.
export const dynamicParams = true;

export const { GET, POST } = handlers;

// For `output: "export"`, Next requires `generateStaticParams()` on dynamic routes.
//
// NextAuth uses a catch-all segment (`[...nextauth]`) and the login flow hits
// multiple well-known endpoints like:
// - /api/auth/providers
// - /api/auth/csrf
// - /api/auth/session
// - /api/auth/error
// - /api/auth/signin/* and /api/auth/callback/*
//
// For static export, we must include enough param variants so Next can render
// those routes instead of erroring when it sees an unlisted variant.
export function generateStaticParams() {
  // Minimal placeholder to satisfy `output: "export"` validation.
  // Other variants will be generated at request time via `dynamicParams`.
  return [{ nextauth: ["credentials"] }];
}
