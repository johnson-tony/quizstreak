import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "./lib/db";
import User from "./models/User";

if (process.env.NEXTAUTH_DEBUG === "true") {
  // Temporary debug: shows whether env values are loaded (do not commit)
  // Enable by setting NEXTAUTH_DEBUG=true in .env.local and restarting dev server
  // This helps confirm the client secret isn't truncated or missing at runtime.
  // Remove these logs once troubleshooting is complete.
  // eslint-disable-next-line no-console
  console.log("GOOGLE_CLIENT_ID=", process.env.GOOGLE_CLIENT_ID);
  // eslint-disable-next-line no-console
  console.log(
    "GOOGLE_CLIENT_SECRET present:",
    !!process.env.GOOGLE_CLIENT_SECRET,
    "len=",
    process.env.GOOGLE_CLIENT_SECRET?.length
  );
}

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
