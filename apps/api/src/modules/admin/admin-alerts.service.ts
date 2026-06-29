import { Injectable } from '@nestjs/common';
import type { Paginated } from '@suluhu/shared';
import type { ClinicalAlertStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { AuditService } from '../audit/audit.service';
import type { RequestContext } from '../auth/types';

@Injectable()
export class AdminAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(params: {
    status?: ClinicalAlertStatus;
    page: number;
    pageSize: number;
  }): Promise<Paginated<unknown>> {
    const where: Prisma.ClinicalAlertWhereInput = params.status ? { status: params.status } : {};
    const skip = (params.page - 1) * params.pageSize;
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.clinicalAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.pageSize,
        include: { patient: { select: { firstName: true, lastName: true, phone: true } } },
      }),
      this.prisma.clinicalAlert.count({ where }),
    ]);
    const items = rows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      message: r.message,
      patientName: `${r.patient.firstName} ${r.patient.lastName}`.trim(),
      patientPhone: r.patient.phone,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      resolutionNote: r.resolutionNote,
    }));
    const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
    return {
      items,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async countOpen(): Promise<{ open: number }> {
    const open = await this.prisma.clinicalAlert.count({ where: { status: 'OPEN' } });
    return { open };
  }

  async acknowledge(adminId: string, id: string, ctx: RequestContext) {
    await this.ensureExists(id);
    await this.prisma.clinicalAlert.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
    });
    await this.audit.record({
      userId: adminId,
      action: 'admin.alert.acknowledge',
      resourceType: 'clinical_alert',
      resourceId: id,
      ...ctx,
    });
    return { id, status: 'ACKNOWLEDGED' };
  }

  async resolve(adminId: string, id: string, note: string | undefined, ctx: RequestContext) {
    await this.ensureExists(id);
    await this.prisma.clinicalAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedById: adminId,
        resolutionNote: note ?? null,
      },
    });
    await this.audit.record({
      userId: adminId,
      action: 'admin.alert.resolve',
      resourceType: 'clinical_alert',
      resourceId: id,
      ...ctx,
      metadata: { note },
    });
    return { id, status: 'RESOLVED' };
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.clinicalAlert.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw AppException.notFound('Alert not found');
  }
}
