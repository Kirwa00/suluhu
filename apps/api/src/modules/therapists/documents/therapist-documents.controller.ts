import { Controller, Get, Param, Req, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, uuidSchema } from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../../common/http/request-context';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import type { AuthUser } from '@suluhu/shared';
import { TherapistDocumentsService } from './therapist-documents.service';

/**
 * Document download, reachable by the owning therapist or an admin reviewer —
 * a different access rule than the THERAPIST-only `/therapists/me` routes, so
 * it lives in its own controller with a method-level role override.
 */
@ApiTags('Therapists')
@Controller('therapists/documents')
export class TherapistDocumentsController {
  constructor(private readonly documents: TherapistDocumentsService) {}

  @Get(':id/download')
  @Roles(UserRole.THERAPIST, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Download a credential document (owner or admin only)' })
  async download(
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @CurrentUser() requester: AuthUser,
    @Req() req: Request,
  ): Promise<StreamableFile> {
    const { buffer, mimeType, filename } = await this.documents.download(
      id,
      requester,
      buildRequestContext(req),
    );
    return new StreamableFile(buffer, {
      type: mimeType,
      disposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    });
  }
}
