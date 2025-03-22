import { Suspense } from "react";
import LinkAccountForm from "@/components/auth/link-account-form";
import { redirect } from "next/navigation";
import { getLinkAccountTokenByToken } from "@/data/link-account-token";

interface SearchParams {
  email?: string;
  token?: string;
}

const LinkAccountPage = async ({
  searchParams,
}: {
  searchParams?: SearchParams;
}) => {
  const params = await Promise.resolve(searchParams || {});
  const { email, token } = params;

  // Validate required parameters
  if (!email || !token) {
    redirect("/auth/login");
  }

  // Validate token exists and isn't expired
  const linkToken = await getLinkAccountTokenByToken(token);
  if (
    !linkToken ||
    linkToken.email !== email ||
    new Date(linkToken.expires) < new Date()
  ) {
    redirect("/auth/login?error=InvalidToken");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinkAccountForm email={email} token={token} />
    </Suspense>
  );
};

export default LinkAccountPage;
