import { describe, expect, it } from 'vitest';
import {
  ClinicalNoteStatus,
  TreatmentPlanStatus,
  aiDraftRequestSchema,
  soapNoteSchema,
  treatmentPlanSchema,
} from './clinical-notes';

const APPOINTMENT_ID = '3f6a1b6e-9c2f-4c5e-8f1a-0b2d3c4e5f60';
const PATIENT_ID = '9b1c2d3e-4f50-4a6b-8c7d-1e2f3a4b5c6d';

const COMPLETE_SOAP = {
  appointmentId: APPOINTMENT_ID,
  subjective: 'Client reports improved sleep.',
  objective: 'Bright affect, oriented.',
  assessment: 'Symptoms improving.',
  plan: 'Continue weekly CBT.',
};

describe('soapNoteSchema', () => {
  it('defaults an empty note to a draft with blank sections', () => {
    expect(soapNoteSchema.parse({ appointmentId: APPOINTMENT_ID })).toEqual({
      appointmentId: APPOINTMENT_ID,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      riskAssessment: '',
      status: ClinicalNoteStatus.DRAFT,
    });
  });

  it('allows a partially filled draft', () => {
    expect(
      soapNoteSchema.safeParse({ appointmentId: APPOINTMENT_ID, subjective: 'Only this so far' })
        .success,
    ).toBe(true);
  });

  it('finalizes when all four SOAP sections are present', () => {
    const parsed = soapNoteSchema.parse({
      ...COMPLETE_SOAP,
      status: ClinicalNoteStatus.FINALIZED,
    });
    expect(parsed.status).toBe(ClinicalNoteStatus.FINALIZED);
  });

  it.each(['subjective', 'objective', 'assessment', 'plan'] as const)(
    'refuses to finalize with a blank %s section',
    (field) => {
      const result = soapNoteSchema.safeParse({
        ...COMPLETE_SOAP,
        [field]: '   ',
        status: ClinicalNoteStatus.FINALIZED,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['status']);
        expect(result.error.issues[0]?.message).toBe(
          'All four SOAP sections are required to finalize',
        );
      }
    },
  );

  it.each([
    [{ appointmentId: 'appt1' }, 'non-uuid appointment'],
    [{ subjective: 'x'.repeat(8001) }, 'section over 8000 characters'],
    [{ status: 'SIGNED' }, 'unknown status'],
  ])('rejects %o (%s)', (overrides) => {
    expect(soapNoteSchema.safeParse({ ...COMPLETE_SOAP, ...overrides }).success).toBe(false);
  });
});

describe('aiDraftRequestSchema', () => {
  it('accepts an optional modality hint', () => {
    expect(
      aiDraftRequestSchema.parse({ appointmentId: APPOINTMENT_ID, therapistModality: ' CBT ' }),
    ).toEqual({ appointmentId: APPOINTMENT_ID, therapistModality: 'CBT' });
  });

  it('requires a valid appointment id', () => {
    expect(aiDraftRequestSchema.safeParse({ appointmentId: 'appt1' }).success).toBe(false);
  });
});

describe('treatmentPlanSchema', () => {
  it('defaults interventions to empty and status to ACTIVE', () => {
    expect(
      treatmentPlanSchema.parse({ patientId: PATIENT_ID, goals: ['Reduce panic episodes'] }),
    ).toEqual({
      patientId: PATIENT_ID,
      goals: ['Reduce panic episodes'],
      interventions: [],
      status: TreatmentPlanStatus.ACTIVE,
    });
  });

  it('accepts a full plan under review', () => {
    const parsed = treatmentPlanSchema.parse({
      patientId: PATIENT_ID,
      goals: ['Reduce panic episodes'],
      interventions: ['Weekly exposure practice'],
      reviewDate: '2031-06-10',
      status: TreatmentPlanStatus.COMPLETED,
      summary: 'Goals met.',
    });
    expect(parsed.status).toBe(TreatmentPlanStatus.COMPLETED);
    expect(parsed.reviewDate).toBe('2031-06-10');
  });

  it.each([
    [{ goals: [] }, 'no goals'],
    [{ goals: ['ok', ''] }, 'blank goal'],
    [{ goals: Array(16).fill('goal') }, 'more than 15 goals'],
    [{ reviewDate: '10/06/2031' }, 'non-ISO review date'],
    [{ status: 'PAUSED' }, 'unknown status'],
  ])('rejects %o (%s)', (overrides) => {
    expect(
      treatmentPlanSchema.safeParse({
        patientId: PATIENT_ID,
        goals: ['Reduce panic episodes'],
        ...overrides,
      }).success,
    ).toBe(false);
  });
});
