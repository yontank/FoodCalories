import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
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
import { loginSchema } from "@/schemas/user";
import { useLogin } from "@/hooks/useLogin";
import { useNavigate } from "react-router";
import { ErrorBox } from "@/components/ErrorBox";
import { useTranslation } from "react-i18next";

function LoginForm() {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const navigate = useNavigate();

  const { login, inProgress } = useLogin();

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    login({
      username: formData.username,
      password: formData.password,
      setErrorMessage,
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>{t("key5", "כניסה")}</CardTitle>
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
                    {t("key2", "שם משתמש")}
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
                  <FieldLabel htmlFor="form-login-password">
                    {t("key3", "סיסמה")}
                  </FieldLabel>
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
          </FieldGroup>
        </form>
        {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="justify-between">
          <Button type="submit" form="form-login" disabled={inProgress}>
            {t("key5", "כניסה")}
          </Button>
          <Button variant={"secondary"} onClick={() => navigate("/register")}>
            {t("key", "הרשמה")}
          </Button>
        </Field>
        --- OR
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
        ;
      </CardFooter>
    </Card>
  );
}

export function Login() {
  return (
    <div className="w-full flex justify-center mt-12">
      <LoginForm />
    </div>
  );
}
