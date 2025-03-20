import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserById } from "@/data/user";

export async function GET() {
  try {
    // Get session via auth()
    const session = await auth();

    // No valid session
    if (!session || !session.user) {
      console.log("No session found in auth()");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get full user data from database
    const userId = session.user.id;
    const dbUser = await getUserById(userId);

    if (!dbUser) {
      console.error("User not found in database:", userId);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log("Session found for user:", dbUser.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
      },
      expires: session.expires,
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to authenticate session",
      },
      { status: 500 }
    );
  }
}
