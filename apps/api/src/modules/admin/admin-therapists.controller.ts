import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  TherapistVerificationStatus,
  UserRole,
  paginationQuerySchema,
  reviewDecisionSchema,
  uuidSchema,
  type ReviewDecisionInput,
} from '@suluhu/shared';
import { z } from 'zod';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminTherapistsService } from './admin-therapists.service';

const listQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(TherapistVerificationStatus).optional(),
});

@ApiTags('Admin · Therapists')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/therapists')
export class AdminTherapistsController {
  constructor(private readonly admin: AdminTherapistsService) {}

  @Get('applications')
  @ApiOperation({ summary: 'List therapist applications (default: in review)' })
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: z.infer<typeof listQuerySchema>) {
    return this.admin.listApplications(query);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Application detail with CPB check & documents' })
  detail(@Param('id', new ZodValidationPipe(uuidSchema)) id: string) {
    return this.admin.getApplication(id);
  }

  @Post('applications/:id/review')
  @ApiOperation({ summary: 'Approve, reject, or suspend an application' })
  review(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(reviewDecisionSchema)) dto: ReviewDecisionInput,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    return this.admin.review(adminId, id, dto, buildRequestContext(req));
  }
}
