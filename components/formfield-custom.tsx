"use client";
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormfieldCustomProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  inputType: string;
}

const FormfieldCustom = ({
  control,
  name,
  label,
  placeholder,
  inputType,
}: FormfieldCustomProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} placeholder={placeholder} type={inputType} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormfieldCustom;
