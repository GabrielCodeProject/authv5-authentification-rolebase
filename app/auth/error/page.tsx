"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "OAuthAccountNotLinked") {
      window.location.href = "/auth/link-account";
    }
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-red-500">{error}</p>
      <Button
        onClick={() => (window.location.href = "/auth/login")}
        className="mt-4"
      >
        Return to Login
      </Button>
    </div>
  );
}
