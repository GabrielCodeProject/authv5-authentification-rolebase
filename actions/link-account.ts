"use server";

import { LinkAccountSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { getUserAccountByEmail } from "@/data/user";
import {
  deleteLinkAccountToken,
  getLinkAccountTokenByToken,
} from "@/data/link-account-token";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const linkAccount = async (data: {
  email: string;
  password: string;
  token: string;
}) => {
  // Validate input data
  const validatedData = LinkAccountSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: "Invalid input data" };
  }

  const { email, password, token } = validatedData.data;

  try {
    // Verify token is valid
    const linkToken = await getLinkAccountTokenByToken(token);
    if (!linkToken || linkToken.email !== email) {
      return { error: "Invalid or expired token" };
    }

    // Check token expiration
    if (new Date(linkToken.expires) < new Date()) {
      await deleteLinkAccountToken(token);
      return { error: "Token has expired, please try again" };
    }

    // Find user with the provided email
    const user = await getUserAccountByEmail(email);
    if (!user || !user.password) {
      return { error: "Account not found" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Invalid password" };
    }

    // Retrieve temporarily stored OAuth account data
    const tempAccountData =
      global.TEMP_ACCOUNT_DATA || process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA;
    if (!tempAccountData) {
      return { error: "No account data available for linking" };
    }

    // Parse the account data
    const accountData = JSON.parse(tempAccountData);

    // Create a new account record
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: accountData.provider,
        providerAccountId: accountData.providerAccountId,
        access_token: accountData.access_token,
        refresh_token: accountData.refresh_token,
        expires_at: accountData.expires_at,
        token_type: accountData.token_type,
        scope: accountData.scope,
        id_token: accountData.id_token,
        session_state: accountData.session_state,
      },
    });

    // Ensure email is verified
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    // Clear the temporary data
    global.TEMP_ACCOUNT_DATA = undefined;
    if (process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA) {
      process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA = undefined;
    }

    // Delete the token after successful linking
    await deleteLinkAccountToken(token);

    return { success: true, redirect: "/auth/login?accountLinked=true" };
  } catch (error) {
    console.error("Account linking error:", error);

    if (error instanceof AuthError) {
      return { error: "Authentication error: " + error.message };
    }

    return { error: "Something went wrong. Please try again." };
  }
};
