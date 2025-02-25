"use server";
import * as z from "zod";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  try {
    const validatedData = RegisterSchema.parse(data);

    if (!validatedData) {
      return { error: "Invalid input data" };
    }
    const { email, name, password, passwordConfirmation } = validatedData;

    if (password !== passwordConfirmation) {
      return { error: "Passwords do not match" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (userExists) {
      return { error: "User already exists" };
    }
    const lowerCaseEmail = email.toLowerCase();
    const user = await prisma.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
      },
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      success: "user created with success",
    };
  } catch (error) {
    console.error("Error registering user: ", error);
    //throw new Error("Error registering user");
    return { error: "Error registering user" };
  }
};
