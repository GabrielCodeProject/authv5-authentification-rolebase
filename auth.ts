import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "@/data/account";
import { CustomPrismaAdapter } from "./lib/auth-adapter";

// Define session user properties to fix type errors
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isOauth?: boolean;
    };
  }

  interface User {
    role?: string;
    emailVerified?: Date;
  }
}

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: CustomPrismaAdapter(),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      console.log("Sign in callback with account:", account?.provider);

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
        console.log(
          "Checking user verification:",
          existingUser?.id,
          !!existingUser?.emailVerified
        );
        return !!existingUser?.emailVerified;
      }

      return true;
    },
    async session({ session, user }) {
      if (user) {
        console.log("Session callback for user:", user.id);
        const dbUser = await getUserById(user.id);
        session.user.id = user.id;
        // Only add role if the user has one in the database
        if (dbUser?.role) {
          session.user.role = dbUser.role;
        }
        // Check if user has an OAuth account
        session.user.isOauth = !!(await getAccountByUserId(user.id));
      }
      return session;
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
    async signIn({ user, account }) {
      console.log(`User ${user.id} signed in via ${account?.provider}`);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.id}`);
    },
    async session({ session }) {
      console.log(`Session updated for user: ${session?.user?.id}`);
    },
  },
});
