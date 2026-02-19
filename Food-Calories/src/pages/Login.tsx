import { userAtom } from "@/atoms/user";
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
import { useAtom } from "jotai";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import createClient from "openapi-fetch";
import type { paths } from "@/api/v1";
import * as z from "zod";
import { useState } from "react";

const formSchema = z.object({
  username: z
    .string()
    .min(5, "Username must be at least 5 characters.")
    .max(32, "Username must be at most 32 characters."),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(100, "Password must be at most 100 characters."),
});

const client = createClient<paths>({ baseUrl: "/" });

function LoginForm() {
  const [, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    const { data, error } = await client.POST("/v1/token", {
      body: {
        username: formData.username,
        password: formData.password,
        scope: "",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (error) {
      console.log(error);
      setErrorMessage(error.detail?.map((d) => d.msg).join("\n"));
    } else {
      setUser(formData.username);
      navigate("/");
    }
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>כניסה</CardTitle>
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
          </FieldGroup>
        </form>
        {errorMessage && <div>{errorMessage}</div>}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form-login">
            כניסה
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
