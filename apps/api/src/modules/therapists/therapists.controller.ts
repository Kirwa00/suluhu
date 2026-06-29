import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  setAvailabilitySchema,
  submitCredentialsSchema,
  type SetAvailabilityInput,
  type SubmitCredentialsInput,
} from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { TherapistsService } from './therapists.service';

/** Therapist self-service onboarding (THERAPIST role only). */
@ApiTags('Therapists')
@Roles(UserRole.THERAPIST)
@Controller('therapists/me')
export class TherapistsController {
  constructor(private readonly therapists: TherapistsService) {}

  @Post('credentials')
  @ApiOperation({ summary: 'Submit or update CPB credentials & public profile' })
  submitCredentials(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(submitCredentialsSchema)) dto: SubmitCredentialsInput,
    @Req() req: Request,
  ) {
    return this.therapists.submitCredentials(userId, dto, buildRequestContext(req));
  }

  @Get('onboarding')
  @ApiOperation({ summary: 'Onboarding status & checklist' })
  onboarding(@CurrentUser('id') userId: string) {
    return this.therapists.getOnboardingStatus(userId);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get weekly availability' })
  getAvailability(@CurrentUser('id') userId: string) {
    return this.therapists.getAvailability(userId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Replace weekly availability' })
  setAvailability(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(setAvailabilitySchema)) dto: SetAvailabilityInput,
    @Req() req: Request,
  ) {
    return this.therapists.setAvailability(userId, dto, buildRequestContext(req));
  }
}
