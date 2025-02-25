import { getVerificationTokenByEmail } from "@/data/verification-token";
import { randomUUID } from "crypto";
import prisma from "./prisma";

export const generateVerificationToken = async (email: string) => {
  //generate random token
  const token = randomUUID();
  const expires = new Date().getTime() + 1000 * 60 * 60 * 1; // 1 hours

  // check if a token already exists for the user
  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        email_token: {
          email: existingToken.email,
          token: existingToken.token,
        },
      },
    });
  }

  //create new verification token
  const verificationToken = await prisma.verificationToken.create({
    data: { email, token, expires: new Date(expires) },
  });
  return verificationToken;
};
