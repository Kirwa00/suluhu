import { z } from 'zod';
import { Gender } from '../enums';
import { KENYA_COUNTIES } from '../constants';
import { localeSchema } from './common';

/** Profile fields a user may update about themselves. */
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  locale: localeSchema.optional(),
  county: z
    .string()
    .trim()
    .refine((v) => (KENYA_COUNTIES as readonly string[]).includes(v), 'Select a valid county')
    .optional(),
  gender: z.nativeEnum(Gender).optional(),
  // ISO date (YYYY-MM-DD); stored encrypted as PHI.
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
    .optional(),
  bio: z.string().trim().max(2000).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
