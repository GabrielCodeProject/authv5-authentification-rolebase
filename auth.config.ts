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

        await bcrypt.compare(password, userExists.password).then((res) => {
          console.log("Comparison result:", res);
          if (!res) {
            return null;
          }
        });

        return userExists;
      },
    }),
  ],
} satisfies NextAuthConfig;
