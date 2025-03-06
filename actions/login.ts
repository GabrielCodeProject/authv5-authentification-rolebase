"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";

export const login = async (data: z.infer<typeof LoginSchema>) => {
  const validatedData = LoginSchema.parse(data);
  console.log("validated data: ", validatedData);

  if (!validatedData) {
    return { error: "Invalid input data" };
  }
  const { email, password } = validatedData;

  const userExists = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!userExists || !userExists.password || !userExists.email) {
    return { error: "User not found" };
  }

  // Check email verification before attempting sign in
  if (!userExists.emailVerified) {
    return { error: "Please verify your email before logging in" };
  }

  try {
    const result = await signIn("credentials", {
      email: userExists.email,
      password,
      redirect: false,
    });

    console.log("Sign in result:", result);

    if (result?.error) {
      return { error: "Invalid email or password" };
    }

    // If sign in is successful, return success with redirect path
    return { success: true, redirect: "/dashboard" };
  } catch (error) {
    console.error("Sign in error:", error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case "OAuthAccountNotLinked":
          return { redirect: "/auth/link-account" };
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "An error occurred during sign in" };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }
};
