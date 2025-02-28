import { auth } from "@/auth";
import AdminTools from "@/components/admin/admin-tool";
import UnauthorizedMessage from "@/components/unauthorized-message/unauthorized-message";
import { EnumRole } from "@prisma/client";

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
const ProfileSection = ({ user }: { user: any }) => (
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

const DashboardPage = async () => {
  const session = await auth();
  console.log("session object from dashboard:", session);

  // Early return for unauthorized cases
  if (!session || !session.user) {
    return (
      <UnauthorizedMessage title="Unauthorized">
        {!session
          ? "You need to log in to access the dashboard."
          : "Your session is invalid"}
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

      <RoleSpecificContent
        role={user.role}
        contentMap={{
          [EnumRole.ADMIN]: <AdminTools />,
        }}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
