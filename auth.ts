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
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth providers
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        // If user exists but doesn't have a Google account linked
        if (
          existingUser &&
          !existingUser.accounts.some((a) => a.provider === "google")
        ) {
          // Check if the user is already authenticated with credentials
          const session = await auth();

          // If no session or emails don't match, redirect to link-account
          if (!session?.user?.email || session.user.email !== user.email) {
            return "/auth/link-account?email=" + encodeURIComponent(user.email);
          }

          // If we have a valid session and emails match, allow the link
          return true;
        }

        return true;
      }

      // Handle credentials login
      if (account?.provider === "credentials") {
        if (!user.id) return false;
        const existingUser = await getUserById(user.id);
        return !!existingUser?.emailVerified;
      }

      return true;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;

      return token;
    },
    async session({ token, session }) {
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
  events: {
    async linkAccount({ user }) {
      // Update the user's email verification status when account is linked
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
});
