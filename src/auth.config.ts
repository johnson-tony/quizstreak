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
      const isPublicPage = ["/", "/login"].includes(nextUrl.pathname);
      const isProtectedRoute = ["/dashboard", "/challenge", "/rankings"].some(path => 
        nextUrl.pathname.startsWith(path)
      );

      // 1. If it's a protected route and not logged in, redirect to login
      if (isProtectedRoute && !isLoggedIn) {
        return false; // NextAuth handles redirect to signIn page
      }

      // 2. If logged in and trying to access landing or login page, go to dashboard
      if (isLoggedIn && isPublicPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // 3. Otherwise, allow access
      return true;
    },
    // Basic JWT logic that doesn't need DB
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    // We will define session and signIn callbacks in auth.ts 
    // where DB access is allowed
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
