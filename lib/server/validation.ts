import { z } from "zod";

export const bookingFormSchema = z.object({
  excursionSlug: z.string().min(1).max(80),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD"),
  people: z.coerce.number().int().min(1).max(20),
  customerName: z.string().min(2).max(120).trim(),
  customerEmail: z.string().email().max(180).toLowerCase().trim(),
  customerPhone: z
    .string()
    .min(6)
    .max(40)
    .regex(/^[+\d\s().-]+$/, "Solo dígitos, espacios, +, ()"),
  customerNotes: z.string().max(800).optional().or(z.literal("")),
  lang: z.enum(["es", "en", "pt-br"]).default("es"),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export const webhookPayloadSchema = z.object({
  type: z.string().optional(),
  action: z.string().optional(),
  data: z.object({ id: z.string().or(z.number()) }).optional(),
});
