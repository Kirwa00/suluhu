import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  sendMessageSchema,
  startConversationSchema,
  uuidSchema,
  type AuthUser,
  type SendMessageInput,
  type StartConversationInput,
} from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';

@ApiTags('Messaging')
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Get()
  @ApiOperation({ summary: 'List my conversations' })
  list(@CurrentUser() user: AuthUser) {
    return this.messaging.listConversations(user);
  }

  @Post()
  @ApiOperation({ summary: 'Open (or get) a conversation with a counterpart' })
  open(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(startConversationSchema)) dto: StartConversationInput,
    @Req() req: Request,
  ) {
    return this.messaging.getOrCreate(user, dto.counterpartId, buildRequestContext(req));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages (marks counterpart messages read)' })
  messages(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messaging.getMessages(user, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  send(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessageInput,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.messaging.send(user, id, dto.body, buildRequestContext(req));
  }
}
