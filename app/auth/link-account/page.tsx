"use client";

import LinkAccountForm from "@/components/auth/link-account-form";
import { useSearchParams } from "next/navigation";

export default function LinkAccountPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return null;
  }

  return <LinkAccountForm email={email} />;
}
