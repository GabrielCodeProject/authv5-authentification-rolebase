import { NextResponse } from "next/server";
import { getLinkAccountTokenByToken } from "@/data/link-account-token";

// Declare the global variable to fix TypeScript errors
declare global {
  var TEMP_ACCOUNT_DATA: string | undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token is valid
    const linkToken = await getLinkAccountTokenByToken(token);

    if (!linkToken || linkToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Get the temporary account data stored during OAuth flow
    // Try both the global and env variable approaches
    const accountData =
      global.TEMP_ACCOUNT_DATA || process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA;

    if (!accountData) {
      return NextResponse.json(
        { error: "No account data found" },
        { status: 400 }
      );
    }

    try {
      // Make sure the account data is valid JSON
      const parsedData = JSON.parse(accountData);

      // Clear the temp data after retrieving it
      global.TEMP_ACCOUNT_DATA = undefined;
      process.env.NEXT_PUBLIC_TEMP_ACCOUNT_DATA = "";

      return NextResponse.json({
        success: true,
        accountData: parsedData,
        email: linkToken.email,
      });
    } catch (e) {
      console.error("Invalid account data format:", e);
      return NextResponse.json(
        { error: "Invalid account data format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in link-account API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
