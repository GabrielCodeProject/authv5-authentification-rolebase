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

// Define interface for OAuth account data
interface OAuthAccountData {
  provider: string;
  providerAccountId: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string | null | undefined;
}

// Add a utility function to store temporary data for account linking
export const storeTempAccountData = (data: OAuthAccountData) => {
  const jsonData = JSON.stringify(data);

  // Store in both global variable and environment variable for redundancy
  global.TEMP_ACCOUNT_DATA = jsonData;

  // Also use environment variable as fallback
  process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA = jsonData;

  return jsonData;
};
