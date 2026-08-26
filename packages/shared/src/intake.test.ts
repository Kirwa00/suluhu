import { describe, expect, it } from 'vitest';
import { CAGE_ITEM_COUNT, GAD7_ITEM_COUNT, PHQ9_ITEM_COUNT, SCREENING_ITEM_MAX } from './clinical';
import {
  CAGE_QUESTIONS,
  FREQUENCY_OPTIONS,
  GAD7_QUESTIONS,
  PHQ9_QUESTIONS,
  YES_NO_OPTIONS,
  submitIntakeSchema,
} from './intake';

const VALID_INTAKE = {
  phq9Answers: [1, 1, 2, 1, 0, 1, 2, 0, 0],
  gad7Answers: [2, 1, 2, 1, 0, 1, 1],
  cageAnswers: [0, 1, 0, 0],
};

describe('screening instruments', () => {
  it('ships one question per scored item', () => {
    expect(PHQ9_QUESTIONS).toHaveLength(PHQ9_ITEM_COUNT);
    expect(GAD7_QUESTIONS).toHaveLength(GAD7_ITEM_COUNT);
    expect(CAGE_QUESTIONS).toHaveLength(CAGE_ITEM_COUNT);
  });

  it('offers answer options covering each item scale', () => {
    expect(FREQUENCY_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3]);
    expect(FREQUENCY_OPTIONS.at(-1)?.value).toBe(SCREENING_ITEM_MAX);
    expect(YES_NO_OPTIONS.map((o) => o.value)).toEqual([0, 1]);
  });
});

describe('submitIntakeSchema', () => {
  it('accepts a complete submission', () => {
    expect(submitIntakeSchema.parse(VALID_INTAKE)).toEqual(VALID_INTAKE);
  });

  it('trims an optional primary concern', () => {
    expect(
      submitIntakeSchema.parse({ ...VALID_INTAKE, primaryConcern: '  work stress  ' })
        .primaryConcern,
    ).toBe('work stress');
  });

  it.each([
    ['phq9Answers', `PHQ-9 needs ${PHQ9_ITEM_COUNT} answers`],
    ['gad7Answers', `GAD-7 needs ${GAD7_ITEM_COUNT} answers`],
    ['cageAnswers', `CAGE needs ${CAGE_ITEM_COUNT} answers`],
  ] as const)('rejects the wrong number of %s', (field, message) => {
    const result = submitIntakeSchema.safeParse({ ...VALID_INTAKE, [field]: [0, 1] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(message);
    }
  });

  it.each([
    [{ phq9Answers: [4, 1, 2, 1, 0, 1, 2, 0, 0] }, 'PHQ-9 answer above the item max'],
    [{ gad7Answers: [-1, 1, 2, 1, 0, 1, 1] }, 'negative GAD-7 answer'],
    [{ gad7Answers: [1.5, 1, 2, 1, 0, 1, 1] }, 'non-integer GAD-7 answer'],
    [{ cageAnswers: [2, 1, 0, 0] }, 'CAGE answer outside 0/1'],
    [{ primaryConcern: 'x'.repeat(501) }, 'primary concern over 500 characters'],
  ])('rejects %o (%s)', (overrides) => {
    expect(submitIntakeSchema.safeParse({ ...VALID_INTAKE, ...overrides }).success).toBe(false);
  });
});
