import { signOut } from "@/auth";
import { NextResponse } from "next/server";
import { deleteSessionByToken } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the session token from the cookie
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;

    // Call the signOut method
    await signOut({ redirect: false });

    // Manually delete the session from the database
    if (sessionToken) {
      await deleteSessionByToken(sessionToken);
    }

    // Create a response
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear the session cookie
    response.cookies.delete("next-auth.session-token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
