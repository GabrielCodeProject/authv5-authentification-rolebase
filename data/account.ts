import prisma from "@/lib/prisma";

// utiliser pour fetch les donners lorsque le user est connecter par un provider autre que le credential
// google provider account
export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get account by provider and providerAccountId
export const getAccountByProvider = async (
  provider: string,
  providerAccountId: string
) => {
  try {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
    return account;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Link a Google account to an existing user
export const linkGoogleAccount = async (
  userId: string,
  provider: string,
  providerAccountId: string,
  access_token?: string,
  refresh_token?: string,
  expires_at?: number,
  token_type?: string,
  scope?: string,
  id_token?: string,
  session_state?: string
) => {
  try {
    // Create account linked to the user
    const account = await prisma.account.create({
      data: {
        userId,
        type: "oauth",
        provider,
        providerAccountId,
        access_token,
        refresh_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
      },
    });
    return account;
  } catch (error) {
    console.error("Error linking Google account:", error);
    return null;
  }
};
