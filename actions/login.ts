"use server";

import { LoginSchema, loginType } from "@/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getUserAccountByEmail } from "@/data/user";

interface LoginData extends loginType {
  csrfToken?: string;
}

export const login = async (data: LoginData) => {
  const validatedData = LoginSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid input data" };
  }
  const { email, password } = validatedData.data;
  const { csrfToken } = data;
  console.log("csrftoken", csrfToken);
  const userExists = await getUserAccountByEmail(email);

  if (!userExists || !userExists.password || !userExists.email) {
    return { error: "email not exist please register" };
  }

  // Check email verification before attempting sign in
  if (!userExists.emailVerified) {
    return { error: "Please verify your email before logging in" };
  }

  try {
    const result = await signIn("credentials", {
      email: userExists.email,
      password,
      csrfToken,
      redirect: false,
    });

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
          return { error: "Something went wrong. Please try again." };
      }
    }
  }
};
