"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

/**
 * Server action to verify user credentials and establish a session
 * This is used in the account linking flow to ensure the user owns both accounts
 */
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

    // Sign in with credentials first to establish a session
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Failed to verify credentials" };
    }

    // Return success to initiate Google OAuth
    return { success: true };
  } catch (error) {
    console.error("Link account error:", error);
    return { error: "Something went wrong" };
  }
}
