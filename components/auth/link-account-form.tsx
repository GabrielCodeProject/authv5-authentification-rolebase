"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/card-wrapper";
import { FormError } from "@/components/auth/form-error";
import { FormSuccess } from "@/components/auth/form-success";
import { linkAccount } from "@/actions/link-account";
import FormfieldCustom from "../formfield-custom";
import { signIn } from "next-auth/react";

const LinkAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function LinkAccountForm({ email }: { email: string }) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof LinkAccountSchema>>({
    resolver: zodResolver(LinkAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LinkAccountSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);

    try {
      // First verify credentials
      const result = await linkAccount(email, values.password);

      if (result?.error) {
        setError(result.error);
        setIsPending(false);
        return;
      }

      // If credentials are valid, show success message
      setSuccess("Verified! Linking your account...");

      // Then initiate Google OAuth flow
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Link account error:", error);
      setError("Something went wrong");
      setIsPending(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Link your Google Account"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      title="Link Account"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your password to link your Google account with:
            </p>
            <p className="text-sm font-medium">{email}</p>
            <FormfieldCustom
              control={form.control}
              name="password"
              label="Password"
              placeholder="******"
              inputType="password"
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Linking..." : "Link Account"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
