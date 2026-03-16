import { z, ZodError } from "zod";

// ─── Shared helper ────────────────────────────────────────────────────────────

export function parseZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  const issues = error.issues ?? (error as any).errors ?? [];
  issues.forEach((err: any) => {
    const key = err.path.join(".");
    if (key && !errors[key]) {
      errors[key] = err.message;
    }
  });
  return errors;
}

// ─── Mobile schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters"),
    email: z
      .string()
      .email("Please enter a valid email")
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const intentionSchema = z.object({
  activityType: z
    .string({ required_error: "Please select an activity" })
    .min(1, "Please select an activity"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const groupSpendingAmountSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be greater than 0",
    ),
});
