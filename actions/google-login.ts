"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function googleAuthenticate() {
  try {
    await signIn("google");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "OAuthAccountNotLinked": {
          return { error: "Account needs linking" };
        }
        default: {
          return { error: "Google log in failed" };
        }
      }
    }
    throw error;
  }
}
