"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import { register } from "@/actions/register";
import GoogleLogin from "./google-button";
import { useRouter } from "next/navigation";
import FormfieldCustom from "../formfield-custom";

export const RegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fields = [
    {
      id: 1,
      name: "email",
      label: "Email",
      placeholder: "example@gmail.com",
      inputType: "email",
    },
    {
      id: 2,
      name: "name",
      label: "Name",
      placeholder: "John Doe",
      inputType: "text",
    },
    {
      id: 3,
      name: "password",
      label: "Password",
      placeholder: "******",
      inputType: "password",
    },
    {
      id: 4,
      name: "passwordConfirmation",
      label: "Confirm Password",
      placeholder: "******",
      inputType: "password",
    },
  ];
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    setLoading(true);
    register(data).then((res) => {
      if (res.error) {
        setLoading(false);
        setError(res.error);
        setSuccess("");
      }
      if (res.success) {
        setLoading(false);
        setSuccess(res.success);
        setError("");
        router.push("/auth/login");
      }
      setLoading(false);
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      title="Register"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account"
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
          </div>
          <FormSuccess message={success} />
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Register"}
          </Button>
        </form>
      </Form>
      <GoogleLogin />
    </CardWrapper>
  );
};
