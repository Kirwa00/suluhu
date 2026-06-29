import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema';

/**
 * Typed, structured access to validated configuration. Modules depend on this
 * rather than reading `process.env` directly.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.get('NODE_ENV');
  }
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get http() {
    return {
      port: this.get('API_PORT'),
      host: this.get('API_HOST'),
      publicUrl: this.get('API_PUBLIC_URL'),
      corsOrigins: this.get('CORS_ORIGINS')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    };
  }

  get database() {
    return { url: this.get('DATABASE_URL') };
  }

  get redis() {
    return { url: this.get('REDIS_URL') };
  }

  get jwt() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      accessTtl: this.get('JWT_ACCESS_TTL'),
      refreshTtl: this.get('JWT_REFRESH_TTL'),
    };
  }

  get security() {
    return {
      saltRounds: this.get('PASSWORD_SALT_ROUNDS'),
      phiEncryptionKey: Buffer.from(this.get('PHI_ENCRYPTION_KEY'), 'base64'),
    };
  }

  get providers() {
    return {
      default: this.get('PROVIDER_MODE'),
      mpesa: this.get('MPESA_MODE'),
      video: this.get('VIDEO_MODE'),
      ai: this.get('AI_MODE'),
      sms: this.get('SMS_MODE'),
      email: this.get('EMAIL_MODE'),
    };
  }

  get crisis() {
    return { befriendersHotline: this.get('BEFRIENDERS_KENYA_HOTLINE') };
  }
}
