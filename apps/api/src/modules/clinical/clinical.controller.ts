import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  aiDraftRequestSchema,
  soapNoteSchema,
  treatmentPlanSchema,
  uuidSchema,
  type AiDraftRequest,
  type AuthUser,
  type SoapNoteInput,
  type TreatmentPlanInput,
} from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClinicalNotesService } from './clinical-notes.service';
import { TreatmentPlansService } from './treatment-plans.service';
import { HealthRecordService } from './health-record.service';

@ApiTags('Clinical')
@Controller()
export class ClinicalController {
  constructor(
    private readonly notes: ClinicalNotesService,
    private readonly plans: TreatmentPlansService,
    private readonly records: HealthRecordService,
  ) {}

  // --- SOAP notes (therapist authors) ---
  @Roles(UserRole.THERAPIST)
  @Post('clinical-notes')
  @ApiOperation({ summary: 'Create/update a SOAP note draft or finalize it' })
  upsertNote(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(soapNoteSchema)) dto: SoapNoteInput,
    @Req() req: Request,
  ) {
    return this.notes.upsert(userId, dto, buildRequestContext(req));
  }

  @Roles(UserRole.THERAPIST)
  @Post('clinical-notes/ai-draft')
  @ApiOperation({ summary: 'Generate an AI SOAP draft (review required)' })
  aiDraft(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(aiDraftRequestSchema)) dto: AiDraftRequest,
  ) {
    return this.notes.draftAi(userId, dto);
  }

  @Get('clinical-notes/appointment/:appointmentId')
  @ApiOperation({ summary: 'Get the SOAP note for an appointment' })
  noteByAppointment(
    @Param('appointmentId', new ZodValidationPipe(uuidSchema)) appointmentId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.notes.getByAppointment(appointmentId, user, buildRequestContext(req));
  }

  // --- Treatment plans ---
  @Roles(UserRole.THERAPIST)
  @Post('treatment-plans')
  @ApiOperation({ summary: 'Create/update a treatment plan' })
  upsertPlan(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(treatmentPlanSchema)) dto: TreatmentPlanInput,
    @Req() req: Request,
  ) {
    return this.plans.upsert(userId, dto, buildRequestContext(req));
  }

  // --- Patient record (ABAC) ---
  @Get('patients/:patientId/notes')
  @ApiOperation({ summary: 'List a patient’s clinical notes' })
  patientNotes(
    @Param('patientId', new ZodValidationPipe(uuidSchema)) patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notes.listForPatient(patientId, user);
  }

  @Get('patients/:patientId/treatment-plan')
  @ApiOperation({ summary: 'Get a patient’s treatment plan' })
  patientPlan(
    @Param('patientId', new ZodValidationPipe(uuidSchema)) patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.plans.getForPatient(patientId, user);
  }

  @Get('patients/:patientId/health-record')
  @ApiOperation({ summary: 'Aggregated patient health record' })
  healthRecord(
    @Param('patientId', new ZodValidationPipe(uuidSchema)) patientId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.records.getRecord(patientId, user, buildRequestContext(req));
  }

  // --- Therapist caseload ---
  @Roles(UserRole.THERAPIST)
  @Get('clinical/clients')
  @ApiOperation({ summary: 'List the therapist’s patients' })
  clients(@CurrentUser('id') userId: string) {
    return this.records.listClients(userId);
  }
}
