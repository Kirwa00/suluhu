import { describe, expect, it } from 'vitest';
import {
  CONTENT_TYPES,
  ContentType,
  MOOD_TAGS,
  contentResourceSchema,
  moodEntrySchema,
  sendMessageSchema,
  startConversationSchema,
} from './engagement';

const COUNTERPART_ID = '3f6a1b6e-9c2f-4c5e-8f1a-0b2d3c4e5f60';

describe('ContentType', () => {
  it('exposes every type as a runtime list', () => {
    expect(CONTENT_TYPES).toEqual([ContentType.ARTICLE, ContentType.VIDEO, ContentType.EXERCISE]);
  });
});

describe('startConversationSchema', () => {
  it('requires a uuid counterpart', () => {
    expect(startConversationSchema.parse({ counterpartId: COUNTERPART_ID }).counterpartId).toBe(
      COUNTERPART_ID,
    );
    expect(startConversationSchema.safeParse({ counterpartId: 'thr1' }).success).toBe(false);
  });
});

describe('sendMessageSchema', () => {
  it('trims the body', () => {
    expect(sendMessageSchema.parse({ body: '  Hello  ' }).body).toBe('Hello');
  });

  it.each([
    [{ body: '   ' }, 'whitespace-only'],
    [{ body: '' }, 'empty'],
    [{ body: 'x'.repeat(5001) }, 'over 5000 characters'],
  ])('rejects %o (%s)', (input) => {
    expect(sendMessageSchema.safeParse(input).success).toBe(false);
  });
});

describe('moodEntrySchema', () => {
  it('defaults tags to empty and coerces the score', () => {
    expect(moodEntrySchema.parse({ moodScore: '7' })).toEqual({ moodScore: 7, tags: [] });
  });

  it('accepts a note, tags, and an explicit timestamp', () => {
    const parsed = moodEntrySchema.parse({
      moodScore: 4,
      note: '  rough day  ',
      tags: [...MOOD_TAGS.slice(0, 3)],
      loggedAt: '2031-06-10T06:00:00.000Z',
    });
    expect(parsed.note).toBe('rough day');
    expect(parsed.tags).toEqual(['calm', 'anxious', 'hopeful']);
  });

  it.each([
    [{ moodScore: 0 }, 'score below 1'],
    [{ moodScore: 11 }, 'score above 10'],
    [{ moodScore: 5, tags: Array(11).fill('calm') }, 'more than 10 tags'],
    [{ moodScore: 5, loggedAt: '2031-06-10' }, 'non-ISO timestamp'],
  ])('rejects %o (%s)', (input) => {
    expect(moodEntrySchema.safeParse(input).success).toBe(false);
  });
});

describe('contentResourceSchema', () => {
  const base = {
    slug: 'managing-panic-attacks',
    title: 'Managing panic attacks',
    summary: 'Practical grounding steps you can use anywhere.',
    body: 'Panic attacks peak quickly and pass. Here is what helps.',
    category: 'Anxiety',
  };

  it('defaults type, language, and published state', () => {
    expect(contentResourceSchema.parse(base)).toEqual({
      ...base,
      type: ContentType.ARTICLE,
      language: 'en',
      published: false,
    });
  });

  it('accepts a published Swahili exercise', () => {
    const parsed = contentResourceSchema.parse({
      ...base,
      type: ContentType.EXERCISE,
      language: 'sw',
      published: true,
    });
    expect(parsed).toMatchObject({ type: ContentType.EXERCISE, language: 'sw', published: true });
  });

  it.each([
    [{ slug: 'Managing Panic' }, 'slug with spaces and capitals'],
    [{ slug: '-leading-hyphen' }, 'slug with a leading hyphen'],
    [{ title: 'Hi' }, 'title too short'],
    [{ summary: 'too short' }, 'summary too short'],
    [{ body: 'too short' }, 'body too short'],
    [{ type: 'PODCAST' }, 'unknown content type'],
    [{ language: 'fr' }, 'unsupported language'],
  ])('rejects %o (%s)', (overrides) => {
    expect(contentResourceSchema.safeParse({ ...base, ...overrides }).success).toBe(false);
  });
});
