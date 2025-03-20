"use client";

import { useEffect, useState } from "react";
import AdminTools from "@/components/admin/admin-tool";
import UnauthorizedMessage from "@/components/unauthorized-message/unauthorized-message";
import { EnumRole } from "@prisma/client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  isOauth?: boolean;
};

type Session = {
  user: User;
  expires: string;
};

type RoleSpecificContentProps = {
  role: EnumRole;
  contentMap: Partial<Record<EnumRole, React.ReactNode>>;
  fallback?: React.ReactNode;
};

const RoleSpecificContent = ({
  role,
  contentMap,
  fallback = null,
}: RoleSpecificContentProps) => {
  return contentMap[role] ?? fallback;
};

// Reusable Dashboard Layout Component
const DashboardLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto">
    <h1 className="text-3xl mb-6 text-center">{title}</h1>
    {children}
  </div>
);

// Profile Section Component
const ProfileSection = ({ user }: { user: User }) => (
  <div className="mb-6 w-full">
    <h2 className="text-2xl mb-2">Your Profile</h2>
    <p className="text-lg mb-1">Email: {user.email}</p>
    <p className="text-lg">Role: {user.role}</p>
  </div>
);

// Session Details Component
const SessionDetails = ({ expires }: { expires: string }) => (
  <div className="w-full">
    <h2 className="text-2xl mb-2">Session Details</h2>
    <p className="text-lg">Expires: {new Date(expires).toLocaleString()}</p>
  </div>
);

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        // Fetch the session from our API endpoint
        const response = await fetch("/api/auth/session");

        if (!response.ok) {
          if (response.status === 401 && retryCount < 3) {
            // If we get a 401, wait briefly and retry (up to 3 times)
            // This helps when the cookie was just set but not yet recognized
            console.log(
              `Session fetch attempt ${retryCount + 1} failed, retrying...`
            );
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 500);
            return;
          }
          throw new Error(`Failed to fetch session: ${response.status}`);
        }

        const data = await response.json();
        console.log("Session data:", data);

        if (data.authenticated) {
          // Construct a session object from the response
          const sessionData: Session = {
            user: data.user,
            expires:
              data.expires ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          setSession(sessionData);
        } else {
          setSession(null);
          setError("Session not found");
          // If we're not authenticated and we have a cookie, try to refresh the page
          if (
            document.cookie.includes("next-auth.session-token") &&
            retryCount < 3
          ) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 500);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [retryCount]);

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <p>Loading your dashboard...</p>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <UnauthorizedMessage title="Unauthorized">
        {error || "You need to log in to access the dashboard."}
      </UnauthorizedMessage>
    );
  }

  const { user } = session;

  const dashboardTitle =
    user.role === EnumRole.ADMIN ? "Admin Dashboard" : "Dashboard";

  return (
    <DashboardLayout title={dashboardTitle}>
      <p className="text-lg mb-4 text-center">Welcome, {user.name}!</p>
      <ProfileSection user={user} />
      <SessionDetails expires={session.expires} />

      {user.role && (
        <RoleSpecificContent
          role={user.role as EnumRole}
          contentMap={{
            [EnumRole.ADMIN]: <AdminTools />,
          }}
        />
      )}
    </DashboardLayout>
  );
}
