import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

// Helper function to create a database session for a user - server-side only
export async function createDatabaseSession(userId: string) {
  try {
    // Create unique session token
    const sessionToken = uuidv4();

    // Set expiry to 30 days from now
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    // Create session in database
    await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires,
      },
    });

    // Return the token to be set as a cookie by the caller
    return {
      sessionToken,
      expires,
    };
  } catch (error) {
    console.error("Error creating database session:", error);
    throw error;
  }
}

// Delete a session from the database by token
export async function deleteSessionByToken(sessionToken: string) {
  try {
    if (!sessionToken) return;

    // Delete session from database
    await prisma.session
      .delete({
        where: { sessionToken },
      })
      .catch((err) => {
        // Ignore if session doesn't exist
        if (err.code !== "P2025") throw err;
      });
  } catch (error) {
    console.error("Error deleting database session:", error);
  }
}
