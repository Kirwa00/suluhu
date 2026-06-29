import { z } from 'zod';
import { SESSION_DURATIONS_MINS } from '../constants';
import { kenyanPhoneSchema, uuidSchema } from './common';

const durationSchema = z.coerce
  .number()
  .int()
  .refine((d) => (SESSION_DURATIONS_MINS as readonly number[]).includes(d), 'Unsupported session length');

/** Query available slots for a therapist over a date range (ISO dates, EAT). */
export const slotQuerySchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    durationMins: durationSchema.default(60),
  })
  .refine((q) => q.from <= q.to, { message: 'Invalid date range', path: ['to'] });
export type SlotQuery = z.infer<typeof slotQuerySchema>;

/** Create an appointment. `therapistId` is the TherapistProfile id from discovery. */
export const createAppointmentSchema = z.object({
  therapistId: uuidSchema,
  scheduledAt: z.string().datetime({ message: 'Invalid start time' }),
  durationMins: durationSchema,
  // Phone to receive the M-Pesa STK prompt; defaults to the account phone.
  payerPhone: kenyanPhoneSchema.optional(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
