import { z } from "zod";

const email = z.string().trim().email("সঠিক email address দিন।").max(254);
const password = z
  .string()
  .min(12, "Password কমপক্ষে ১২ অক্ষরের হতে হবে।")
  .max(128, "Password সর্বোচ্চ ১২৮ অক্ষরের হতে পারে।");

export const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।").max(80),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "দুইটি Password একই হতে হবে।",
  });

export const credentialsSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "দুইটি Password একই হতে হবে।",
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
