import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { loginSchema } from "@/schemas/user";
import { useLogin } from "@/hooks/useLogin";
import { useNavigate } from "react-router";
import { ErrorBox } from "@/components/ErrorBox";
import { useTranslation } from "react-i18next";
import { ControlledField } from "@/components/ControlledField";

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
            <ControlledField
              form={form}
              formName="form-login"
              name="username"
              label={t("key2", "שם משתמש")}
            />
            <ControlledField
              form={form}
              formName="form-login"
              name="password"
              label={t("key3", "סיסמה")}
              type="password"
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
