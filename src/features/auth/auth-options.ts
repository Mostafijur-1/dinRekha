import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { consumeRateLimit } from "@/features/auth/repositories/rate-limit-repository";
import {
  findOrCreateGoogleUser,
  findUserByEmail,
} from "@/features/auth/repositories/user-repository";
import { credentialsSchema } from "@/features/auth/schemas";
import { verifyPassword } from "@/lib/security/password";
import { privacySafeKey } from "@/lib/security/request";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email ও Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials, request) {
      const credentials = credentialsSchema.safeParse(rawCredentials);
      if (!credentials.success) return null;

      const forwardedFor = request.headers?.["x-forwarded-for"];
      const address = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(",")[0]?.trim() || "unknown";
      const [identityLimit, addressLimit] = await Promise.all([
        consumeRateLimit({
          key: privacySafeKey(
            "sign-in",
            address,
            credentials.data.email.toLowerCase(),
          ),
          limit: 8,
          windowMs: 15 * 60 * 1_000,
        }),
        consumeRateLimit({
          key: privacySafeKey("sign-in-address", address),
          limit: 30,
          windowMs: 15 * 60 * 1_000,
        }),
      ]);
      if (!identityLimit.allowed || !addressLimit.allowed) return null;

      const user = await findUserByEmail(credentials.data.email);
      if (!user?.passwordHash || user.status !== "active") return null;
      if (!(await verifyPassword(credentials.data.password, user.passwordHash)))
        return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        sessionVersion: user.sessionVersion,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
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
      if (account?.provider !== "google") return true;
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
      // Intentionally empty: session invalidation is handled by the encrypted cookie.
    },
  },
};
