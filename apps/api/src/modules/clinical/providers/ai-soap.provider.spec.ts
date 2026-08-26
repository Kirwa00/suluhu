import { MockAiSoapProvider, type SoapDraftContext } from './ai-soap.provider';

const BASE: SoapDraftContext = {
  patientFirstName: 'Asha',
  primaryConcern: 'low mood and poor sleep',
  phq9Score: 14,
  gad7Score: 11,
  durationMins: 50,
};

const provider = new MockAiSoapProvider();

describe('MockAiSoapProvider', () => {
  it('reports mock mode', () => {
    expect(provider.mode).toBe('mock');
  });

  it('drafts every SOAP section with confirmation placeholders', async () => {
    const draft = await provider.draft(BASE);
    for (const section of [
      draft.subjective,
      draft.objective,
      draft.assessment,
      draft.plan,
      draft.riskAssessment,
    ]) {
      expect(section).toContain('[THERAPIST TO CONFIRM');
    }
    expect(draft.subjective).toContain('Asha');
    expect(draft.subjective).toContain('50-minute session');
    expect(draft.subjective).toContain('low mood and poor sleep');
    expect(draft.nextSessionGoals).toHaveLength(2);
    expect(draft.nextSessionGoals[1]).toContain('[THERAPIST TO CONFIRM');
  });

  it('includes both intake scores when present', async () => {
    const { objective } = await provider.draft(BASE);
    expect(objective).toContain('Intake PHQ-9 was 14');
    expect(objective).toContain('GAD-7 11.');
  });

  it('closes the objective sentence when scores are missing', async () => {
    const { objective } = await provider.draft({ ...BASE, phq9Score: null, gad7Score: null });
    expect(objective).not.toContain('PHQ-9');
    expect(objective).not.toContain('GAD-7');
    expect(objective.trimEnd().endsWith('.')).toBe(true);
    expect(objective).not.toContain('null');
  });

  it('keeps a zero score rather than treating it as missing', async () => {
    const { objective } = await provider.draft({ ...BASE, phq9Score: 0, gad7Score: 0 });
    expect(objective).toContain('Intake PHQ-9 was 0');
    expect(objective).toContain('GAD-7 0.');
  });

  it('defaults the modality to CBT and honours an override', async () => {
    const cbt = await provider.draft(BASE);
    expect(cbt.assessment).toContain('CBT framework');
    expect(cbt.plan).toContain('Continue CBT-informed sessions');

    const dbt = await provider.draft({ ...BASE, therapistModality: 'DBT' });
    expect(dbt.assessment).toContain('DBT framework');
    expect(dbt.plan).toContain('Continue DBT-informed sessions');
  });

  it.each([null, undefined, '   '])('falls back to a neutral concern for %p', async (concern) => {
    const { subjective } = await provider.draft({ ...BASE, primaryConcern: concern });
    expect(subjective).toContain('presenting concerns discussed in session');
  });
});
