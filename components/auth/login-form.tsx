"use client";
import { Form } from "../ui/form";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { FormError } from "./form-error";
import { Path, useForm } from "react-hook-form";
import GoogleLogin from "./google-button";
import FormfieldCustom from "../formfield-custom";
import Link from "next/link";
import { getCsrfToken } from "next-auth/react";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  interface FieldDefinition {
    id: number;
    name: Path<z.infer<typeof LoginSchema>>;
    label: string;
    placeholder: string;
    inputType: string;
  }

  const fields: FieldDefinition[] = [
    {
      id: 1,
      name: "email",
      label: "Email",
      placeholder: "example@gmail.com",
      inputType: "email",
    },
    {
      id: 2,
      name: "password",
      label: "Password",
      placeholder: "******",
      inputType: "password",
    },
  ];

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      setLoading(true);
      setError("");

      if (!csrfToken) {
        setError("CSRF token not available");
        return;
      }

      console.log("Submitting login form with data:", {
        ...data,
        csrfToken: "[REDACTED]",
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          csrfToken,
        }),
      });

      const result = await response.json();
      console.log("Login response:", response.status, result);

      if (!response.ok) {
        setError(result.error || "An unexpected error occurred");
      } else if (result?.success && result?.redirect) {
        console.log("Login successful, redirecting to:", result.redirect);
        // Don't use router.push, use direct window location change
        window.location.href = result.redirect;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Log in to your account"
      title="Login"
      backButtonHref="/auth/register"
      backButtonLabel="Don't have an account? Register here"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
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
            <Button
              size="sm"
              variant="link"
              asChild
              className="px-0 font-normal"
            >
              <Link href="/auth/reset">Forgot password?</Link>
            </Button>
          </div>
          <FormError message={error} />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !csrfToken}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>
      <GoogleLogin />
    </CardWrapper>
  );
};

export default LoginForm;
