import { describe, expect, it } from 'vitest';
import { RiskLevel } from './enums';
import { TherapySpecialty } from './enums';
import {
  evaluateIntake,
  hasSuicidalIdeation,
  phq9RiskLevel,
  recommendSpecialties,
  scoreCage,
  scoreGad7,
  scorePhq9,
} from './clinical';

describe('PHQ-9 scoring', () => {
  it('sums nine 0–3 items', () => {
    expect(scorePhq9([0, 1, 2, 3, 0, 1, 2, 3, 0])).toBe(12);
  });

  it('rejects the wrong number of items', () => {
    expect(() => scorePhq9([0, 1, 2])).toThrow(RangeError);
  });

  it('rejects out-of-range answers', () => {
    expect(() => scorePhq9([0, 1, 2, 3, 0, 1, 2, 3, 4])).toThrow(RangeError);
  });

  it.each([
    [0, RiskLevel.MINIMAL],
    [4, RiskLevel.MINIMAL],
    [5, RiskLevel.MILD],
    [9, RiskLevel.MILD],
    [10, RiskLevel.MODERATE],
    [14, RiskLevel.MODERATE],
    [15, RiskLevel.MODERATELY_SEVERE],
    [19, RiskLevel.MODERATELY_SEVERE],
    [20, RiskLevel.SEVERE],
    [27, RiskLevel.SEVERE],
  ])('maps score %i to %s', (score, level) => {
    expect(phq9RiskLevel(score)).toBe(level);
  });
});

describe('GAD-7 and CAGE scoring', () => {
  it('sums seven GAD-7 items', () => {
    expect(scoreGad7([1, 1, 1, 1, 1, 1, 1])).toBe(7);
  });

  it('sums four binary CAGE items', () => {
    expect(scoreCage([1, 0, 1, 1])).toBe(3);
    expect(() => scoreCage([2, 0, 0, 0])).toThrow(RangeError);
  });
});

describe('crisis detection', () => {
  it('flags any non-zero self-harm item (PHQ-9 item 9)', () => {
    expect(hasSuicidalIdeation([0, 0, 0, 0, 0, 0, 0, 0, 1])).toBe(true);
    expect(hasSuicidalIdeation([3, 3, 3, 3, 0, 0, 0, 0, 0])).toBe(false);
  });

  it('raises crisis flag on severe score even without item-9 ideation', () => {
    const result = evaluateIntake({
      phq9Answers: [3, 3, 3, 3, 3, 3, 2, 0, 0],
      gad7Answers: [3, 3, 3, 3, 3, 3, 2],
      cageAnswers: [1, 1, 0, 0],
    });
    expect(result.phq9Score).toBe(20);
    expect(result.riskLevel).toBe(RiskLevel.SEVERE);
    expect(result.crisisFlag).toBe(true);
  });

  it('raises crisis flag on item-9 ideation even when total is mild', () => {
    const result = evaluateIntake({
      phq9Answers: [1, 1, 1, 0, 0, 0, 0, 0, 2],
      gad7Answers: [0, 0, 0, 0, 0, 0, 0],
      cageAnswers: [0, 0, 0, 0],
    });
    expect(result.riskLevel).toBe(RiskLevel.MILD);
    expect(result.crisisFlag).toBe(true);
  });
});

describe('therapist specialty matching', () => {
  it('maps high scores to clinical specialties', () => {
    const specs = recommendSpecialties({ phq9Score: 12, gad7Score: 11, cageScore: 2 });
    expect(specs).toEqual(
      expect.arrayContaining([
        TherapySpecialty.DEPRESSION,
        TherapySpecialty.ANXIETY,
        TherapySpecialty.ADDICTION,
      ]),
    );
  });

  it('adds specialties from the free-text concern', () => {
    const specs = recommendSpecialties({
      phq9Score: 2,
      gad7Score: 1,
      cageScore: 0,
      primaryConcern: 'Struggling with grief after losing my father',
    });
    expect(specs).toContain(TherapySpecialty.GRIEF);
  });

  it('falls back to general counselling when nothing matches', () => {
    const specs = recommendSpecialties({ phq9Score: 1, gad7Score: 1, cageScore: 0 });
    expect(specs).toEqual([TherapySpecialty.GENERAL_COUNSELLING]);
  });
});
