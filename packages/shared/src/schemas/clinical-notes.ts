import { z } from 'zod';
import { uuidSchema } from './common';

export const ClinicalNoteStatus = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
} as const;
export type ClinicalNoteStatus = (typeof ClinicalNoteStatus)[keyof typeof ClinicalNoteStatus];

export const TreatmentPlanStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TreatmentPlanStatus = (typeof TreatmentPlanStatus)[keyof typeof TreatmentPlanStatus];

const noteText = z.string().trim().max(8000);

/**
 * SOAP note (SDLC §5.1, §15.2). Drafts may be partial; finalizing requires the
 * four SOAP sections to be present so the clinical record is complete.
 */
export const soapNoteSchema = z
  .object({
    appointmentId: uuidSchema,
    subjective: noteText.optional().default(''),
    objective: noteText.optional().default(''),
    assessment: noteText.optional().default(''),
    plan: noteText.optional().default(''),
    riskAssessment: noteText.optional().default(''),
    status: z.nativeEnum(ClinicalNoteStatus).default(ClinicalNoteStatus.DRAFT),
  })
  .refine(
    (n) =>
      n.status !== ClinicalNoteStatus.FINALIZED ||
      [n.subjective, n.objective, n.assessment, n.plan].every((f) => f.trim().length > 0),
    { message: 'All four SOAP sections are required to finalize', path: ['status'] },
  );
export type SoapNoteInput = z.infer<typeof soapNoteSchema>;

/** Request an AI-drafted SOAP skeleton for an appointment (§15.2). */
export const aiDraftRequestSchema = z.object({
  appointmentId: uuidSchema,
  therapistModality: z.string().trim().max(80).optional(),
});
export type AiDraftRequest = z.infer<typeof aiDraftRequestSchema>;

export const treatmentPlanSchema = z.object({
  patientId: uuidSchema,
  goals: z.array(z.string().trim().min(1).max(300)).min(1, 'Add at least one goal').max(15),
  interventions: z.array(z.string().trim().min(1).max(300)).max(15).default([]),
  reviewDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
  status: z.nativeEnum(TreatmentPlanStatus).default(TreatmentPlanStatus.ACTIVE),
  summary: z.string().trim().max(4000).optional(),
});
export type TreatmentPlanInput = z.infer<typeof treatmentPlanSchema>;
