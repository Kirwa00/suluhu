import { validateEnv } from './env.schema';

const BASE = {
  DATABASE_URL: 'postgresql://suluhu:pw@localhost:5432/suluhu?schema=public',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  PHI_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
};

describe('validateEnv', () => {
  it('accepts the minimum configuration and defaults every provider to mock', () => {
    const env = validateEnv({ ...BASE });
    expect(env.PROVIDER_MODE).toBe('mock');
    expect(env.VIDEO_MODE).toBe('mock');
    expect(env.API_PORT).toBe(4000);
  });

  it('ignores blank live-only credentials instead of failing validation', () => {
    const env = validateEnv({
      ...BASE,
      PAYHERO_API_USERNAME: '',
      PAYHERO_CHANNEL_ID: '',
      DAILY_API_KEY: '',
    });
    expect(env.PAYHERO_CHANNEL_ID).toBeUndefined();
    expect(env.DAILY_API_KEY).toBeUndefined();
  });

  it('falls back to a field default when the variable is blank', () => {
    const env = validateEnv({ ...BASE, PAYHERO_BASE_URL: '', API_PORT: '' });
    expect(env.PAYHERO_BASE_URL).toBe('https://backend.payhero.co.ke');
    expect(env.API_PORT).toBe(4000);
  });

  it('reports every invalid field', () => {
    expect(() => validateEnv({ ...BASE, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET must be at least 32 chars/,
    );
    expect(() => validateEnv({ ...BASE, PHI_ENCRYPTION_KEY: 'nope' })).toThrow(
      /base64-encoded 32-byte key/,
    );
  });

  it('requires the PayHero credentials when MPESA_MODE=live', () => {
    expect(() => validateEnv({ ...BASE, MPESA_MODE: 'live' })).toThrow(
      /MPESA_MODE=live requires: MPESA_CALLBACK_URL, PAYHERO_API_USERNAME, PAYHERO_API_PASSWORD, PAYHERO_CHANNEL_ID/,
    );
  });

  it('requires the Daily credentials when VIDEO_MODE=live', () => {
    expect(() => validateEnv({ ...BASE, VIDEO_MODE: 'live', DAILY_DOMAIN: '' })).toThrow(
      /VIDEO_MODE=live requires: DAILY_API_KEY, DAILY_DOMAIN/,
    );
    expect(
      validateEnv({ ...BASE, VIDEO_MODE: 'live', DAILY_API_KEY: 'k', DAILY_DOMAIN: 'suluhu' })
        .DAILY_DOMAIN,
    ).toBe('suluhu');
  });

  it("requires the Africa's Talking credentials when SMS_MODE=live", () => {
    expect(() => validateEnv({ ...BASE, SMS_MODE: 'live' })).toThrow(
      /SMS_MODE=live requires: AT_USERNAME, AT_API_KEY/,
    );
    expect(
      validateEnv({ ...BASE, SMS_MODE: 'live', AT_USERNAME: 'sandbox', AT_API_KEY: 'k' })
        .AT_USERNAME,
    ).toBe('sandbox');
  });

  it('requires SMTP credentials when EMAIL_MODE=live', () => {
    expect(() =>
      validateEnv({ ...BASE, EMAIL_MODE: 'live', SMTP_HOST: 'smtp.example.com' }),
    ).toThrow(/EMAIL_MODE=live requires: SMTP_USER, SMTP_PASSWORD/);
    expect(
      validateEnv({
        ...BASE,
        EMAIL_MODE: 'live',
        SMTP_HOST: 'smtp.example.com',
        SMTP_USER: 'apikey',
        SMTP_PASSWORD: 'secret',
      }).SMTP_HOST,
    ).toBe('smtp.example.com');
  });
});
