import { z } from "zod";

export const guestDiagnosticRequestSchema = z.object({
  attribution: z.unknown().optional(),
  contactConsent: z.literal(true),
  email: z.string().trim().max(160),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9:_-]{16,160}$/),
  message: z.string().trim().max(2_000).optional(),
  phone: z.string().trim().max(60).optional(),
  situation: z.string().trim().max(4_000).optional(),
  website: z.string().max(200).optional(),
}).strict();

export function normalizeGuestDiagnosticPhone(value: string | undefined) {
  const phone = value?.replace(/\s+/g, " ").trim() || null;
  if (!phone) return null;
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? phone : undefined;
}
