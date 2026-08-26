import { describe, expect, it } from 'vitest';
import {
  emailSchema,
  kenyanPhoneSchema,
  localeSchema,
  paginationQuerySchema,
  passwordSchema,
  uuidSchema,
} from './common';

describe('kenyanPhoneSchema', () => {
  it.each([
    ['0712345678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['+254712345678', '+254712345678'],
    ['+254 712 345-678', '+254712345678'],
    ['0110345678', '+254110345678'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(kenyanPhoneSchema.parse(input)).toBe(expected);
  });

  it.each([
    ['0812345678', 'unsupported prefix'],
    ['07123456789', 'too long'],
    ['071234567', 'too short'],
    ['+1650123456', 'non-Kenyan'],
    ['', 'empty'],
  ])('rejects %s (%s)', (input) => {
    expect(kenyanPhoneSchema.safeParse(input).success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('trims and lowercases', () => {
    expect(emailSchema.parse('  Faith.C@Example.COM ')).toBe('faith.c@example.com');
  });

  it('rejects a malformed address', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a valid email address');
    }
  });
});

describe('passwordSchema', () => {
  it('accepts a password meeting the policy', () => {
    expect(passwordSchema.parse('Suluhu2026')).toBe('Suluhu2026');
  });

  it.each([
    ['Short1A', 'too short'],
    ['alllowercase1', 'no uppercase'],
    ['ALLUPPERCASE1', 'no lowercase'],
    ['NoDigitsHere', 'no digit'],
  ])('rejects %s (%s)', (input) => {
    expect(passwordSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a password over 128 characters', () => {
    expect(passwordSchema.safeParse(`Aa1${'x'.repeat(130)}`).success).toBe(false);
  });
});

describe('localeSchema', () => {
  it('defaults to English', () => {
    expect(localeSchema.parse(undefined)).toBe('en');
  });

  it('accepts Swahili', () => {
    expect(localeSchema.parse('sw')).toBe('sw');
  });

  it('rejects an unsupported locale', () => {
    expect(localeSchema.safeParse('fr').success).toBe(false);
  });
});

describe('paginationQuerySchema', () => {
  it('applies defaults', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it('coerces numeric strings from the query string', () => {
    expect(paginationQuerySchema.parse({ page: '3', pageSize: '50' })).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it.each([
    [{ page: 0 }, 'page below 1'],
    [{ pageSize: 101 }, 'pageSize above 100'],
    [{ page: 1.5 }, 'non-integer page'],
  ])('rejects %o (%s)', (input) => {
    expect(paginationQuerySchema.safeParse(input).success).toBe(false);
  });
});

describe('uuidSchema', () => {
  it('accepts a uuid', () => {
    expect(uuidSchema.parse('3f6a1b6e-9c2f-4c5e-8f1a-0b2d3c4e5f60')).toBe(
      '3f6a1b6e-9c2f-4c5e-8f1a-0b2d3c4e5f60',
    );
  });

  it('rejects a non-uuid identifier', () => {
    const result = uuidSchema.safeParse('t1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Invalid identifier');
    }
  });
});
