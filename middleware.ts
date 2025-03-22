import { NextRequest, NextResponse } from "next/server";
import { privateRoutes } from "./routes";

export default async function middleware(req: NextRequest) {
  console.log("Middleware called", req.nextUrl.pathname);

  // Check for both possible session cookie names
  const customSessionCookie = req.cookies.get("next-auth-session-token")?.value;
  const nextAuthSessionCookie = req.cookies.get(
    "next-auth.session-token"
  )?.value;

  const isLoggedIn = !!(customSessionCookie || nextAuthSessionCookie);

  console.log("Session cookie exists:", isLoggedIn);
  console.log("Custom cookie:", !!customSessionCookie);
  console.log("Next Auth cookie:", !!nextAuthSessionCookie);

  const { nextUrl } = req;
  const isPrivateRoute = privateRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isLinkAccountRoute = nextUrl.pathname.startsWith("/auth/link-account");

  // Special handling for Google OAuth callback
  if (
    req.nextUrl.pathname === "/api/auth/callback/google" &&
    req.nextUrl.searchParams.has("state")
  ) {
    console.log("Google callback detected in middleware");
    console.log("Full URL:", req.nextUrl.toString());
    console.log(
      "Query params:",
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );

    // Let NextAuth handle the callback with allowDangerousEmailAccountLinking
    return NextResponse.next();
  }

  if (isApiRoute) {
    return NextResponse.next();
  }

  // Special handling for link-account route which doesn't require authentication
  if (isLinkAccountRoute) {
    // Check if it has the required parameters
    const hasEmail = nextUrl.searchParams.has("email");
    const hasToken = nextUrl.searchParams.has("token");

    if (!hasEmail || !hasToken) {
      // Redirect to login if parameters are missing
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Allow access to link-account page with parameters
    return NextResponse.next();
  }

  // If logged in and trying to access auth routes (except link-account), redirect to dashboard
  if (isLoggedIn && isAuthRoute && !isLinkAccountRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow access to auth routes for non-logged in users
  if (isAuthRoute && !isLoggedIn) {
    return NextResponse.next();
  }

  // If not logged in and trying to access private routes, redirect to login
  if (!isLoggedIn && isPrivateRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
