import { z } from 'zod';

/**
 * Kenyan phone number in E.164 (+254…) form. Accepts common local inputs
 * (07…, 7…, 254…, +254…) and normalizes to +254XXXXXXXXX.
 */
export const kenyanPhoneSchema = z
  .string()
  .trim()
  .transform((raw) => raw.replace(/[\s-]/g, ''))
  .refine((v) => /^(?:\+?254|0)?7\d{8}$/.test(v) || /^(?:\+?254|0)?1\d{8}$/.test(v), {
    message: 'Enter a valid Kenyan phone number',
  })
  .transform((v) => {
    const digits = v.replace(/^\+/, '');
    if (digits.startsWith('254')) return `+${digits}`;
    if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
    return `+254${digits}`;
  });

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

/**
 * Password policy: min 8 chars, upper, lower, digit. (SDLC §7 best practice.)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number');

export const localeSchema = z.enum(['en', 'sw']).default('en');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const uuidSchema = z.string().uuid('Invalid identifier');
