import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { uuidSchema, type AuthUser } from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller('appointments/:id/session')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Session access state + short-lived video token' })
  access(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sessions.getAccess(id, user);
  }

  @Post('start')
  @ApiOperation({ summary: 'Therapist starts the session (admits patient)' })
  start(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.sessions.start(id, user, buildRequestContext(req));
  }

  @Post('end')
  @ApiOperation({ summary: 'Therapist ends the session' })
  end(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.sessions.end(id, user, buildRequestContext(req));
  }
}
