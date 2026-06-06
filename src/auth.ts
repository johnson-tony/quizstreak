import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "./lib/db";
import User from "./models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
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
