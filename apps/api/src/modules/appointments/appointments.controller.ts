import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  cancelAppointmentSchema,
  createAppointmentSchema,
  uuidSchema,
  type AuthUser,
  type CancelAppointmentInput,
  type CreateAppointmentInput,
} from '@suluhu/shared';
import { z } from 'zod';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppointmentsService } from './appointments.service';

const scopeSchema = z.object({
  scope: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
});

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Roles(UserRole.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Book an appointment (initiates payment unless free)' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createAppointmentSchema)) dto: CreateAppointmentInput,
    @Req() req: Request,
  ) {
    return this.appointments.create(userId, dto, buildRequestContext(req));
  }

  @Get()
  @ApiOperation({ summary: 'List my appointments' })
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(scopeSchema)) query: z.infer<typeof scopeSchema>,
  ) {
    return this.appointments.list(user.id, user.role, query.scope);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Appointment detail' })
  getOne(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.appointments.getOne(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  cancel(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(cancelAppointmentSchema)) dto: CancelAppointmentInput,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    return this.appointments.cancel(id, userId, dto.reason, buildRequestContext(req));
  }
}
