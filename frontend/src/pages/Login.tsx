import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { loginSchema } from "@/schemas/user";
import { useLogin } from "@/hooks/useLogin";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { Link } from "react-router";
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

  const { login, inProgress } = useLogin();
  const { googleLogin } = useGoogleLogin();

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    login({
      username: formData.username,
      password: formData.password,
      setErrorMessage,
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
        <CardDescription>{t("loginSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
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
            <Button
              type="submit"
              form="form-login"
              disabled={inProgress}
              className="mt-2 w-full"
            >
              {t("key5", "כניסה")}
            </Button>
          </FieldGroup>
        </form>

        {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("or")}
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleLogin({
                  token: credentialResponse,
                  setErrorMessage,
                });
              }
            }}
            onError={() => {
              setErrorMessage(t("googleLoginFailed"));
            }}
            width={350}
          />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("key", "הרשמה")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function Login() {
  const { t } = useTranslation();
  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-background via-background to-muted/40 flex flex-col items-center justify-center p-4 gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">{t("appName")}</h1>
        <p className="text-sm text-muted-foreground">{t("appTagline")}</p>
      </div>
      <LoginForm />
    </div>
  );
}
