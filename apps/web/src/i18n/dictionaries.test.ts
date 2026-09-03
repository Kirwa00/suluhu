import { describe, expect, it } from 'vitest';
import { dictionaries, getDictionary, translate } from './dictionaries';

const PLACEHOLDER_RE = /\{(\w+)\}/g;

function placeholders(message: string): string[] {
  return [...message.matchAll(PLACEHOLDER_RE)]
    .map((m) => m[1])
    .filter((token): token is string => token !== undefined)
    .sort();
}

describe('dictionaries', () => {
  const enKeys = Object.keys(dictionaries.en).sort();
  const swKeys = Object.keys(dictionaries.sw).sort();

  it('has exactly the same key set in en and sw', () => {
    const missingFromSw = enKeys.filter((k) => !swKeys.includes(k));
    const missingFromEn = swKeys.filter((k) => !enKeys.includes(k));
    expect(
      missingFromSw,
      `keys present in en but missing from sw: ${missingFromSw.join(', ')}`,
    ).toEqual([]);
    expect(
      missingFromEn,
      `keys present in sw but missing from en: ${missingFromEn.join(', ')}`,
    ).toEqual([]);
  });

  it('has no empty string values in either locale', () => {
    for (const [locale, dict] of Object.entries(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), `${locale}.${key} is empty`).not.toBe('');
      }
    }
  });

  it('uses the same {placeholder} tokens in en and sw for every key', () => {
    const mismatches: string[] = [];
    for (const key of enKeys) {
      const enValue = dictionaries.en[key as keyof typeof dictionaries.en];
      const swValue = dictionaries.sw[key as keyof typeof dictionaries.sw];
      if (swValue === undefined) continue; // already reported by the key-parity test
      const enTokens = placeholders(enValue);
      const swTokens = placeholders(swValue);
      if (JSON.stringify(enTokens) !== JSON.stringify(swTokens)) {
        mismatches.push(`${key}: en=[${enTokens}] sw=[${swTokens}]`);
      }
    }
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });

  it('getDictionary falls back to en for an unknown locale', () => {
    // @ts-expect-error deliberately passing an invalid locale to exercise the fallback
    expect(getDictionary('fr')).toBe(dictionaries.en);
  });

  it('getDictionary resolves en and sw to their own tables', () => {
    expect(getDictionary('en')).toBe(dictionaries.en);
    expect(getDictionary('sw')).toBe(dictionaries.sw);
  });
});

describe('translate', () => {
  it('returns the plain message when there are no placeholders', () => {
    expect(translate('en', 'common.cancel')).toBe('Cancel');
    expect(translate('sw', 'common.cancel')).toBe('Ghairi');
  });

  it('substitutes a single {token} placeholder', () => {
    expect(translate('en', 'dashboard.patient.welcome', { name: 'Amina' })).toBe('Welcome, Amina');
    expect(translate('sw', 'dashboard.patient.welcome', { name: 'Amina' })).toBe('Karibu, Amina');
  });

  it('substitutes multiple {token} placeholders', () => {
    expect(translate('en', 'audit.pagination', { page: 2, totalPages: 5, totalItems: 41 })).toBe(
      'Page 2 of 5 · 41 entries',
    );
  });

  it('leaves an unmatched {token} placeholder untouched', () => {
    expect(translate('en', 'dashboard.patient.welcome', {})).toBe('Welcome, {name}');
    expect(translate('en', 'dashboard.patient.welcome')).toBe('Welcome, {name}');
  });

  it('falls back to the English string for a locale missing the key, then the raw key', () => {
    // @ts-expect-error deliberately probing an unsupported locale at the type level
    expect(translate('fr', 'common.cancel')).toBe('Cancel');
  });
});
