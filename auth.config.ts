import Credentials from "next-auth/providers/credentials";
import Google, { GoogleProfile } from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      profile: (profile: GoogleProfile) => ({
        id: profile.sub, // Ensure the 'id' (sub) is returned
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        image: profile.picture,
        username:
          `${profile.given_name}${profile.family_name}`.toLowerCase() ??
          "unknown",
      }),
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        try {
          const validatedData = LoginSchema.safeParse(credentials);
          console.log("validated data:", validatedData);

          if (!validatedData.success) {
            return null;
          }
          const { email, password } = validatedData.data;

          const userExists = await prisma.user.findFirst({
            where: {
              email: email,
            },
          });

          console.log("auth user fetch", userExists);
          if (!userExists || !userExists.password || !userExists.email) {
            return null;
          }

          if (!userExists.emailVerified) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            password,
            userExists.password
          );
          if (!isValidPassword) {
            return null;
          }

          return userExists;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
