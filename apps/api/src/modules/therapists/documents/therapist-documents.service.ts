import { Injectable } from '@nestjs/common';
import { UserRole, type AuthUser, type TherapistDocumentView } from '@suluhu/shared';
import type { CredentialDocumentType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditService } from '../../audit/audit.service';
import type { RequestContext } from '../../auth/types';
import { LocalDocumentStorageService } from './local-document-storage.service';

export interface DownloadedDocument {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

@Injectable()
export class TherapistDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalDocumentStorageService,
    private readonly audit: AuditService,
  ) {}

  private async profileByUser(userId: string) {
    const profile = await this.prisma.therapistProfile.findUnique({ where: { userId } });
    if (!profile) throw AppException.notFound('Therapist profile not found');
    return profile;
  }

  async upload(
    userId: string,
    type: CredentialDocumentType,
    file: { originalname: string; buffer: Buffer },
    ctx: RequestContext,
  ): Promise<TherapistDocumentView> {
    const profile = await this.profileByUser(userId);
    const { key } = await this.storage.save(profile.id, file.originalname, file.buffer);

    const doc = await this.prisma.therapistDocument.create({
      data: {
        therapistId: profile.id,
        type,
        url: key,
        originalName: file.originalname,
      },
    });

    await this.audit.record({
      userId,
      action: 'therapist_document.upload',
      resourceType: 'therapist_document',
      resourceId: doc.id,
      ...ctx,
      metadata: { type },
    });

    return this.toView(doc);
  }

  async listMine(userId: string): Promise<TherapistDocumentView[]> {
    const profile = await this.profileByUser(userId);
    const docs = await this.prisma.therapistDocument.findMany({
      where: { therapistId: profile.id },
      orderBy: { uploadedAt: 'desc' },
    });
    return docs.map((d) => this.toView(d));
  }

  /** Admin: list documents for any therapist by profile id. */
  async listForTherapist(profileId: string): Promise<TherapistDocumentView[]> {
    const docs = await this.prisma.therapistDocument.findMany({
      where: { therapistId: profileId },
      orderBy: { uploadedAt: 'desc' },
    });
    return docs.map((d) => this.toView(d));
  }

  async download(
    documentId: string,
    requester: AuthUser,
    ctx: RequestContext,
  ): Promise<DownloadedDocument> {
    const doc = await this.prisma.therapistDocument.findUnique({
      where: { id: documentId },
      include: { therapist: { select: { userId: true } } },
    });
    if (!doc) throw AppException.notFound('Document not found');

    const isOwner = doc.therapist.userId === requester.id;
    const isAdmin = requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN;
    if (!isOwner && !isAdmin) throw AppException.forbidden();

    const buffer = await this.storage.read(doc.url);

    await this.audit.record({
      userId: requester.id,
      action: 'therapist_document.download',
      resourceType: 'therapist_document',
      resourceId: doc.id,
      ...ctx,
    });

    return {
      buffer,
      mimeType: mimeFor(doc.originalName ?? doc.url),
      filename: doc.originalName ?? 'document',
    };
  }

  private toView(doc: {
    id: string;
    type: string;
    originalName: string | null;
    uploadedAt: Date;
  }): TherapistDocumentView {
    return {
      id: doc.id,
      type: doc.type as CredentialDocumentType,
      originalName: doc.originalName,
      uploadedAt: doc.uploadedAt.toISOString(),
    };
  }
}

function mimeFor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}
