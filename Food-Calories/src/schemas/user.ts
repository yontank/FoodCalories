import * as z from "zod";

const username = z
  .string()
  .min(5, "Username must be at least 5 characters.")
  .max(32, "Username must be at most 32 characters.");

const password = z
  .string()
  .min(8, "Password must be at least 10 characters.")
  .max(100, "Password must be at most 100 characters.")
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must have at least one digit.",
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    "Password must have at least one special character.",
  );

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
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
