import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, moodEntrySchema, type MoodEntryInput } from '@suluhu/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MoodService } from './mood.service';

@ApiTags('Mood Journal')
@Roles(UserRole.PATIENT)
@Controller('mood')
export class MoodController {
  constructor(private readonly mood: MoodService) {}

  @Post()
  @ApiOperation({ summary: 'Log a mood entry' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(moodEntrySchema)) dto: MoodEntryInput,
  ) {
    return this.mood.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mood entries with trend' })
  list(@CurrentUser('id') userId: string) {
    return this.mood.list(userId);
  }
}
