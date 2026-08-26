import { RiskLevel } from '@suluhu/shared';
import { MockAiSummaryProvider, type AiSummaryRequest } from './ai-summary.provider';

const BASE: AiSummaryRequest = {
  riskLevel: RiskLevel.MINIMAL,
  phq9Score: 3,
  gad7Score: 2,
  cageScore: 0,
  crisisFlag: false,
  primaryConcern: null,
};

const provider = new MockAiSummaryProvider();

describe('MockAiSummaryProvider', () => {
  it('reports mock mode', () => {
    expect(provider.mode).toBe('mock');
  });

  it('opens with an appreciative line and is deterministic', async () => {
    const first = await provider.summarize(BASE);
    expect(first.startsWith('Thank you for taking the time to check in with yourself today.')).toBe(
      true,
    );
    expect(await provider.summarize(BASE)).toBe(first);
  });

  it.each(Object.values(RiskLevel))(
    'produces a non-empty summary for %s risk',
    async (riskLevel) => {
      const summary = await provider.summarize({ ...BASE, riskLevel });
      expect(summary.length).toBeGreaterThan(80);
      expect(summary).not.toContain('undefined');
    },
  );

  it('never diagnoses, even at severe risk', async () => {
    const summary = await provider.summarize({
      ...BASE,
      riskLevel: RiskLevel.SEVERE,
      phq9Score: 22,
    });
    expect(summary.toLowerCase()).not.toMatch(/diagnos|disorder/);
  });

  it('acknowledges clinically significant anxiety at GAD-7 >= 10', async () => {
    expect(await provider.summarize({ ...BASE, gad7Score: 10 })).toContain(
      'anxiety has been present',
    );
    expect(await provider.summarize({ ...BASE, gad7Score: 9 })).not.toContain(
      'anxiety has been present',
    );
  });

  it('raises alcohol use without judgement at CAGE >= 2', async () => {
    expect(await provider.summarize({ ...BASE, cageScore: 2 })).toContain('without judgement');
    expect(await provider.summarize({ ...BASE, cageScore: 1 })).not.toContain('without judgement');
  });

  it('acknowledges a shared concern without repeating it back', async () => {
    const summary = await provider.summarize({
      ...BASE,
      primaryConcern: 'grief after a bereavement',
    });
    expect(summary).toContain('You told us a little about what');
    expect(summary).not.toContain('bereavement');
  });

  it('reassures instead of recommending therapists when a crisis is flagged', async () => {
    const crisis = await provider.summarize({ ...BASE, crisisFlag: true });
    expect(crisis).toContain('you are not alone');
    expect(crisis).not.toContain('suggested a few therapists');
    expect(await provider.summarize(BASE)).toContain('suggested a few therapists');
  });
});
