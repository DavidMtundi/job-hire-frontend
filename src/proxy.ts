import { NextResponse } from "next/server";
import { authSession as proxy } from "~/lib/auth"; // import your NextAuth handler
/**
 * DEMO MODE (presentation): bypass auth + role-based route restrictions.
 *
 * Enable by setting environment variable:
 * - DEMO_MODE=true   (recommended)
 *
 * This is intentionally opt-in so production deployments keep enforcing
 * authentication + authorization by default.
 */
const isDemoModeEnabled = () => {
  const v = process.env.DEMO_MODE || process.env.NEXT_PUBLIC_DEMO_MODE;
  return typeof v === "string" && ["1", "true", "yes", "on"].includes(v.toLowerCase());
};

const adminRoutes = ["/admin"];
const userRoutes = ["/user"];
const authPages = ["/login", "/signup", "/verify-email"];
const onboardingPage = "/onboarding";
export default proxy(async (req) => {
  const { pathname } = req.nextUrl;

  const token = req.auth; // decoded JWT from NextAuth

  const isAuthenticated = !!token;
  const user = token?.user;
  const userRole = user?.role;
  const isProfileComplete = user?.is_profile_complete;

  // 🔐 ADMIN ROUTES
  // All admin routes require authentication
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "admin" && userRole !== "hr" && userRole !== "manager") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // USER ROUTES
  if (userRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "candidate") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isProfileComplete && pathname !== onboardingPage) {
      return NextResponse.redirect(new URL(onboardingPage, req.url));
    }

    if (isProfileComplete && pathname === onboardingPage) {
      return NextResponse.redirect(new URL("/user/dashboard", req.url));
    }
  }

  // AUTH PAGES
  if (authPages.includes(pathname) && isAuthenticated) {
    const redirectUrl =
      userRole === "admin" || userRole === "hr" || userRole === "manager"
        ? "/admin/dashboard"
        : userRole === "candidate"
        ? "/user/dashboard"
        : "/";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
