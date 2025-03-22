import LoginForm from "@/components/auth/login-form";
import { Suspense } from "react";

interface SearchParams {
  accountLinked?: string;
  error?: string;
}

const LoginPage = async ({ searchParams }: { searchParams?: SearchParams }) => {
  // Since searchParams is a server component prop that should be awaited
  const params = await Promise.resolve(searchParams || {});
  const accountLinked = params.accountLinked === "true";
  const error = params.error;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm accountLinked={accountLinked} error={error} />
    </Suspense>
  );
};

export default LoginPage;
