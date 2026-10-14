import { z } from "zod";
import { nigerianPhoneSchema } from "./kycValidation";

// The password field has a show/hide toggle, so there's no confirm field.
export const registerSchema = z.object({
  accountType: z.enum(["export_agent", "exporter"], {
    error: "Choose how you'll use Freightafford",
  }),
  fullname: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address, e.g. name@company.com"),
  phoneNumber: nigerianPhoneSchema,
  companyName: z.string().trim().min(2, "Enter your company's name"),
  password: z.string().min(8, "Use at least 8 characters"),
  acceptAgreement: z.boolean().refine((val) => val === true, {
    message: "Accept the Terms & Conditions and Freight Rules to continue",
  }),
});

export const verifyOtpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.email("Enter the email you signed up with"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const profileSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "At least 10 characters"),
  companyName: z.string().min(2, "Company name is required"),
  companyAddress: z.string().min(5, "Company address is required"),
  country: z.string().min(2, "Country is required"),
});

export const userSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValue = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UserFormValues = z.infer<typeof userSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
