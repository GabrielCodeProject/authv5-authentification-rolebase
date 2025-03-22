"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getLinkAccountTokenByToken } from "@/data/link-account-token";
import { getUserByEmail } from "@/data/user";
import { deleteLinkAccountToken } from "@/data/link-account-token";

const LinkAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  token: z.string(),
  accountData: z.string().optional(),
});

export const linkAccount = async (
  values: z.infer<typeof LinkAccountSchema>
) => {
  const validatedFields = LinkAccountSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, token, accountData } = validatedFields.data;

  // Verify that the token exists and is not expired
  const linkToken = await getLinkAccountTokenByToken(token);

  if (!linkToken || linkToken.expires < new Date()) {
    return { error: "Invalid or expired token" };
  }

  // Check if token email matches provided email
  if (linkToken.email !== email) {
    return { error: "Email does not match token" };
  }

  // Find user by email
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.password) {
    return { error: "Email or password is incorrect" };
  }

  // Compare password
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordsMatch) {
    return { error: "Email or password is incorrect" };
  }

  try {
    // Parse account data from form values
    if (!accountData) {
      return { error: "Missing Google account data" };
    }

    const googleAccountData = JSON.parse(accountData);

    if (!googleAccountData.provider || !googleAccountData.providerAccountId) {
      return { error: "Invalid Google account data" };
    }

    // Create a new account link
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: "oauth",
        provider: googleAccountData.provider,
        providerAccountId: googleAccountData.providerAccountId,
        access_token: googleAccountData.access_token,
        refresh_token: googleAccountData.refresh_token,
        expires_at: googleAccountData.expires_at,
        token_type: googleAccountData.token_type,
        scope: googleAccountData.scope,
        id_token: googleAccountData.id_token,
        session_state: googleAccountData.session_state,
      },
    });

    // Set emailVerified if not already set
    if (!existingUser.emailVerified) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: new Date() },
      });
    }

    // Delete the link token
    await deleteLinkAccountToken(token);

    return {
      success: "Account linked successfully!",
      redirect: true,
      email,
      password,
    };
  } catch (error) {
    console.error("Error linking account:", error);
    return { error: "Something went wrong" };
  }
};
