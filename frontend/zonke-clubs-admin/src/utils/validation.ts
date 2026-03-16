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

// ─── Admin schemas ─────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const adminSignupSchema = z
  .object({
    clubName: z
      .string()
      .min(1, "Club name is required")
      .min(2, "Club name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LocationValue =
  | string
  | { name: string; latitude: number; longitude: number };

const locationField = z.custom<LocationValue>((val) => {
  if (typeof val === "string") return val.length > 0;
  if (val && typeof val === "object") {
    const v = val as {
      name?: unknown;
      latitude?: unknown;
      longitude?: unknown;
    };
    return (
      typeof v.name === "string" &&
      typeof v.latitude === "number" &&
      typeof v.longitude === "number"
    );
  }
  return false;
}, "Location is required");

export const setupStep1Schema = z.object({
  location: locationField,
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
});

export const clubInfoSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  description: z.string().min(1, "Description is required"),
  location: locationField,
  phone: z.string().min(1, "WhatsApp number is required"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email",
    ),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  general_entry_price: z
    .string()
    .min(1, "General entry price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be 0 or more",
    ),
  vip_entry_price: z
    .string()
    .min(1, "VIP entry price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be 0 or more",
    ),
});

export const djSchema = z.object({
  name: z.string().min(1, "DJ name is required"),
});

export const spendingRecordSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be greater than 0",
    ),
  visitDate: z.string().min(1, "Visit date is required"),
});
