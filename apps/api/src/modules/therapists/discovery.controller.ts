import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { therapistSearchSchema, uuidSchema } from '@suluhu/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DiscoveryService } from './discovery.service';

/**
 * Public therapist discovery for authenticated users (primarily patients).
 * Only approved, active therapists are returned.
 */
@ApiTags('Therapist Discovery')
@Controller('therapists')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get()
  @ApiOperation({ summary: 'Search therapists with filters' })
  search(@Query(new ZodValidationPipe(therapistSearchSchema)) query: ReturnType<typeof therapistSearchSchema.parse>) {
    return this.discovery.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public therapist profile' })
  detail(@Param('id', new ZodValidationPipe(uuidSchema)) id: string) {
    return this.discovery.getPublicProfile(id);
  }
}
