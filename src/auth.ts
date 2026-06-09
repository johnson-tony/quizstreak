import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import dbConnect from "./lib/db";
import User from "./models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          if (existingUser.status === "suspended" || existingUser.status === "deleted") {
            return false;
          }
        } else {
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
        
        if (!dbUser || dbUser.status !== "active") {
          return null;
        }

        session.user.id = dbUser._id.toString();
        (session.user as any).totalPoints = dbUser.totalPoints;
        (session.user as any).currentSet = dbUser.currentSet;
        (session.user as any).currentStreak = dbUser.currentStreak;
        (session.user as any).badges = dbUser.badges;
      }
      return session;
    },
  },
});
