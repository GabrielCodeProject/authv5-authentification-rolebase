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

  try {
    await signIn("credentials", {
      email: userExists.email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid credentials" };
        }
        case "OAuthAccountNotLinked":
          return { redirect: "/auth/link-account" };
        default: {
          return { error: "Invalid password" };
        }
      }
    }
    throw error;
  }
};
