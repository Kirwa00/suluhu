import { z } from 'zod';
import { localeSchema, uuidSchema } from './common';

export const ContentType = {
  ARTICLE: 'ARTICLE',
  VIDEO: 'VIDEO',
  EXERCISE: 'EXERCISE',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];
export const CONTENT_TYPES = Object.values(ContentType);

/** Secure messaging. */
export const startConversationSchema = z.object({
  counterpartId: uuidSchema,
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(5000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** Mood journal. */
export const MOOD_TAGS = [
  'calm',
  'anxious',
  'hopeful',
  'sad',
  'angry',
  'tired',
  'grateful',
  'overwhelmed',
  'lonely',
  'motivated',
] as const;

export const moodEntrySchema = z.object({
  moodScore: z.coerce.number().int().min(1, 'Pick 1–10').max(10),
  note: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  loggedAt: z.string().datetime().optional(),
});
export type MoodEntryInput = z.infer<typeof moodEntrySchema>;

/** Psychoeducation content (admin authoring). */
export const contentResourceSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a url-friendly slug (lowercase, hyphens)'),
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20).max(20000),
  category: z.string().trim().min(2).max(60),
  type: z.nativeEnum(ContentType).default(ContentType.ARTICLE),
  language: localeSchema,
  published: z.boolean().default(false),
});
export type ContentResourceInput = z.infer<typeof contentResourceSchema>;
