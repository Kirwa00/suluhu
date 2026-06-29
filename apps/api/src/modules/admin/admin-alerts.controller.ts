import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, paginationQuerySchema, uuidSchema } from '@suluhu/shared';
import { ClinicalAlertStatus } from '@prisma/client';
import { z } from 'zod';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminAlertsService } from './admin-alerts.service';

const listQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ClinicalAlertStatus).optional(),
});
const resolveSchema = z.object({ note: z.string().trim().max(1000).optional() });

@ApiTags('Admin · Clinical Alerts')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/clinical-alerts')
export class AdminAlertsController {
  constructor(private readonly alerts: AdminAlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List clinical alerts (default: open)' })
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: z.infer<typeof listQuerySchema>) {
    return this.alerts.list(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Count of open alerts' })
  count() {
    return this.alerts.countOpen();
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  acknowledge(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    return this.alerts.acknowledge(adminId, id, buildRequestContext(req));
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  resolve(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(resolveSchema)) dto: z.infer<typeof resolveSchema>,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    return this.alerts.resolve(adminId, id, dto.note, buildRequestContext(req));
  }
}
