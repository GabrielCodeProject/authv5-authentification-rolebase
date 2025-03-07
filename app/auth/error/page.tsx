"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CardWrapper from "@/components/auth/card-wrapper";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "OAuthAccountNotLinked") {
      router.push("/auth/link-account");
    }
  }, [error, router]);

  return (
    <CardWrapper
      headerLabel="Authentication Error"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      title="Error"
    >
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-center">
          {error === "OAuthAccountNotLinked" ? (
            <>
              <p>Email already in use with different provider.</p>
              <p>Redirecting to account linking...</p>
            </>
          ) : (
            <p className="text-destructive">{error}</p>
          )}
        </div>

        <Button variant="secondary" className="w-full" asChild>
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </div>
    </CardWrapper>
  );
}
