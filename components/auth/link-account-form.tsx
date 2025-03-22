"use client";
import { Form } from "../ui/form";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkAccountSchema } from "@/schemas";
import { z } from "zod";
import { Button } from "../ui/button";
import { useState } from "react";
import { FormError } from "./form-error";
import FormSuccess from "./form-success";
import { Path, useForm } from "react-hook-form";
import { linkAccount } from "@/actions/link-account";
import FormfieldCustom from "../formfield-custom";
import { useRouter } from "next/navigation";

interface LinkAccountFormProps {
  email: string;
  token: string;
}

const LinkAccountForm = ({ email, token }: LinkAccountFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  interface FieldDefinition {
    id: number;
    name: Path<z.infer<typeof LinkAccountSchema>>;
    label: string;
    placeholder: string;
    inputType: string;
  }

  const fields: FieldDefinition[] = [
    {
      id: 1,
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      inputType: "password",
    },
  ];

  const form = useForm<z.infer<typeof LinkAccountSchema>>({
    resolver: zodResolver(LinkAccountSchema),
    defaultValues: {
      email,
      token,
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof LinkAccountSchema>) => {
    try {
      setLoading(true);
      setError("");
      setSuccess(null);

      const result = await linkAccount(data);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess("Account linked successfully!");

        // Redirect after a short delay
        setTimeout(() => {
          if (result.redirect) {
            router.push(result.redirect);
          }
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Link account error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Link your Google account"
      title="Link Account"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="mb-4 text-center text-sm">
        <p>
          We found an existing account with email <strong>{email}</strong>.
          Enter your password to link your Google account.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="token" value={token} />
          <div className="space-y-4">
            {fields.map((field) => (
              <FormfieldCustom
                key={field.id}
                control={form.control}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                inputType={field.inputType}
              />
            ))}
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Linking..." : "Link Account"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LinkAccountForm;
