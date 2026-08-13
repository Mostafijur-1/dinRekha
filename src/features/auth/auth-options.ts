import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { findOrCreateGoogleUser } from "@/features/auth/repositories/user-repository";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/sign-in", error: "/auth/sign-in" },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-chondo.session-token"
          : "chondo.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return false;
      const googleProfile = profile as { email_verified?: boolean } | undefined;
      if (!user.email || !account.providerAccountId) return false;

      const internalUser = await findOrCreateGoogleUser({
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name ?? "ছন্দ ব্যবহারকারী",
        image: user.image,
        emailVerified: googleProfile?.email_verified === true,
      });
      if (!internalUser) return false;

      user.id = internalUser.id;
      user.sessionVersion = internalUser.sessionVersion;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Session invalidation is handled by the encrypted cookie.
    },
  },
};
