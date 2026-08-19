"use client";

import { Label, FieldError, TextField, Input } from "@heroui/react";
import type { InputHTMLAttributes } from "react";

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  type?: string;
  value: string;
  onChange: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onBlur?: InputHTMLAttributes<HTMLInputElement>["onBlur"];
};

export default function FormField({
  label,
  name,
  error,
  type = "text",
  value,
  onChange,
  onBlur,
}: FormFieldProps) {
  return (
    <TextField name={name} isInvalid={Boolean(error)}>
      <Label>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
