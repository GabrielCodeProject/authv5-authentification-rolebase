import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { privateRoutes } from "./routes";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  console.log("Middleware called", req.nextUrl.pathname);
  console.log(req.auth);
  const url = "http://localhost:3000";
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isPrivateRoute = privateRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.includes("/auth");
  const isApiRoute = nextUrl.pathname.includes("/api");
  const isLinkAccountRoute = nextUrl.pathname === "/auth/link-account";

  if (isApiRoute) {
    return;
  }

  if (isLoggedIn && isAuthRoute && !isLinkAccountRoute) {
    return Response.redirect(`${url}/dashboard`);
  }

  if (isAuthRoute && !isLoggedIn && !isLinkAccountRoute) {
    return;
  }

  if (!isLoggedIn && isPrivateRoute) {
    return Response.redirect(`${url}/auth/login`);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
