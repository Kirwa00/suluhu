import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { slotQuerySchema, uuidSchema, type SlotQuery } from '@suluhu/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SlotsService } from './slots.service';

@ApiTags('Booking')
@Controller('therapists')
export class SlotsController {
  constructor(private readonly slots: SlotsService) {}

  @Get(':id/slots')
  @ApiOperation({ summary: 'Available booking slots for a therapist (EAT)' })
  getSlots(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Query(new ZodValidationPipe(slotQuerySchema)) query: SlotQuery,
  ) {
    return this.slots.getSlots(id, query);
  }
}
