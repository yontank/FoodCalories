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
import { loginSchema, registerSchema } from "@/schemas/user";
import { client } from "@/api/client";
import { useLogin } from "@/hooks/useLogin";
import { ErrorBox } from "@/components/ErrorBox";
import { useTranslation } from "react-i18next";
import { ControlledField } from "@/components/ControlledField";

function RegisterForm() {
  const { t } = useTranslation();
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
        <CardTitle>{t("key", "הרשמה")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-register" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <ControlledField
              form={form}
              formName="form-register"
              name="username"
              label={t("key2", "שם משתמש")}
            />
            <ControlledField
              form={form}
              formName="form-register"
              name="password"
              label={t("key3", "סיסמה")}
              type="password"
            />
            <ControlledField
              form={form}
              formName="form-register"
              name="confirmPassword"
              label={t("key4", "אשר סיסמה")}
              type="password"
            />
          </FieldGroup>
        </form>
        {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-register"
            disabled={loginInProgress || registerInProgress}
          >
            {t("key5", "כניסה")}
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
