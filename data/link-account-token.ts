import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export const createLinkAccountToken = async (email: string) => {
  // Generate random token
  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

  // Check if a token already exists for the user
  const existingToken = await getLinkAccountTokenByEmail(email);

  if (existingToken) {
    await prisma.linkAccountToken.delete({
      where: {
        email_token: {
          email: existingToken.email,
          token: existingToken.token,
        },
      },
    });
  }

  // Create new link account token
  const linkAccountToken = await prisma.linkAccountToken.create({
    data: { email, token, expires },
  });

  return linkAccountToken;
};

export const getLinkAccountTokenByEmail = async (email: string) => {
  try {
    const linkAccountToken = await prisma.linkAccountToken.findFirst({
      where: { email },
    });
    return linkAccountToken;
  } catch (error) {
    console.error("Error getting link account token: ", error);
    return null;
  }
};

export const getLinkAccountTokenByToken = async (token: string) => {
  try {
    const linkAccountToken = await prisma.linkAccountToken.findFirst({
      where: { token },
    });
    return linkAccountToken;
  } catch (error) {
    console.error("Error getting link account token by token: ", error);
    return null;
  }
};

export const deleteLinkAccountToken = async (token: string) => {
  try {
    await prisma.linkAccountToken.delete({
      where: {
        token,
      },
    });
  } catch (error) {
    console.error("Error deleting link account token: ", error);
  }
};
