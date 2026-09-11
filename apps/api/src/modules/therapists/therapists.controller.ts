import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CredentialDocumentType,
  UserRole,
  setAvailabilitySchema,
  submitCredentialsSchema,
  uploadDocumentSchema,
  type SetAvailabilityInput,
  type SubmitCredentialsInput,
} from '@suluhu/shared';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { buildRequestContext } from '../../common/http/request-context';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { TherapistsService } from './therapists.service';
import { TherapistDocumentsService } from './documents/therapist-documents.service';

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOCUMENT_MIME = /^(application\/pdf|image\/(jpeg|png))$/;

/** Therapist self-service onboarding (THERAPIST role only). */
@ApiTags('Therapists')
@Roles(UserRole.THERAPIST)
@Controller('therapists/me')
export class TherapistsController {
  constructor(
    private readonly therapists: TherapistsService,
    private readonly documents: TherapistDocumentsService,
  ) {}

  @Post('credentials')
  @ApiOperation({ summary: 'Submit or update CPB credentials & public profile' })
  submitCredentials(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(submitCredentialsSchema)) dto: SubmitCredentialsInput,
    @Req() req: Request,
  ) {
    return this.therapists.submitCredentials(userId, dto, buildRequestContext(req));
  }

  @Get('onboarding')
  @ApiOperation({ summary: 'Onboarding status & checklist' })
  onboarding(@CurrentUser('id') userId: string) {
    return this.therapists.getOnboardingStatus(userId);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get weekly availability' })
  getAvailability(@CurrentUser('id') userId: string) {
    return this.therapists.getAvailability(userId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Replace weekly availability' })
  setAvailability(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(setAvailabilitySchema)) dto: SetAvailabilityInput,
    @Req() req: Request,
  ) {
    return this.therapists.setAvailability(userId, dto, buildRequestContext(req));
  }

  @Post('documents')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a credential document (CPB license, ID, certificate, CV)' })
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_DOCUMENT_BYTES } }),
  )
  uploadDocument(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(uploadDocumentSchema)) dto: { type: CredentialDocumentType },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_DOCUMENT_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_DOCUMENT_MIME }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.documents.upload(userId, dto.type, file, buildRequestContext(req));
  }

  @Get('documents')
  @ApiOperation({ summary: 'List my uploaded credential documents' })
  listDocuments(@CurrentUser('id') userId: string) {
    return this.documents.listMine(userId);
  }
}
