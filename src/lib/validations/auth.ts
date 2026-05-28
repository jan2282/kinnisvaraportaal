import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Vigane e-posti aadress"),
  password: z.string().min(1, "Sisesta parool"),
});

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Sisesta oma nimi"),
  email: z.string().email("Vigane e-posti aadress"),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Parool peab olema vähemalt 8 tähemärki"),
  role: z.enum(["buyer", "seller", "both"]),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
