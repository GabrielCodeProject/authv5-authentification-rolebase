import prisma from "@/lib/prisma";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email: email,
      },
    });
    return verificationToken;
  } catch (error) {
    console.log("Error getting verification token: ", error);
  }
};
