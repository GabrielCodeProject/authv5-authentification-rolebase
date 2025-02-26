import { auth } from "@/auth";
import { EnumRole } from "@prisma/client";

const DashboardPage = async () => {
  const session = await auth();
  console.log("session object from dashboard:", session);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto text-center">
        <h1 className="text-2xl mb-4">Unauthorized</h1>
        <p className="text-lg">You need to log in to access the dashboard.</p>
      </div>
    );
  }

  const { user } = session;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto text-center">
        <h1 className="text-2xl mb-4">Unauthorized</h1>
        <p className="text-lg">Your session is invalid</p>
      </div>
    );
  }

  if(user.role === EnumRole.ADMIN){
    return (
      <div className="flex flex-col items-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto">
        <h1 className="text-3xl mb-6 text-center">Admin Dashboard</h1>
        <p className="text-lg mb-4 text-center">Welcome, {user.name}!</p>
        <div className="mb-6 w-full">
          <h2 className="text-2xl mb-2">Your Profile</h2>
          <p className="text-lg mb-1">Email: {user.email}</p>
          <p className="text-lg">Role: {user.role}</p>
        </div>
        <div className="w-full">
          <h2 className="text-2xl mb-2">Session Details</h2>
          <p className="text-lg">
            Expires: {new Date(session.expires).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto">
      <h1 className="text-3xl mb-6 text-center">Dashboard</h1>
      <p className="text-lg mb-4 text-center">Welcome, {user.name}!</p>
      <div className="mb-6 w-full">
        <h2 className="text-2xl mb-2">Your Profile</h2>
        <p className="text-lg mb-1">Email: {user.email}</p>
        <p className="text-lg">Role: {user.role}</p>
      </div>
      <div className="w-full">
        <h2 className="text-2xl mb-2">Session Details</h2>
        <p className="text-lg">
          Expires: {new Date(session.expires).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
