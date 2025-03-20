import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { getUserAccountByEmail } from "@/data/user";
import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { createDatabaseSession } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = LoginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;
    const { csrfToken } = body;

    const userExists = await getUserAccountByEmail(email);

    if (!userExists || !userExists.password || !userExists.email) {
      return NextResponse.json(
        { error: "Email not exist please register" },
        { status: 400 }
      );
    }

    // Check email verification before attempting sign in
    if (!userExists.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 400 }
      );
    }

    try {
      console.log("Starting sign in for:", email);

      const result = await signIn("credentials", {
        email: userExists.email,
        password,
        csrfToken,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Manually create a database session
      try {
        const { sessionToken, expires } = await createDatabaseSession(
          userExists.id
        );
        console.log(
          "Successfully created database session for user:",
          userExists.id
        );

        // Create a response with the success message
        const response = NextResponse.json(
          { success: true, redirect: "/dashboard" },
          { status: 200 }
        );

        // Set the session cookie in the response
        response.cookies.set({
          name: "next-auth.session-token",
          value: sessionToken,
          expires,
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        return response;
      } catch (sessionError) {
        console.error("Failed to create database session:", sessionError);
        // Continue even without session
        return NextResponse.json(
          { success: true, redirect: "/dashboard" },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Sign in error:", error);

      if (error instanceof AuthError) {
        switch (error.type) {
          case "OAuthAccountNotLinked":
            return NextResponse.json(
              { redirect: "/auth/link-account" },
              { status: 302 }
            );
          case "CredentialsSignin":
            return NextResponse.json(
              { error: "Invalid email or password" },
              { status: 401 }
            );
          default:
            return NextResponse.json(
              { error: "Something went wrong. Please try again." },
              { status: 500 }
            );
        }
      }

      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
