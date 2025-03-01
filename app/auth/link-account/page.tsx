import { auth } from "@/auth";
import CredentialsForm from "@/components/auth/credentials-form";
import { redirect } from "next/navigation";

export default async function LinkAccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Account Linking Required</h1>
      <p className="mb-4">
        This email is already associated with an existing account. Please sign
        in with your password to link accounts.
      </p>

      <CredentialsForm email={session.user.email} />
    </div>
  );
}
