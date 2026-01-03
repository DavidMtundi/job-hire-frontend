import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const roleBasedRoutes: Record<string, string[]> = {
  "/admin": ["admin", "hr"],
  "/manager": ["manager"],
  "/user": ["candidate"],
};

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/admin/companies/register", // Allow public company registration
  "/jobs", // Allow public access to jobs listing and details
];

const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.user?.role as string | undefined;
  const isProfileComplete = token?.user?.is_profile_complete as boolean | undefined;

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated && userRole) {
      const redirectUrl = getRedirectUrlByRole(userRole, isProfileComplete);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  for (const [routePrefix, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        const redirectUrl = getRedirectUrlByRole(userRole, isProfileComplete);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
      return NextResponse.next();
    }
  }

  if (pathname.startsWith("/onboarding")) {
    if (userRole === "candidate") {
      if (isProfileComplete) {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
      return NextResponse.next();
    } else {
      const redirectUrl = getRedirectUrlByRole(userRole, isProfileComplete);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

function getRedirectUrlByRole(role: string | undefined, isProfileComplete: boolean | undefined): string {
  if (role === "candidate") {
    return isProfileComplete ? "/user/dashboard" : "/onboarding";
  } else if (role === "manager") {
    return "/manager/dashboard";
  } else if (role === "admin" || role === "hr") {
    return "/admin/dashboard";
  }
  return "/";
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source: '/((?!api|_next/static|_next/image|.*\\..*|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
