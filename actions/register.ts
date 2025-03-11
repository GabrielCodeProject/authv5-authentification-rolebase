"use server";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema, registerType } from "@/schemas";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { getUserAccountByEmail } from "@/data/user";

export const register = async (data: registerType) => {
  try {
    const validatedData = RegisterSchema.safeParse(data);

    if (!validatedData.success) {
      return { error: "Invalid input data" };
    }
    const { email, name, password, passwordConfirmation } = validatedData.data;

    const userExists = await getUserAccountByEmail(email);

    if (userExists) {
      return { error: "Email already exists" };
    }

    if (password !== passwordConfirmation) {
      return { error: "Passwords do not match" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const lowerCaseEmail = email.toLowerCase();
    const user = await prisma.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
      },
    });
    if (!user) return { error: "user couldnt be created" };
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: email,
      },
    });
    //generate a verification token
    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(email, verificationToken.token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      success: "confimation email sent ! ",
    };
  } catch (error) {
    console.error("Error registering user: ", error);
    return { error: "Error registering user" };
  }
};
