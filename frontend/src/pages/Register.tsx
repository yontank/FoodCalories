import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { loginSchema, registerSchema } from "@/schemas/user";
import { client } from "@/api/client";
import { useLogin } from "@/hooks/useLogin";

function RegisterForm() {
  const { login, inProgress: loginInProgress } = useLogin();
  const [registerInProgress, setRegisterInProgress] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    setRegisterInProgress(true);

    const { error } = await client.POST("/api/v1/register", {
      body: {
        username: formData.username,
        password: formData.password,
      },
    });

    setRegisterInProgress(false);

    if (error) {
      setErrorMessage(JSON.stringify(error));
      return;
    }

    login({
      username: formData.username,
      password: formData.password,
      setErrorMessage,
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>הרשמה</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-login-username">
                    שם משתמש
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-login-username"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-login-password">סיסמה</FieldLabel>
                  <Input
                    {...field}
                    id="form-login-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-login-confirmPassword">
                    אשר סיסמה
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-login-confirmPassword"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        {errorMessage && <div>{errorMessage}</div>}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-login"
            disabled={loginInProgress || registerInProgress}
          >
            כניסה
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

export function Register() {
  return (
    <div className="w-full flex justify-center mt-12">
      <RegisterForm />
    </div>
  );
}
