/**
 * Validated clinical screening logic (PHQ-9, GAD-7, CAGE).
 *
 * Pure, deterministic scoring — no ML, no external calls. Shared so the API
 * computes authoritative scores and the web app can render previews identically.
 * Thresholds follow the standard instruments and SDLC §12.1.
 */

import { RiskLevel, TherapySpecialty } from './enums';

export const PHQ9_ITEM_COUNT = 9;
export const GAD7_ITEM_COUNT = 7;
export const CAGE_ITEM_COUNT = 4;

/** Each PHQ-9 / GAD-7 item is scored 0–3. */
export const SCREENING_ITEM_MAX = 3;
export const PHQ9_MAX = PHQ9_ITEM_COUNT * SCREENING_ITEM_MAX; // 27
export const GAD7_MAX = GAD7_ITEM_COUNT * SCREENING_ITEM_MAX; // 21
/** Each CAGE item is 0 or 1; >= 2 is clinically significant. */
export const CAGE_MAX = CAGE_ITEM_COUNT; // 4
export const CAGE_SIGNIFICANT_THRESHOLD = 2;

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function assertItems(answers: number[], count: number, max: number, label: string): void {
  if (answers.length !== count) {
    throw new RangeError(`${label} expects ${count} answers, received ${answers.length}`);
  }
  for (const a of answers) {
    if (!Number.isInteger(a) || a < 0 || a > max) {
      throw new RangeError(`${label} answers must be integers in [0, ${max}]`);
    }
  }
}

export function scorePhq9(answers: number[]): number {
  assertItems(answers, PHQ9_ITEM_COUNT, SCREENING_ITEM_MAX, 'PHQ-9');
  return sum(answers);
}

export function scoreGad7(answers: number[]): number {
  assertItems(answers, GAD7_ITEM_COUNT, SCREENING_ITEM_MAX, 'GAD-7');
  return sum(answers);
}

export function scoreCage(answers: number[]): number {
  assertItems(answers, CAGE_ITEM_COUNT, 1, 'CAGE');
  return sum(answers);
}

/**
 * PHQ-9 → risk level (SDLC §12.1):
 * 0–4 Minimal · 5–9 Mild · 10–14 Moderate · 15–19 Moderately Severe · 20–27 Severe.
 */
export function phq9RiskLevel(score: number): RiskLevel {
  if (score <= 4) return RiskLevel.MINIMAL;
  if (score <= 9) return RiskLevel.MILD;
  if (score <= 14) return RiskLevel.MODERATE;
  if (score <= 19) return RiskLevel.MODERATELY_SEVERE;
  return RiskLevel.SEVERE;
}

/**
 * PHQ-9 item 9 (self-harm / suicidal ideation). Any non-zero answer is an
 * immediate crisis trigger regardless of total score (§15.1 CRISIS_ALERT).
 */
export const PHQ9_SELF_HARM_ITEM_INDEX = 8;

export function hasSuicidalIdeation(phq9Answers: number[]): boolean {
  const item = phq9Answers[PHQ9_SELF_HARM_ITEM_INDEX];
  return typeof item === 'number' && item > 0;
}

export interface IntakeScoreResult {
  phq9Score: number;
  gad7Score: number;
  cageScore: number;
  riskLevel: RiskLevel;
  crisisFlag: boolean;
}

/**
 * Combined intake evaluation. Crisis flag is raised when PHQ-9 indicates severe
 * risk OR self-harm ideation is present on item 9.
 */
export function evaluateIntake(input: {
  phq9Answers: number[];
  gad7Answers: number[];
  cageAnswers: number[];
}): IntakeScoreResult {
  const phq9Score = scorePhq9(input.phq9Answers);
  const gad7Score = scoreGad7(input.gad7Answers);
  const cageScore = scoreCage(input.cageAnswers);
  const riskLevel = phq9RiskLevel(phq9Score);
  const crisisFlag = riskLevel === RiskLevel.SEVERE || hasSuicidalIdeation(input.phq9Answers);
  return { phq9Score, gad7Score, cageScore, riskLevel, crisisFlag };
}

const CONCERN_KEYWORDS: [string, TherapySpecialty][] = [
  ['relationship', TherapySpecialty.RELATIONSHIPS],
  ['marriage', TherapySpecialty.RELATIONSHIPS],
  ['partner', TherapySpecialty.RELATIONSHIPS],
  ['family', TherapySpecialty.FAMILY],
  ['parent', TherapySpecialty.FAMILY],
  ['grief', TherapySpecialty.GRIEF],
  ['loss', TherapySpecialty.GRIEF],
  ['bereave', TherapySpecialty.GRIEF],
  ['trauma', TherapySpecialty.TRAUMA_PTSD],
  ['ptsd', TherapySpecialty.TRAUMA_PTSD],
  ['abuse', TherapySpecialty.TRAUMA_PTSD],
  ['stress', TherapySpecialty.STRESS_BURNOUT],
  ['burnout', TherapySpecialty.STRESS_BURNOUT],
  ['work', TherapySpecialty.STRESS_BURNOUT],
  ['anxiety', TherapySpecialty.ANXIETY],
  ['worry', TherapySpecialty.ANXIETY],
  ['panic', TherapySpecialty.ANXIETY],
  ['depress', TherapySpecialty.DEPRESSION],
  ['sad', TherapySpecialty.DEPRESSION],
  ['alcohol', TherapySpecialty.ADDICTION],
  ['drug', TherapySpecialty.ADDICTION],
  ['addict', TherapySpecialty.ADDICTION],
  ['teen', TherapySpecialty.YOUTH_ADOLESCENT],
  ['child', TherapySpecialty.YOUTH_ADOLESCENT],
  ['youth', TherapySpecialty.YOUTH_ADOLESCENT],
];

/**
 * Deterministic therapist-specialty recommendation from intake scores plus the
 * patient's free-text primary concern (SDLC §12.1 matching). No ML required.
 */
export function recommendSpecialties(input: {
  phq9Score: number;
  gad7Score: number;
  cageScore: number;
  primaryConcern?: string | null;
}): TherapySpecialty[] {
  const specs = new Set<TherapySpecialty>();
  if (input.phq9Score >= 10) specs.add(TherapySpecialty.DEPRESSION);
  if (input.gad7Score >= 10) specs.add(TherapySpecialty.ANXIETY);
  if (input.cageScore >= CAGE_SIGNIFICANT_THRESHOLD) specs.add(TherapySpecialty.ADDICTION);

  const concern = (input.primaryConcern ?? '').toLowerCase();
  for (const [kw, spec] of CONCERN_KEYWORDS) {
    if (concern.includes(kw)) specs.add(spec);
  }

  if (specs.size === 0) specs.add(TherapySpecialty.GENERAL_COUNSELLING);
  return [...specs];
}
