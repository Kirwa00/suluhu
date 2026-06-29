import { z } from 'zod';
import {
  CAGE_ITEM_COUNT,
  GAD7_ITEM_COUNT,
  PHQ9_ITEM_COUNT,
  SCREENING_ITEM_MAX,
} from './clinical';

/**
 * Validated screening instruments (SDLC §12.1). Question wording follows the
 * standard PHQ-9, GAD-7, and CAGE tools; the conversational framing lives in
 * the UI. Shared so the API and web render and score identically.
 */

/** Frequency options for PHQ-9 / GAD-7 (scored 0–3). */
export const FREQUENCY_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
] as const;

/** Yes/No options for CAGE (scored 0/1). */
export const YES_NO_OPTIONS = [
  { value: 0, label: 'No' },
  { value: 1, label: 'Yes' },
] as const;

export const PHQ9_PREAMBLE =
  'Over the last 2 weeks, how often have you been bothered by any of the following?';
export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
] as const;

export const GAD7_PREAMBLE =
  'Over the last 2 weeks, how often have you been bothered by the following?';
export const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
] as const;

export const CAGE_PREAMBLE = 'Thinking about your use of alcohol:';
export const CAGE_QUESTIONS = [
  'Have you ever felt you should cut down on your drinking?',
  'Have people annoyed you by criticizing your drinking?',
  'Have you ever felt bad or guilty about your drinking?',
  'Have you ever had a drink first thing in the morning (an "eye-opener")?',
] as const;

const phq9Answers = z
  .array(z.number().int().min(0).max(SCREENING_ITEM_MAX))
  .length(PHQ9_ITEM_COUNT, `PHQ-9 needs ${PHQ9_ITEM_COUNT} answers`);
const gad7Answers = z
  .array(z.number().int().min(0).max(SCREENING_ITEM_MAX))
  .length(GAD7_ITEM_COUNT, `GAD-7 needs ${GAD7_ITEM_COUNT} answers`);
const cageAnswers = z
  .array(z.number().int().min(0).max(1))
  .length(CAGE_ITEM_COUNT, `CAGE needs ${CAGE_ITEM_COUNT} answers`);

export const submitIntakeSchema = z.object({
  phq9Answers,
  gad7Answers,
  cageAnswers,
  primaryConcern: z.string().trim().max(500).optional(),
});
export type SubmitIntakeInput = z.infer<typeof submitIntakeSchema>;
