"use client";
import { Form } from "../ui/form";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { Button } from "../ui/button";
import { useState } from "react";
import { FormError } from "./form-error";
import { login } from "@/actions/login";
import { Link } from "lucide-react";
import { Path, useForm } from "react-hook-form";
import GoogleLogin from "./google-button";
import FormfieldCustom from "../formfield-custom";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);
    login(data).then((res) => {
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setError("");
        setLoading(false);
      }
    });
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
          <Button type="submit" className="w-full">
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>
      <GoogleLogin />
    </CardWrapper>
  );
};
export default LoginForm;
