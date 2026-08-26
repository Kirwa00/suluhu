import { describe, expect, it, vi } from 'vitest';
import {
  DAY_NAMES,
  addDaysISO,
  dayName,
  formatDate,
  formatDateTimeEAT,
  formatKsh,
  formatTimeEAT,
  humanizeEnum,
  todayEAT,
} from './format';

describe('humanizeEnum', () => {
  it.each([
    ['MODERATELY_SEVERE', 'Moderately Severe'],
    ['PENDING', 'Pending'],
    ['THERAPIST', 'Therapist'],
    ['', ''],
  ])('renders %s as %s', (input, expected) => {
    expect(humanizeEnum(input)).toBe(expected);
  });
});

describe('dayName', () => {
  it('maps 0-6 onto Sunday-Saturday', () => {
    expect(DAY_NAMES.map((_, index) => dayName(index))).toEqual(DAY_NAMES);
  });

  it('falls back for an out-of-range day', () => {
    expect(dayName(7)).toBe('Day 7');
    expect(dayName(-1)).toBe('Day -1');
  });
});

describe('formatKsh', () => {
  it('formats an amount with thousands separators', () => {
    expect(formatKsh(2500)).toBe('KES 2,500');
    expect(formatKsh(0)).toBe('KES 0');
  });

  it.each([null, undefined])('renders an em dash for %p', (amount) => {
    expect(formatKsh(amount)).toBe('—');
  });
});

describe('formatDate', () => {
  it('formats an ISO timestamp as a short date', () => {
    expect(formatDate('2031-06-10T09:00:00.000Z')).toContain('2031');
  });

  it.each([null, undefined, ''])('renders an em dash for %p', (iso) => {
    expect(formatDate(iso)).toBe('—');
  });
});

describe('East Africa Time formatting', () => {
  it('renders a UTC instant in EAT (UTC+3)', () => {
    expect(formatTimeEAT('2031-06-10T06:00:00.000Z')).toContain('09:00');
  });

  it('includes the weekday and the EAT time in the combined format', () => {
    const formatted = formatDateTimeEAT('2031-06-10T06:00:00.000Z');
    expect(formatted).toContain('Tue');
    expect(formatted).toContain('09:00');
  });
});

describe('todayEAT', () => {
  it('returns the EAT calendar date, which can be ahead of the UTC date', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2031-06-10T22:30:00.000Z'));
      expect(todayEAT()).toBe('2031-06-11');
      vi.setSystemTime(new Date('2031-06-10T12:00:00.000Z'));
      expect(todayEAT()).toBe('2031-06-10');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('addDaysISO', () => {
  it.each([
    ['2031-06-10', 1, '2031-06-11'],
    ['2031-06-10', 0, '2031-06-10'],
    ['2031-06-10', -1, '2031-06-09'],
    ['2031-06-30', 1, '2031-07-01'],
    ['2031-12-31', 1, '2032-01-01'],
    ['2032-02-28', 1, '2032-02-29'],
  ])('adds %i day(s) to %s', (date, days, expected) => {
    expect(addDaysISO(date, days)).toBe(expected);
  });
});
