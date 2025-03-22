import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
}

export const GoogleSignInButton = ({
  mode = "signin",
}: GoogleSignInButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      // Use signIn from NextAuth to trigger Google OAuth flow
      // Account linking will be handled by our signIn callback in auth.ts
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      type="button"
      className="w-full"
      onClick={handleClick}
      disabled={isLoading}
    >
      <FcGoogle className="h-5 w-5 mr-2" />
      {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
    </Button>
  );
};
