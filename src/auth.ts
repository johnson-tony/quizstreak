import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "./lib/db";
import User from "./models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            googleId: profile?.sub,
            name: user.name,
            email: user.email,
            image: user.image,
            joinedAt: new Date(),
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        
        if (token.role === "admin") {
          return session;
        }

        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          (session.user as any).totalPoints = dbUser.totalPoints;
          (session.user as any).currentStreak = dbUser.currentStreak;
          (session.user as any).badges = dbUser.badges;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
