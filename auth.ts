import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "@/data/account";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      // Allow Google login flow
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        // If user exists but doesn't have Google account linked
        if (existingUser) {
          const hasGoogleAccount = existingUser.accounts.some(
            (a) => a.provider === "google"
          );
          if (!hasGoogleAccount) {
            throw new Error("OAuthAccountNotLinked"); // Use exact error type
          }
        }

        return true;
      }

      // Handle credentials login
      if (account?.provider === "credentials") {
        if (!user.id) return false;
        const existingUser = await getUserById(user.id);
        return !!existingUser?.emailVerified;
      }

      return false;
    },
    async jwt({ token }) {
      console.log("jwt", token);
      if (!token.sub) {
        return token;
      }
      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
      }

      const existingAccount = await getAccountByUserId(existingUser.id);

      //cette methode permet de reduire les query a la database
      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;
      return token;
    },
    async session({ token, session }) {
      console.log("session object", session);

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isOauth: token.isOauth,
          role: token.role,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user, account }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
