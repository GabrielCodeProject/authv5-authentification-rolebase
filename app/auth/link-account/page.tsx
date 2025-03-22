"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { linkAccount } from "@/actions/link-account";

// Create simple form success and error components
const FormSuccess = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-emerald-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-700">
      <p>{message}</p>
    </div>
  );
};

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700">
      <p>{message}</p>
    </div>
  );
};

const LinkAccountSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  token: z.string(),
  accountData: z.string().optional(),
});

type LinkAccountFormValues = z.infer<typeof LinkAccountSchema>;

export default function LinkAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<LinkAccountFormValues>({
    resolver: zodResolver(LinkAccountSchema),
    defaultValues: {
      email: "",
      password: "",
      token: "",
      accountData: "",
    },
  });

  useEffect(() => {
    if (searchParams) {
      // Get email and token from search params
      const emailParam = searchParams.get("email");
      const tokenParam = searchParams.get("token");

      if (emailParam) {
        form.setValue("email", emailParam);
      }

      if (tokenParam) {
        form.setValue("token", tokenParam);

        // Fetch account data from API
        fetchAccountData(tokenParam);
      } else {
        setIsLoading(false);
        setError("Missing token parameter");
      }
    } else {
      setIsLoading(false);
      setError("Invalid request");
    }
  }, [searchParams, form]);

  const fetchAccountData = async (tokenValue: string) => {
    try {
      const response = await fetch(`/api/link-account?token=${tokenValue}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        // Store account data in form instead of sessionStorage
        form.setValue("accountData", JSON.stringify(data.accountData));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError("Failed to load account data");
      setIsLoading(false);
    }
  };

  const onSubmit = (values: LinkAccountFormValues) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      linkAccount(values)
        .then(async (data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            setSuccess(data.success);

            // Instead of trying to sign in here, redirect to login page
            setTimeout(() => {
              router.push("/auth/login?accountLinked=true");
            }, 1500);
          }
        })
        .catch(() => {
          setError("Something went wrong");
        });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Link Your Google Account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We found an existing account with this email. Please enter your
          password to link your Google account.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="email@example.com"
                      disabled={true}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="******"
                      type="password"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" {...form.register("token")} />
            <input type="hidden" {...form.register("accountData")} />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              Link Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
