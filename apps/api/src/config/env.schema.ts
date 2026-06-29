import { z } from 'zod';

/**
 * Runtime environment validation. The app refuses to boot with an invalid or
 * incomplete configuration — fail fast rather than mis-serve PHI.
 */

const providerMode = z.enum(['mock', 'live']);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  TZ: z.string().default('Africa/Nairobi'),

  API_PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  PHI_ENCRYPTION_KEY: z
    .string()
    .min(1, 'PHI_ENCRYPTION_KEY is required')
    .refine((v) => Buffer.from(v, 'base64').length === 32, {
      message: 'PHI_ENCRYPTION_KEY must be a base64-encoded 32-byte key',
    }),

  PROVIDER_MODE: providerMode.default('mock'),
  MPESA_MODE: providerMode.default('mock'),
  VIDEO_MODE: providerMode.default('mock'),
  AI_MODE: providerMode.default('mock'),
  SMS_MODE: providerMode.default('mock'),
  EMAIL_MODE: providerMode.default('mock'),

  BEFRIENDERS_KENYA_HOTLINE: z.string().default('0800723253'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
