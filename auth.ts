import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "@/data/account";
import { EnumRole } from "@prisma/client";

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
      if(account?.provider === "google"){
        console.log("google account", account);
        if (!user.role) {
          // Optionally update the user in the database
          await prisma.user.update({
            where: { email: user.email },
            data: { role: EnumRole.USER },
          });
          user.role = EnumRole.USER;
        }
        return true;
      }
      if (account?.provider !== "credentials") {
        return true;
      }

      if (!user.id) {
        return false;
      }
      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) {
        return false;
      }

      return true;
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
});
