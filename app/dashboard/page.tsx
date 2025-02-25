import { auth } from "@/auth";

const DashboardPage = async () => {
  const session = await auth();
  console.log(session);
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
