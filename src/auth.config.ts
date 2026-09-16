import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// This configuration is "Edge compatible" - no database imports here!
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "admin-system",
            name: "Administrator",
            email: adminEmail,
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;

      const pathname = nextUrl.pathname;
      const isAdmin = role === "admin";

      // Public entry pages.
      const isPublicPage = ["/", "/login", "/admin/login"].includes(pathname);

      // All normal user application routes.
      const isUserRoute = [
        "/dashboard",
        "/challenge",
        "/rankings",
        "/pools",
      ].some((path) => pathname.startsWith(path));

      // Every admin route, including future admin pages.
      const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

      // 1. Admin routes: only an authenticated admin can enter.
      if (isAdminRoute) {
        if (!isLoggedIn || !isAdmin) {
          return Response.redirect(new URL("/admin/login", nextUrl));
        }
        return true;
      }

      // 2. User routes: only an authenticated normal user can enter.
      if (isUserRoute) {
        if (!isLoggedIn) {
          return false;
        }
        if (isAdmin) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return true;
      }

      // 3. Already-authenticated users should never see the wrong login area.
      if (isLoggedIn && isPublicPage) {
        if (isAdmin) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        if (pathname === "/login" || pathname === "/") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (pathname === "/admin/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      // 4. Unauthenticated users can access public pages, including admin login.
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
