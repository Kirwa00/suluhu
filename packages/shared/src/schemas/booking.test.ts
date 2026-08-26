import { describe, expect, it } from 'vitest';
import { SESSION_DURATIONS_MINS } from '../constants';
import { cancelAppointmentSchema, createAppointmentSchema, slotQuerySchema } from './booking';

const THERAPIST_ID = '3f6a1b6e-9c2f-4c5e-8f1a-0b2d3c4e5f60';

describe('slotQuerySchema', () => {
  it('defaults the duration to 60 minutes', () => {
    expect(slotQuerySchema.parse({ from: '2031-06-10', to: '2031-06-17' })).toEqual({
      from: '2031-06-10',
      to: '2031-06-17',
      durationMins: 60,
    });
  });

  it('coerces the duration from a query string', () => {
    expect(
      slotQuerySchema.parse({ from: '2031-06-10', to: '2031-06-10', durationMins: '45' })
        .durationMins,
    ).toBe(45);
  });

  it('accepts a single-day range', () => {
    expect(slotQuerySchema.safeParse({ from: '2031-06-10', to: '2031-06-10' }).success).toBe(true);
  });

  it('rejects an inverted date range on the `to` field', () => {
    const result = slotQuerySchema.safeParse({ from: '2031-06-17', to: '2031-06-10' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['to']);
      expect(result.error.issues[0]?.message).toBe('Invalid date range');
    }
  });

  it.each([
    [{ from: '10-06-2031', to: '2031-06-17' }, 'non-ISO from'],
    [{ from: '2031-06-10', to: '2031/06/17' }, 'non-ISO to'],
    [{ from: '2031-06-10', to: '2031-06-17', durationMins: 25 }, 'unsupported duration'],
  ])('rejects %o (%s)', (input) => {
    expect(slotQuerySchema.safeParse(input).success).toBe(false);
  });
});

describe('createAppointmentSchema', () => {
  const base = {
    therapistId: THERAPIST_ID,
    scheduledAt: '2031-06-10T06:00:00.000Z',
    durationMins: 60,
  };

  it('accepts every supported session length', () => {
    for (const durationMins of SESSION_DURATIONS_MINS) {
      expect(createAppointmentSchema.parse({ ...base, durationMins }).durationMins).toBe(
        durationMins,
      );
    }
  });

  it('normalizes an optional payer phone', () => {
    expect(createAppointmentSchema.parse({ ...base, payerPhone: '0712345678' }).payerPhone).toBe(
      '+254712345678',
    );
  });

  it('leaves the payer phone undefined when omitted (defaults to the account phone)', () => {
    expect(createAppointmentSchema.parse(base).payerPhone).toBeUndefined();
  });

  it.each([
    [{ therapistId: 'not-a-uuid' }, 'non-uuid therapist'],
    [{ scheduledAt: '2031-06-10 06:00' }, 'non-ISO start time'],
    [{ durationMins: 15 }, 'unsupported duration'],
    [{ payerPhone: '0812345678' }, 'invalid payer phone'],
  ])('rejects %o (%s)', (overrides) => {
    expect(createAppointmentSchema.safeParse({ ...base, ...overrides }).success).toBe(false);
  });
});

describe('cancelAppointmentSchema', () => {
  it('allows an empty body', () => {
    expect(cancelAppointmentSchema.parse({})).toEqual({});
  });

  it('trims the reason', () => {
    expect(cancelAppointmentSchema.parse({ reason: '  travelling  ' }).reason).toBe('travelling');
  });

  it('rejects a reason over 500 characters', () => {
    expect(cancelAppointmentSchema.safeParse({ reason: 'x'.repeat(501) }).success).toBe(false);
  });
});
