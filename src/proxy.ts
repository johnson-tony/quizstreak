import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. If logged in, strictly prevent access to landing page and login page
  const isPublicAuthPage = ["/", "/login"].includes(nextUrl.pathname);
  if (isPublicAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 2. If NOT logged in and trying to access private user pages
  const isUserRoute = ["/dashboard", "/challenge", "/rankings"].includes(nextUrl.pathname);
  if (isUserRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export default proxy;

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|quickstreak.svg).*)"],
};
