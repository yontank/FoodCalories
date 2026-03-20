import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { HTMLInputTypeAttribute } from "react";
import i18next from "i18next";

type Props<T extends FieldValues> = {
  formName: string;
  form: UseFormReturn<T, unknown, T>;
  name: FieldPath<T>;
  label: string;
  type?: HTMLInputTypeAttribute;
};

export function ControlledField<T extends FieldValues>({
  formName,
  form,
  name,
  label,
  type,
}: Props<T>) {
  const htmlId = `${formName}-${name}`;
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={htmlId}>{label}</FieldLabel>
          <Input
            {...field}
            id={htmlId}
            aria-invalid={fieldState.invalid}
            type={type}
            autoComplete="off"
          />
          {fieldState.invalid && (
            <FieldError
              errors={[{ message: i18next.t(fieldState.error?.message ?? "") }]}
            />
          )}
        </Field>
      )}
    />
  );
}
