import * as z from "zod";

export const SignupSchema = z.object({
  username: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Minimum 6 characters required"),
  role: z.enum(["hr", "candidate", "manager"], { message: "Role is required" }),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  code: z.optional(z.string()),
});

export const SocialLoginSchema = z.object({
  access_token: z.string().min(1, "Access token is required"),
  provider: z.literal('google', { message: "Provider is required" }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Minimum 6 characters required"),
  confirmPassword: z.string().min(6, "Minimum 6 characters required"),
});

// HR
export const InviteHrEmailSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Email not valid" })
});

// export const VerifyHrEmailSchema = z.object({
//   token: z.string().min(1, "Token is required"),
// });

export type TSignup = z.infer<typeof SignupSchema>;
export type TLogin = z.infer<typeof LoginSchema>;
export type TSocialLogin = z.infer<typeof SocialLoginSchema>;
export type TInviteHrEmail = z.infer<typeof InviteHrEmailSchema>;
