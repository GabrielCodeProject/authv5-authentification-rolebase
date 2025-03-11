import Credentials from "next-auth/providers/credentials";
import Google, { GoogleProfile } from "next-auth/providers/google";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";
import bcrypt from "bcryptjs";
import { getUserAccountByEmail } from "./data/user";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

class InvalidLoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
    this.message = code;
  }
}

export default {
  providers: [
    Google({
      profile: (profile: GoogleProfile) => ({
        id: profile.sub,
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

          if (!validatedData.success) {
            return null;
          }
          const { email, password } = validatedData.data;

          const userExists = await getUserAccountByEmail(email);

          console.log("auth user fetch", userExists);
          if (!userExists || !userExists.password) {
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
          if (
            error instanceof Prisma.PrismaClientInitializationError ||
            error instanceof Prisma.PrismaClientUnknownRequestError
          )
            throw new InvalidLoginError(
              "System Error Occured. Please Contact Support Team"
            );
          if (error instanceof ZodError)
            throw new InvalidLoginError(
              error.errors[0]?.message || "Unknown error occurred"
            );
          throw error;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
