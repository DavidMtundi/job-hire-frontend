import { NextResponse } from "next/server";
import { authSession as proxy } from "~/lib/auth"; // import your NextAuth handler

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
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "admin" && userRole !== "hr") {
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
      userRole === "admin" || userRole === "hr"
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
