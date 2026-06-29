import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  UserRole,
  contentResourceSchema,
  uuidSchema,
  type ContentResourceInput,
} from '@suluhu/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContentService } from './content.service';

@ApiTags('Psychoeducation')
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('content')
  @ApiOperation({ summary: 'Browse published resources' })
  list(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('language') language?: string,
  ) {
    return this.content.listPublished({ category, type, language });
  }

  @Get('content/:slug')
  @ApiOperation({ summary: 'Read a published resource' })
  detail(@Param('slug') slug: string) {
    return this.content.getBySlug(slug);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/content')
  @ApiOperation({ summary: 'List all resources (admin)' })
  adminList() {
    return this.content.adminList();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/content')
  @ApiOperation({ summary: 'Create a resource (admin)' })
  create(
    @CurrentUser('id') adminId: string,
    @Body(new ZodValidationPipe(contentResourceSchema)) dto: ContentResourceInput,
  ) {
    return this.content.create(adminId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/content/:id')
  @ApiOperation({ summary: 'Update a resource (admin)' })
  update(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(contentResourceSchema)) dto: ContentResourceInput,
  ) {
    return this.content.update(id, dto);
  }
}
