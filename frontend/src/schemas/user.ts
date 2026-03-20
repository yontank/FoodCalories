import * as z from "zod";

const username = z.string().min(5, "usernameMin").max(32, "usernameMax");

const password = z
  .string()
  .min(8, "passwordMin")
  .max(100, "passwordMax")
  .refine((password) => /[0-9]/.test(password), "passwordDigit")
  .refine((password) => /[!@#$%^&*]/.test(password), "passwordSpecial");

export const loginSchema = z.object({
  username,
  password,
});

export const registerSchema = z
  .object({
    username,
    password,
    confirmPassword: password,
  })
  .refine((values) => values.confirmPassword == values.password, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
