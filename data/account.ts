import prisma from "../lib/prisma";

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
