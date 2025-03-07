"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function linkAccount(email: string, password: string) {
  try {
    // Find the user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser || !existingUser.password) {
      return { error: "Invalid credentials" };
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    // First sign in with credentials to establish session
    const credentialsResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (credentialsResult?.error) {
      return { error: "Failed to verify credentials" };
    }

    // Then initiate Google OAuth flow
    await signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    console.error("Link account error:", error);
    return { error: "Something went wrong" };
  }
}
