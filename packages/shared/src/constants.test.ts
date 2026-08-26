import { describe, expect, it } from 'vitest';
import {
  FREE_SESSION_DURATION_MINS,
  PLATFORM_COMMISSION_DEFAULT,
  PLATFORM_COMMISSION_MAX,
  PLATFORM_COMMISSION_MIN,
  REMINDER_OFFSETS_MINUTES,
  RISK_LEVEL_ACTIONS,
  RiskLevel,
  SESSION_DURATIONS_MINS,
  SESSION_RATE_MAX_KSH,
  SESSION_RATE_MIN_KSH,
} from './index';

describe('session and pricing constants', () => {
  it('offers the free intro session as one of the bookable durations', () => {
    expect(SESSION_DURATIONS_MINS).toContain(FREE_SESSION_DURATION_MINS);
  });

  it('keeps the default commission inside the documented band', () => {
    expect(PLATFORM_COMMISSION_DEFAULT).toBeGreaterThanOrEqual(PLATFORM_COMMISSION_MIN);
    expect(PLATFORM_COMMISSION_DEFAULT).toBeLessThanOrEqual(PLATFORM_COMMISSION_MAX);
  });

  it('keeps the therapist rate band non-empty', () => {
    expect(SESSION_RATE_MIN_KSH).toBeLessThan(SESSION_RATE_MAX_KSH);
  });

  it('orders appointment reminders from furthest out to nearest', () => {
    expect([...REMINDER_OFFSETS_MINUTES]).toEqual(
      [...REMINDER_OFFSETS_MINUTES].sort((a, b) => b - a),
    );
  });
});

describe('RISK_LEVEL_ACTIONS', () => {
  it('maps every risk level to an action', () => {
    expect(Object.keys(RISK_LEVEL_ACTIONS).sort()).toEqual(Object.values(RiskLevel).sort());
  });

  it('escalates monotonically: alerting admins, then showing the crisis hotline', () => {
    const alerting = Object.values(RiskLevel).filter((l) => RISK_LEVEL_ACTIONS[l].adminAlert);
    expect(alerting).toEqual([RiskLevel.MODERATELY_SEVERE, RiskLevel.SEVERE]);

    const hotline = Object.values(RiskLevel).filter((l) => RISK_LEVEL_ACTIONS[l].showCrisisHotline);
    expect(hotline).toEqual([RiskLevel.SEVERE]);
  });

  it('tightens the booking window as risk rises', () => {
    expect(Object.values(RiskLevel).map((l) => RISK_LEVEL_ACTIONS[l].bookingWindow)).toEqual([
      'optional',
      '1-week',
      '48-hours',
      'same-day',
      'same-day',
    ]);
  });
});
