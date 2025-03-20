import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";
import prisma from "@/lib/prisma";

// Create a custom adapter that extends the PrismaAdapter to handle credential provider
export function CustomPrismaAdapter(): Adapter {
  // Get the base adapter
  const adapter = PrismaAdapter(prisma);

  // Return a new adapter with overridden methods
  return {
    ...adapter,
    // Override the createSession method to ensure it works with credentials provider
    async createSession(data) {
      console.log("Creating new session:", data);
      return prisma.session.create({
        data,
      });
    },

    // Make sure getSessionAndUser correctly fetches the session
    async getSessionAndUser(sessionToken) {
      console.log(
        "Getting session and user for token:",
        sessionToken?.substring(0, 10) + "..."
      );

      const sessionAndUser = await prisma.$transaction(async (tx) => {
        const session = await tx.session.findUnique({
          where: { sessionToken },
        });

        if (!session) {
          console.log("No session found for token");
          return null;
        }

        const user = await tx.user.findUnique({
          where: { id: session.userId },
        });

        if (!user) {
          console.log("No user found for session");
          return null;
        }

        return { session, user };
      });

      return sessionAndUser as {
        session: AdapterSession;
        user: AdapterUser;
      } | null;
    },

    // Make sure updateSession works correctly
    async updateSession(data) {
      console.log(
        "Updating session:",
        data.sessionToken?.substring(0, 10) + "..."
      );
      return prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },

    // Ensure deleteSession works
    async deleteSession(sessionToken) {
      console.log("Deleting session:", sessionToken?.substring(0, 10) + "...");
      await prisma.session.delete({
        where: { sessionToken },
      });
    },
  };
}
