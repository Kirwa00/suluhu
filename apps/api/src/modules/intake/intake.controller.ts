import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, submitIntakeSchema, type SubmitIntakeInput } from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { IntakeService } from './intake.service';

@ApiTags('Intake & Triage')
@Roles(UserRole.PATIENT)
@Controller('intake')
export class IntakeController {
  constructor(private readonly intake: IntakeService) {}

  @Post('assessments')
  @ApiOperation({ summary: 'Submit a PHQ-9/GAD-7/CAGE intake; returns risk + matches' })
  submit(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(submitIntakeSchema)) dto: SubmitIntakeInput,
    @Req() req: Request,
  ) {
    return this.intake.submit(userId, dto, buildRequestContext(req));
  }

  @Get('me')
  @ApiOperation({ summary: 'Latest assessment with recommended therapists' })
  latest(@CurrentUser('id') userId: string) {
    return this.intake.getLatest(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Assessment score history (for trends)' })
  history(@CurrentUser('id') userId: string) {
    return this.intake.history(userId);
  }
}
