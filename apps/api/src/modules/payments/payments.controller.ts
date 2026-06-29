import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { uuidSchema } from '@suluhu/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Safaricom Daraja STK callback (public webhook). */
  @Public()
  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'M-Pesa STK Push result webhook' })
  async callback(@Body() body: unknown) {
    await this.payments.handleDarajaCallback(body);
    // Daraja expects this acknowledgement shape.
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Payment status for an appointment' })
  status(
    @Param('appointmentId', new ZodValidationPipe(uuidSchema)) appointmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.payments.getStatusForUser(appointmentId, userId);
  }
}
