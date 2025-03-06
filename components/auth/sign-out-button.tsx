"use client";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut({
      redirectTo: "/auth/login",
    });
  };

  return (
    <Button onClick={handleSignOut} variant="destructive">
      Sign Out
    </Button>
  );
};
