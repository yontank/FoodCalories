import * as z from "zod";
import i18next from 'i18next'

const username = z
  .string()
  .min(5, i18next.t('usernameMin', 'Username must be at least 5 characters.'))
  .max(32, i18next.t('usernameMax', 'Username must be at most 32 characters.'));

const password = z
  .string()
  .min(8, i18next.t('passwordMin', 'Password must be at least 8 characters.'))
  .max(100, i18next.t('passwordMax', 'Password must be at most 100 characters.'))
  .refine(
    (password) => /[0-9]/.test(password),
    i18next.t('passwordDigit', 'Password must have at least one digit.'),
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    i18next.t('passwordSpecial', 'Password must have at least one special character.'),
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
    message: i18next.t('passwordsDoNotMatch', 'Passwords do not match.'),
    path: ["confirmPassword"],
  });
